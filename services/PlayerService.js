const Player = require('../models/Player');

class PlayerService {
    // Create a new player
    async createPlayer(playerData) {
        try {
            const player = new Player(playerData);
            await player.save();
            console.log(`✅ Player created: ${player.name} (${player.playerId})`);
            return player;
        } catch (error) {
            console.error('❌ Error creating player:', error);
            throw error;
        }
    }

    // Get player by ID
    async getPlayerById(playerId) {
        try {
            const player = await Player.findOne({ playerId });
            return player;
        } catch (error) {
            console.error('❌ Error getting player by ID:', error);
            throw error;
        }
    }

    // Get player by name
    async getPlayerByName(name) {
        try {
            const player = await Player.findOne({ name });
            return player;
        } catch (error) {
            console.error('❌ Error getting player by name:', error);
            throw error;
        }
    }

    // Update player
    async updatePlayer(playerId, updateData) {
        try {
            const player = await Player.findOneAndUpdate(
                { playerId },
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return player;
        } catch (error) {
            console.error('❌ Error updating player:', error);
            throw error;
        }
    }

    // Delete player
    async deletePlayer(playerId) {
        try {
            const result = await Player.findOneAndDelete({ playerId });
            console.log(`✅ Player deleted: ${playerId}`);
            return result;
        } catch (error) {
            console.error('❌ Error deleting player:', error);
            throw error;
        }
    }

    // Get online players
    async getOnlinePlayers() {
        try {
            const players = await Player.find({ isOnline: true })
                .select('playerId name level health maxHealth mana maxMana currentRoom position')
                .sort({ level: -1 });
            return players;
        } catch (error) {
            console.error('❌ Error getting online players:', error);
            throw error;
        }
    }

    // Get players in room
    async getPlayersInRoom(roomId) {
        try {
            const players = await Player.find({ 
                currentRoom: roomId, 
                isOnline: true 
            })
            .select('playerId name level health maxHealth mana maxMana position')
            .sort({ level: -1 });
            return players;
        } catch (error) {
            console.error('❌ Error getting players in room:', error);
            throw error;
        }
    }

    // Get leaderboard
    async getLeaderboard(type = 'power', limit = 100) {
        try {
            let sortField = {};
            
            switch (type) {
                case 'power':
                    sortField = { totalPower: -1 };
                    break;
                case 'level':
                    sortField = { level: -1 };
                    break;
                case 'gold':
                    sortField = { 'resources.gold': -1 };
                    break;
                case 'arena':
                    sortField = { 'arenaStats.points': -1 };
                    break;
                default:
                    sortField = { totalPower: -1 };
            }

            const players = await Player.find({ isOnline: true })
                .select('playerId name level totalPower resources arenaStats')
                .sort(sortField)
                .limit(limit);
            
            return players;
        } catch (error) {
            console.error('❌ Error getting leaderboard:', error);
            throw error;
        }
    }

    // Add experience to player
    async addExperience(playerId, amount) {
        try {
            const player = await Player.findOne({ playerId });
            if (!player) {
                throw new Error('Player not found');
            }

            player.addExperience(amount);
            await player.save();
            
            return player;
        } catch (error) {
            console.error('❌ Error adding experience:', error);
            throw error;
        }
    }

    // Add item to player inventory
    async addItem(playerId, itemId, quantity = 1) {
        try {
            const player = await Player.findOne({ playerId });
            if (!player) {
                throw new Error('Player not found');
            }

            player.addItem(itemId, quantity);
            await player.save();
            
            return player;
        } catch (error) {
            console.error('❌ Error adding item:', error);
            throw error;
        }
    }

    // Remove item from player inventory
    async removeItem(playerId, itemId, quantity = 1) {
        try {
            const player = await Player.findOne({ playerId });
            if (!player) {
                throw new Error('Player not found');
            }

            const success = player.removeItem(itemId, quantity);
            if (success) {
                await player.save();
            }
            
            return { success, player };
        } catch (error) {
            console.error('❌ Error removing item:', error);
            throw error;
        }
    }

    // Update player online status
    async updateOnlineStatus(playerId, isOnline) {
        try {
            const updateData = { 
                isOnline,
                lastLogin: isOnline ? new Date() : null,
                lastLogout: !isOnline ? new Date() : null
            };

            const player = await Player.findOneAndUpdate(
                { playerId },
                { $set: updateData },
                { new: true }
            );
            
            return player;
        } catch (error) {
            console.error('❌ Error updating online status:', error);
            throw error;
        }
    }

    // Get player statistics
    async getPlayerStats(playerId) {
        try {
            const player = await Player.findOne({ playerId })
                .select('level experience health maxHealth mana maxMana stats resources arenaStats totalPower');
            
            if (!player) {
                throw new Error('Player not found');
            }

            return {
                level: player.level,
                experience: player.experience,
                health: player.health,
                maxHealth: player.maxHealth,
                mana: player.mana,
                maxMana: player.maxMana,
                stats: player.stats,
                resources: player.resources,
                arenaStats: player.arenaStats,
                totalPower: player.totalPower
            };
        } catch (error) {
            console.error('❌ Error getting player stats:', error);
            throw error;
        }
    }

    // Search players
    async searchPlayers(query, limit = 20) {
        try {
            const players = await Player.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { playerId: { $regex: query, $options: 'i' } }
                ]
            })
            .select('playerId name level totalPower isOnline')
            .limit(limit);
            
            return players;
        } catch (error) {
            console.error('❌ Error searching players:', error);
            throw error;
        }
    }

    // Get player count
    async getPlayerCount() {
        try {
            const totalPlayers = await Player.countDocuments();
            const onlinePlayers = await Player.countDocuments({ isOnline: true });
            
            return { totalPlayers, onlinePlayers };
        } catch (error) {
            console.error('❌ Error getting player count:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkUpdatePlayers(updates) {
        try {
            const bulkOps = updates.map(update => ({
                updateOne: {
                    filter: { playerId: update.playerId },
                    update: { $set: update.data }
                }
            }));

            const result = await Player.bulkWrite(bulkOps);
            return result;
        } catch (error) {
            console.error('❌ Error bulk updating players:', error);
            throw error;
        }
    }
}

module.exports = new PlayerService();
