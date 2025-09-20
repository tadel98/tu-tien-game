const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Import configurations
const config = require('./config/production');
const dbConnection = require('./database/connection');
const PlayerService = require('./services/PlayerService');
const ServerGameLogic = require('./server-game-logic');

// Import logging
const logger = require('./utils/logger');

// Import security middleware
const securityMiddleware = require('./middleware/security');
const validationMiddleware = require('./middleware/validation');

// Import authentication
const authRoutes = require('./routes/auth');
const { authMiddleware, optionalAuth } = require('./middleware/auth');

// Import monitoring
const monitoring = require('./utils/monitoring');

// Cluster mode for production
if (config.server.cluster && cluster.isMaster) {
    const numCPUs = config.server.workers;
    logger.info(`Master process ${process.pid} is running`);
    logger.info(`Starting ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

    cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`);
    });

    return;
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet(config.security.helmet));
app.use(compression());

// Rate limiting
const limiter = rateLimit(config.security.rateLimit);
app.use('/api/', limiter);

// CORS configuration
app.use(cors(config.security.cors));

// Authentication routes
app.use('/api/auth', authRoutes);

// Logging middleware
if (config.logging.console.enabled) {
    app.use(morgan(config.logging.format));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('.', {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Security middleware
app.use(securityMiddleware);

// Validation middleware
app.use(validationMiddleware);

// Game Server State
const gameState = {
    activePlayers: new Map(),
    rooms: new Map(),
    gameLogic: new ServerGameLogic(),
    globalState: {
        serverStartTime: Date.now(),
        totalPlayers: 0,
        onlinePlayers: 0,
        serverId: process.pid
    }
};

// Room Data Structure
class Room {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.players = new Set();
        this.maxPlayers = config.game.maxPlayersPerRoom;
        this.createdAt = Date.now();
        this.lastActivity = Date.now();
    }

    addPlayer(socketId) {
        if (this.players.size < this.maxPlayers) {
            this.players.add(socketId);
            this.lastActivity = Date.now();
            return true;
        }
        return false;
    }

    removePlayer(socketId) {
        const removed = this.players.delete(socketId);
        if (removed) {
            this.lastActivity = Date.now();
        }
        return removed;
    }

    getPlayerCount() {
        return this.players.size;
    }

    isActive() {
        return Date.now() - this.lastActivity < 300000; // 5 minutes
    }
}

// Socket.IO with production configuration
const io = socketIo(server, {
    cors: config.security.cors,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    allowEIO3: true
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await dbConnection.healthCheck();
        const playerCounts = await PlayerService.getPlayerCount();
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            server: {
                pid: process.pid,
                uptime: uptime,
                memory: memoryUsage,
                cpu: process.cpuUsage()
            },
            database: dbHealth,
            players: playerCounts,
            rooms: {
                total: gameState.rooms.size,
                active: Array.from(gameState.rooms.values()).filter(room => room.isActive()).length
            }
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        const metrics = await monitoring.getMetrics();
        res.json(metrics);
    } catch (error) {
        logger.error('Metrics collection failed:', error);
        res.status(500).json({ error: 'Metrics collection failed' });
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
                playerCount: room.getPlayerCount(),
                isActive: room.isActive()
            })),
            server: {
                pid: process.pid,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        });
    } catch (error) {
        logger.error('Stats collection failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create main room
const mainRoom = new Room('main_room', 'Khu Vực Chính');
gameState.rooms.set('main_room', mainRoom);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`Player connected: ${socket.id}`);

    // Connection validation
    if (gameState.activePlayers.size >= config.game.maxConnections) {
        logger.warn(`Max connections reached, rejecting ${socket.id}`);
        socket.emit('error', { message: 'Server is full' });
        socket.disconnect();
        return;
    }

    // Player join
    socket.on('player_join', async (playerData) => {
        try {
            logger.info('Player joining:', playerData.name);
            
            // Validate player data
            if (!playerData.name || playerData.name.length > 50) {
                socket.emit('error', { message: 'Invalid player name' });
                return;
            }

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
                logger.info(`New player created: ${player.name} (${player.playerId})`);
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
                logger.info(`Player data updated: ${player.name} (${player.playerId})`);
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
            
            logger.info(`Player ${player.name} joined successfully`);
            
        } catch (error) {
            logger.error('Error handling player join:', error);
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

            // Validate command data
            if (!data.command || typeof data.command !== 'string') {
                socket.emit('command_error', { message: 'Invalid command' });
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
            logger.error('Error processing player command:', error);
            socket.emit('command_error', { message: 'Command failed' });
        }
    });

    // Player movement
    socket.on('player_move', async (position) => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (!player) return;

            // Validate position
            if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }

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
            logger.error('Error handling player movement:', error);
        }
    });

    // Chat message
    socket.on('chat_message', async (message) => {
        try {
            const player = gameState.activePlayers.get(socket.id);
            if (!player) return;

            // Validate message
            if (!message || typeof message !== 'string' || message.length > 500) {
                return;
            }

            // Sanitize message
            const sanitizedMessage = message.trim().substring(0, 500);

            const chatData = {
                playerId: player.playerId,
                playerName: player.name,
                message: sanitizedMessage,
                timestamp: Date.now()
            };

            // Broadcast to room
            io.to(player.currentRoom).emit('chat_message', chatData);
        } catch (error) {
            logger.error('Error handling chat message:', error);
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
                
                logger.info(`Player ${player.name} disconnected`);
            }
        } catch (error) {
            logger.error('Error handling disconnect:', error);
        }
    });
});

// Update player counts from database
async function updatePlayerCounts() {
    try {
        const counts = await PlayerService.getPlayerCount();
        gameState.globalState.totalPlayers = counts.totalPlayers;
        gameState.globalState.onlinePlayers = counts.onlinePlayers;
        
        logger.info(`Players: ${counts.onlinePlayers}/${counts.totalPlayers} online`);
    } catch (error) {
        logger.error('Error updating player counts:', error);
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
        logger.info(`Auto-saved ${players.length} players`);
    } catch (error) {
        logger.error('Error auto-saving players:', error);
    }
}, config.game.autoSaveInterval);

// Cleanup inactive rooms
setInterval(() => {
    const inactiveRooms = Array.from(gameState.rooms.values())
        .filter(room => !room.isActive() && room.id !== 'main_room');
    
    inactiveRooms.forEach(room => {
        gameState.rooms.delete(room.id);
        logger.info(`Cleaned up inactive room: ${room.id}`);
    });
}, 300000); // Every 5 minutes

// Initialize server with database connection
async function startServer() {
    try {
        // Connect to MongoDB
        await dbConnection.connect();
        
        // Initialize monitoring
        if (config.monitoring.enabled) {
            await monitoring.initialize();
        }
        
        // Start HTTP server
        const PORT = config.server.port;
        const HOST = config.server.host;
        
        server.listen(PORT, HOST, () => {
            logger.info(`🚀 Tu Tiên Production Server running on ${HOST}:${PORT}`);
            logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
            logger.info(`📈 Metrics: http://${HOST}:${PORT}/metrics`);
            logger.info(`📈 Database stats: http://${HOST}:${PORT}/stats`);
            logger.info(`🎮 Game client: http://${HOST}:${PORT}/game-multiplayer.html`);
            logger.info(`🗄️ Database: MongoDB connected`);
            logger.info(`👥 Process ID: ${process.pid}`);
            
            // Update player counts
            updatePlayerCounts();
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await dbConnection.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await dbConnection.disconnect();
    process.exit(0);
});

// Start the server
startServer();

module.exports = { app, server, io, gameState };
