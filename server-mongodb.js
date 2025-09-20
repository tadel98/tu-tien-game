const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ServerGameLogic = require('./server-game-logic');
const dbConnection = require('./database/connection');
const PlayerService = require('./services/PlayerService');

// Import authentication
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Authentication routes
app.use('/api/auth', authRoutes);

// Game Server State (Now using MongoDB for persistent data)
const gameState = {
    // In-memory cache for active players
    activePlayers: new Map(), // socketId -> playerData (cached from DB)
    rooms: new Map(),         // roomId -> roomData
    gameLogic: new ServerGameLogic(),
    globalState: {
        serverStartTime: Date.now(),
        totalPlayers: 0,
        onlinePlayers: 0
    }
};

// Room Data Structure
class Room {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.players = new Set();
        this.maxPlayers = 50;
        this.createdAt = Date.now();
    }

    addPlayer(socketId) {
        if (this.players.size < this.maxPlayers) {
            this.players.add(socketId);
            return true;
        }
        return false;
    }

    removePlayer(socketId) {
        return this.players.delete(socketId);
    }

    getPlayerCount() {
        return this.players.size;
    }
}

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await dbConnection.healthCheck();
        const playerCounts = await PlayerService.getPlayerCount();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbHealth,
            players: playerCounts,
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Database stats endpoint
app.get('/stats', async (req, res) => {
    try {
        const dbStats = await dbConnection.getStats();
        const playerCounts = await PlayerService.getPlayerCount();
        
        res.json({
            database: dbStats,
            players: playerCounts,
            activeConnections: gameState.activePlayers.size,
            rooms: Array.from(gameState.rooms.values()).map(room => ({
                id: room.id,
                name: room.name,
                playerCount: room.getPlayerCount()
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create main room
const mainRoom = new Room('main_room', 'Khu Vực Chính');
gameState.rooms.set('main_room', mainRoom);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Player join
    socket.on('player_join', async (playerData) => {
        try {
            console.log('Player joining:', playerData.name);
            
            // Check if player exists in database
            let player = await PlayerService.getPlayerById(playerData.id || playerData.playerId);
            
            if (!player) {
                // Create new player in database
                const newPlayerData = {
                    playerId: playerData.id || uuidv4(),
                    name: playerData.name || 'Người Chơi',
                    level: playerData.level || 1,
                    health: playerData.health || 100,
                    maxHealth: playerData.maxHealth || 100,
                    mana: playerData.mana || 50,
                    maxMana: playerData.maxMana || 50,
                    cultivation: playerData.cultivation || { realm: 'Phàm Nhân', stage: 1, progress: 0 },
                    stats: playerData.stats || { attack: 10, defense: 5, speed: 8, intelligence: 5, luck: 5 },
                    pet: playerData.pet || { petId: null },
                    wife: playerData.wife || { wifeId: null },
                    inventory: playerData.inventory || { items: [], equipment: {} },
                    resources: playerData.resources || { gold: 100, spirit_stones: 0, cultivation_pills: 0, kim_nguyen_bao: 0 }
                };
                
                player = await PlayerService.createPlayer(newPlayerData);
                console.log(`✅ New player created: ${player.name} (${player.playerId})`);
            } else {
                // Update existing player data
                const updateData = {
                    name: playerData.name || player.name,
                    level: playerData.level || player.level,
                    health: playerData.health || player.health,
                    maxHealth: playerData.maxHealth || player.maxHealth,
                    mana: playerData.mana || player.mana,
                    maxMana: playerData.maxMana || player.maxMana,
                    cultivation: playerData.cultivation || player.cultivation,
                    stats: playerData.stats || player.stats,
                    pet: playerData.pet || player.pet,
                    wife: playerData.wife || player.wife,
                    inventory: playerData.inventory || player.inventory,
                    resources: playerData.resources || player.resources
                };
                
                player = await PlayerService.updatePlayer(player.playerId, updateData);
                console.log(`✅ Player data updated: ${player.name} (${player.playerId})`);
            }
            
            // Update online status
            await PlayerService.updateOnlineStatus(player.playerId, true);
            
            // Cache player in memory for fast access
            gameState.activePlayers.set(socket.id, player);
            
            // Add to main room
            const mainRoom = gameState.rooms.get('main_room');
            if (mainRoom) {
                mainRoom.addPlayer(socket.id);
            }
            
            // Send player data back
            socket.emit('player_data', {
                id: player.playerId,
                name: player.name,
                level: player.level,
                health: player.health,
                maxHealth: player.maxHealth,
                mana: player.mana,
                maxMana: player.maxMana,
                cultivation: player.cultivation,
                stats: player.stats,
                pet: player.pet,
                wife: player.wife,
                inventory: player.inventory,
                resources: player.resources,
                roomId: player.currentRoom
            });
            
            // Notify other players
            socket.to('main_room').emit('player_joined', {
                id: player.playerId,
                name: player.name,
                level: player.level
            });
            
            // Send room players list
            const roomPlayers = Array.from(mainRoom.players)
                .map(id => gameState.activePlayers.get(id))
                .filter(p => p && p.isOnline)
                .map(p => ({
                    id: p.playerId,
                    name: p.name,
                    level: p.level,
                    health: p.health,
                    maxHealth: p.maxHealth,
                    power: p.totalPower
                }));
            
            socket.emit('room_players', roomPlayers);
            
            // Update player counts
            await updatePlayerCounts();
            
            console.log(`✅ Player ${player.name} joined successfully`);
            
        } catch (error) {
            console.error('❌ Error handling player join:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    // Player command
    socket.on('player_command', async (data) => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (!player) {
                socket.emit('command_error', { message: 'Player not found' });
                return;
            }

            // Set player reference for game logic
            gameState.gameLogic.getPlayer = (playerId) => {
                return gameState.activePlayers.get(playerId);
            };

            const result = gameState.gameLogic.processCommand(socket.id, data.command, data.data);
            
            if (result.success) {
                // Save player data to database
                await PlayerService.updatePlayer(player.playerId, {
                    health: player.health,
                    maxHealth: player.maxHealth,
                    mana: player.mana,
                    maxMana: player.maxMana,
                    level: player.level,
                    experience: player.experience,
                    cultivation: player.cultivation,
                    stats: player.stats,
                    resources: player.resources,
                    pet: player.pet,
                    wife: player.wife,
                    inventory: player.inventory,
                    arenaStats: player.arenaStats,
                    activeQuests: player.activeQuests
                });
                
                // Send result back to player
                socket.emit('command_result', result);
                
                // Broadcast relevant updates to room
                const roomPlayers = Array.from(gameState.rooms.get(player.currentRoom).players)
                    .map(id => gameState.activePlayers.get(id))
                    .filter(p => p && p.isOnline);

                // Send different events based on command type
                switch (data.command) {
                    case 'use_item':
                    case 'cultivate':
                    case 'feed_pet':
                    case 'give_gift':
                        // Personal actions - only notify the player
                        break;
                    case 'obtain_pet':
                    case 'obtain_wife':
                        // Companion actions - notify room
                        socket.to(player.currentRoom).emit('player_companion_update', {
                            playerId: player.playerId,
                            playerName: player.name,
                            type: data.command,
                            result: result
                        });
                        break;
                    case 'accept_quest':
                    case 'complete_quest':
                        // Quest actions - notify room
                        socket.to(player.currentRoom).emit('player_quest_update', {
                            playerId: player.playerId,
                            playerName: player.name,
                            type: data.command,
                            result: result
                        });
                        break;
                    case 'join_guild':
                    case 'contribute_guild':
                        // Guild actions - notify room
                        socket.to(player.currentRoom).emit('player_guild_update', {
                            playerId: player.playerId,
                            playerName: player.name,
                            type: data.command,
                            result: result
                        });
                        break;
                }

                // Always send player state update
                socket.to(player.currentRoom).emit('player_state_update', {
                    id: player.playerId,
                    name: player.name,
                    level: player.level,
                    health: player.health,
                    maxHealth: player.maxHealth,
                    power: player.totalPower,
                    lastUpdate: Date.now()
                });
            } else {
                socket.emit('command_error', result);
            }
        } catch (error) {
            console.error('Error processing player command:', error);
            socket.emit('command_error', { message: 'Command failed' });
        }
    });

    // Player movement
    socket.on('player_move', async (position) => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (!player) return;

            player.position = position;
            player.lastUpdate = Date.now();

            // Save position to database
            await PlayerService.updatePlayer(player.playerId, {
                position: position,
                lastUpdate: new Date()
            });

            // Broadcast movement to room
            socket.to(player.currentRoom).emit('player_moved', {
                id: player.playerId,
                name: player.name,
                position: position
            });
        } catch (error) {
            console.error('Error handling player movement:', error);
        }
    });

    // Chat message
    socket.on('chat_message', async (message) => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (!player) return;

            const chatData = {
                playerId: player.playerId,
                playerName: player.name,
                message: message,
                timestamp: Date.now()
            };

            // Broadcast to room
            io.to(player.currentRoom).emit('chat_message', chatData);
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });

    // Disconnect
    socket.on('disconnect', async () => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (player) {
                // Update online status in database
                await PlayerService.updateOnlineStatus(player.playerId, false);
                
                // Remove from room
                const room = gameState.rooms.get(player.currentRoom);
                if (room) {
                    room.removePlayer(socket.id);
                }
                
                // Notify other players
                socket.to(player.currentRoom).emit('player_left', {
                    id: player.playerId,
                    name: player.name
                });
                
                // Remove from active players
                gameState.activePlayers.delete(socket.id);
                
                // Update player counts
                await updatePlayerCounts();
                
                console.log(`Player ${player.name} disconnected`);
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});

// Update player counts from database
async function updatePlayerCounts() {
    try {
        const counts = await PlayerService.getPlayerCount();
        gameState.globalState.totalPlayers = counts.totalPlayers;
        gameState.globalState.onlinePlayers = counts.onlinePlayers;
        
        console.log(`📊 Players: ${counts.onlinePlayers}/${counts.totalPlayers} online`);
    } catch (error) {
        console.error('❌ Error updating player counts:', error);
    }
}

// Auto-save player data periodically
setInterval(async () => {
    try {
        const players = Array.from(gameState.activePlayers.values());
        const updatePromises = players.map(player => 
            PlayerService.updatePlayer(player.playerId, {
                health: player.health,
                maxHealth: player.maxHealth,
                mana: player.mana,
                maxMana: player.maxMana,
                level: player.level,
                experience: player.experience,
                cultivation: player.cultivation,
                stats: player.stats,
                resources: player.resources,
                pet: player.pet,
                wife: player.wife,
                inventory: player.inventory,
                arenaStats: player.arenaStats,
                activeQuests: player.activeQuests,
                lastUpdate: new Date()
            })
        );
        
        await Promise.all(updatePromises);
        console.log(`💾 Auto-saved ${players.length} players`);
    } catch (error) {
        console.error('❌ Error auto-saving players:', error);
    }
}, 30000); // Every 30 seconds

// Initialize server with database connection
async function startServer() {
    try {
        // Connect to MongoDB
        await dbConnection.connect();
        
        // Start HTTP server
        const PORT = process.env.PORT || 3000;
        
        server.listen(PORT, () => {
            console.log(`🚀 Tu Tiên Multiplayer Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📈 Database stats: http://localhost:${PORT}/stats`);
            console.log(`🎮 Game client: http://localhost:${PORT}/game-multiplayer.html`);
            console.log(`🗄️ Database: MongoDB connected`);
            
            // Update player counts
            updatePlayerCounts();
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = { app, server, io, gameState };
