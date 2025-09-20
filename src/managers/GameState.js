/**
 * GameState - Quản lý toàn bộ trạng thái của game
 */
export class GameState {
    constructor() {
        // Thông tin cơ bản của người chơi
        this.player = {
            name: 'Tu Sĩ Mới',
            level: 1,
            experience: 0,
            experienceToNext: 100,
            
            // Thuộc tính cơ bản
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            stamina: 100,
            maxStamina: 100,
            
            // Chỉ số tu luyện
            cultivation: {
                realm: 'Phàm Nhân',
                stage: 1,
                progress: 0,
                progressToNext: 1000
            },
            
            // Thuộc tính chiến đấu
            stats: {
                attack: 10,
                defense: 5,
                speed: 8,
                intelligence: 5,
                luck: 5
            },
            
            // Vị trí trong game world
            position: {
                x: 600,
                y: 400,
                map: 'starting_village'
            }
        };
        
        // Tài nguyên
        this.resources = {
            gold: 100,
            spirit_stones: 0,
            cultivation_pills: 0,
            experience_pills: 0
        };
        
        // Kho đồ
        this.inventory = {
            items: [],
            maxSlots: 20,
            equipment: {
                weapon: null,
                armor: null,
                accessory: null,
                boots: null
            }
        };
        
        // Kỹ năng và pháp thuật
        this.skills = {
            combat: [],
            cultivation: [],
            passive: []
        };
        
        // Quest và nhiệm vụ
        this.quests = {
            active: [],
            completed: [],
            available: []
        };
        
        // Cài đặt game
        this.settings = {
            autoSave: true,
            sound: true,
            music: true,
            volume: 0.7,
            language: 'vi'
        };
        
        // Game time
        this.gameTime = {
            totalPlayTime: 0,
            sessionStartTime: Date.now(),
            gameSpeed: 1.0
        };
        
        // Arena system
        this.arena = {
            // Player arena stats
            playerStats: {
                rank: 'Chưa Xếp Hạng',
                points: 1000,
                wins: 0,
                losses: 0,
                winStreak: 0,
                bestWinStreak: 0,
                totalMatches: 0,
                lastMatchTime: 0,
                seasonStartTime: Date.now(),
                highestRank: 'Chưa Xếp Hạng',
                highestPoints: 1000
            },
            
            // Leaderboard (top players)
            leaderboard: [
                // { playerName: 'Tên người chơi', points: 1500, rank: 'Vàng I', level: 15, wins: 25, losses: 5 },
            ],
            
            // Current season info
            season: {
                number: 1,
                startTime: Date.now(),
                endTime: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
                name: 'Mùa Khởi Đầu',
                description: 'Mùa giải đầu tiên của đấu trường tu tiên'
            },
            
            // Match history
            matchHistory: [],
            
            // Available match types
            availableMatchTypes: ['RANKED', 'PRACTICE'],
            
            // Cooldowns
            cooldowns: {
                RANKED: 0,
                PRACTICE: 0,
                TOURNAMENT: 0
            }
        };
        
        // Event listeners
        this.listeners = new Map();
    }

    /**
     * Khởi tạo game mới
     */
    initializeNewGame() {
        console.log('Khởi tạo game mới...');
        
        // Reset về trạng thái ban đầu
        this.player.name = 'Tu Sĩ Mới';
        this.player.level = 1;
        this.player.experience = 0;
        
        // Thêm một số item cơ bản
        this.addItem({
            id: 'basic_sword',
            name: 'Kiếm Sắt Cơ Bản',
            type: 'weapon',
            stats: { attack: 5 },
            rarity: 'common'
        });
        
        this.addItem({
            id: 'basic_robe',
            name: 'Áo Vải Thô',
            type: 'armor',
            stats: { defense: 3 },
            rarity: 'common'
        });
        
        // Thêm quest đầu tiên
        this.addQuest({
            id: 'tutorial_1',
            name: 'Bước Đầu Tu Luyện',
            description: 'Học cách sử dụng giao diện game cơ bản',
            type: 'tutorial',
            objectives: [
                { text: 'Mở menu nhân vật', completed: false },
                { text: 'Kiểm tra kho đồ', completed: false }
            ],
            rewards: {
                experience: 50,
                gold: 20
            }
        });
        
        this.notifyListeners('gameStateChanged', { type: 'newGame' });
    }

    /**
     * Load dữ liệu từ save file
     */
    loadFromData(data) {
        try {
            // Merge data with current state
            Object.assign(this.player, data.player || {});
            Object.assign(this.resources, data.resources || {});
            Object.assign(this.inventory, data.inventory || {});
            Object.assign(this.skills, data.skills || {});
            Object.assign(this.quests, data.quests || {});
            Object.assign(this.settings, data.settings || {});
            Object.assign(this.gameTime, data.gameTime || {});
            
            console.log('Đã load dữ liệu game thành công');
            this.notifyListeners('gameStateChanged', { type: 'loaded' });
        } catch (error) {
            console.error('Lỗi load dữ liệu:', error);
            throw error;
        }
    }

    /**
     * Export dữ liệu để save
     */
    exportData() {
        return {
            player: this.player,
            resources: this.resources,
            inventory: this.inventory,
            skills: this.skills,
            quests: this.quests,
            settings: this.settings,
            gameTime: {
                ...this.gameTime,
                totalPlayTime: this.getTotalPlayTime()
            },
            version: '1.0.0',
            saveTime: Date.now()
        };
    }

    /**
     * Thêm experience cho player
     */
    addExperience(amount) {
        this.player.experience += amount;
        
        // Kiểm tra level up
        while (this.player.experience >= this.player.experienceToNext) {
            this.levelUp();
        }
        
        this.notifyListeners('experienceGained', { amount });
    }

    /**
     * Level up
     */
    levelUp() {
        this.player.experience -= this.player.experienceToNext;
        this.player.level++;
        this.player.experienceToNext = Math.floor(this.player.experienceToNext * 1.2);
        
        // Tăng stats khi level up
        this.player.maxHealth += 10;
        this.player.health = this.player.maxHealth;
        this.player.maxMana += 5;
        this.player.mana = this.player.maxMana;
        this.player.stats.attack += 2;
        this.player.stats.defense += 1;
        
        console.log(`Level up! Cấp độ hiện tại: ${this.player.level}`);
        this.notifyListeners('levelUp', { newLevel: this.player.level });
    }

    /**
     * Thêm tài nguyên
     */
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            this.notifyListeners('resourceChanged', { type, amount, newValue: this.resources[type] });
        }
    }

    /**
     * Trừ tài nguyên
     */
    subtractResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            if (this.resources[type] >= amount) {
                this.resources[type] -= amount;
                this.notifyListeners('resourceChanged', { type, amount: -amount, newValue: this.resources[type] });
                return true;
            }
        }
        return false;
    }

    /**
     * Thêm item vào kho
     */
    addItem(item) {
        if (this.inventory.items.length < this.inventory.maxSlots) {
            this.inventory.items.push({
                ...item,
                id: item.id || this.generateItemId(),
                quantity: item.quantity || 1,
                addedTime: Date.now()
            });
            this.notifyListeners('itemAdded', { item });
            return true;
        }
        return false; // Kho đầy
    }

    /**
     * Xóa item khỏi kho
     */
    removeItem(itemId, quantity = 1) {
        const itemIndex = this.inventory.items.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            const item = this.inventory.items[itemIndex];
            if (item.quantity <= quantity) {
                this.inventory.items.splice(itemIndex, 1);
            } else {
                item.quantity -= quantity;
            }
            this.notifyListeners('itemRemoved', { itemId, quantity });
            return true;
        }
        return false;
    }

    /**
     * Trang bị item
     */
    equipItem(itemId) {
        const item = this.inventory.items.find(item => item.id === itemId);
        if (item && item.type in this.inventory.equipment) {
            // Unequip current item if any
            if (this.inventory.equipment[item.type]) {
                this.unequipItem(item.type);
            }
            
            // Equip new item
            this.inventory.equipment[item.type] = item;
            this.removeItem(itemId, 1);
            this.calculatePlayerStats();
            this.notifyListeners('itemEquipped', { item });
            return true;
        }
        return false;
    }

    /**
     * Tháo trang bị
     */
    unequipItem(slotType) {
        const item = this.inventory.equipment[slotType];
        if (item) {
            this.inventory.equipment[slotType] = null;
            this.addItem(item);
            this.calculatePlayerStats();
            this.notifyListeners('itemUnequipped', { item });
            return true;
        }
        return false;
    }

    /**
     * Tính toán lại stats của player dựa trên equipment
     */
    calculatePlayerStats() {
        // Reset stats to base values
        const baseStats = {
            attack: 10 + (this.player.level - 1) * 2,
            defense: 5 + (this.player.level - 1),
            speed: 8,
            intelligence: 5,
            luck: 5
        };
        
        // Add equipment stats
        Object.values(this.inventory.equipment).forEach(item => {
            if (item && item.stats) {
                Object.keys(item.stats).forEach(stat => {
                    if (baseStats.hasOwnProperty(stat)) {
                        baseStats[stat] += item.stats[stat];
                    }
                });
            }
        });
        
        this.player.stats = baseStats;
        this.notifyListeners('statsChanged', { stats: this.player.stats });
    }

    /**
     * Thêm quest
     */
    addQuest(quest) {
        this.quests.available.push(quest);
        this.notifyListeners('questAdded', { quest });
    }

    /**
     * Nhận quest
     */
    acceptQuest(questId) {
        const questIndex = this.quests.available.findIndex(q => q.id === questId);
        if (questIndex > -1) {
            const quest = this.quests.available.splice(questIndex, 1)[0];
            this.quests.active.push(quest);
            this.notifyListeners('questAccepted', { quest });
            return true;
        }
        return false;
    }

    /**
     * Hoàn thành quest
     */
    completeQuest(questId) {
        const questIndex = this.quests.active.findIndex(q => q.id === questId);
        if (questIndex > -1) {
            const quest = this.quests.active.splice(questIndex, 1)[0];
            this.quests.completed.push(quest);
            
            // Give rewards
            if (quest.rewards) {
                if (quest.rewards.experience) {
                    this.addExperience(quest.rewards.experience);
                }
                if (quest.rewards.gold) {
                    this.addResource('gold', quest.rewards.gold);
                }
                if (quest.rewards.items) {
                    quest.rewards.items.forEach(item => this.addItem(item));
                }
            }
            
            this.notifyListeners('questCompleted', { quest });
            return true;
        }
        return false;
    }

    /**
     * Update game time
     */
    update(deltaTime) {
        // Update play time
        this.gameTime.totalPlayTime += deltaTime * this.gameTime.gameSpeed;
        
        // Auto save every 5 minutes
        if (this.settings.autoSave && this.gameTime.totalPlayTime % 300000 < deltaTime) {
            this.autoSave();
        }
    }

    /**
     * Auto save
     */
    autoSave() {
        try {
            const gameData = this.exportData();
            localStorage.setItem('mygame_autosave', JSON.stringify(gameData));
            console.log('Auto save completed');
        } catch (error) {
            console.error('Auto save failed:', error);
        }
    }

    /**
     * Get total play time
     */
    getTotalPlayTime() {
        const sessionTime = Date.now() - this.gameTime.sessionStartTime;
        return this.gameTime.totalPlayTime + sessionTime;
    }

    /**
     * Generate unique item ID
     */
    generateItemId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Event system
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Arena System Methods
     */
    
    /**
     * Update arena rank based on points
     */
    updateArenaRank() {
        const { ArenaUtils } = require('../core/GameData.js');
        const newRank = ArenaUtils.getRankByPoints(this.arena.playerStats.points);
        const oldRank = this.arena.playerStats.rank;
        
        if (newRank.name !== oldRank) {
            this.arena.playerStats.rank = newRank.name;
            
            // Update highest rank if improved
            if (newRank.tier > this.getRankTier(this.arena.playerStats.highestRank)) {
                this.arena.playerStats.highestRank = newRank.name;
            }
            
            // Update highest points
            if (this.arena.playerStats.points > this.arena.playerStats.highestPoints) {
                this.arena.playerStats.highestPoints = this.arena.playerStats.points;
            }
            
            this.notifyListeners('arenaRankChanged', { 
                oldRank, 
                newRank: newRank.name, 
                rankData: newRank 
            });
        }
    }
    
    /**
     * Get rank tier number
     */
    getRankTier(rankName) {
        const { arenaRanks } = require('../core/GameData.js');
        const rank = arenaRanks.find(r => r.name === rankName);
        return rank ? rank.tier : 0;
    }
    
    /**
     * Add arena match result
     */
    addArenaMatchResult(result) {
        const match = {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            opponentName: result.opponentName,
            opponentLevel: result.opponentLevel,
            matchType: result.matchType,
            result: result.result, // 'win' or 'loss'
            pointsChange: result.pointsChange,
            pointsBefore: result.pointsBefore,
            pointsAfter: result.pointsAfter,
            duration: result.duration || 0,
            playerPower: result.playerPower,
            opponentPower: result.opponentPower
        };
        
        this.arena.matchHistory.unshift(match);
        
        // Keep only last 50 matches
        if (this.arena.matchHistory.length > 50) {
            this.arena.matchHistory = this.arena.matchHistory.slice(0, 50);
        }
        
        // Update stats
        if (result.result === 'win') {
            this.arena.playerStats.wins++;
            this.arena.playerStats.winStreak++;
            if (this.arena.playerStats.winStreak > this.arena.playerStats.bestWinStreak) {
                this.arena.playerStats.bestWinStreak = this.arena.playerStats.winStreak;
            }
        } else {
            this.arena.playerStats.losses++;
            this.arena.playerStats.winStreak = 0;
        }
        
        this.arena.playerStats.totalMatches++;
        this.arena.playerStats.lastMatchTime = Date.now();
        
        // Update points
        this.arena.playerStats.points += result.pointsChange;
        this.arena.playerStats.points = Math.max(0, this.arena.playerStats.points);
        
        // Update rank
        this.updateArenaRank();
        
        this.notifyListeners('arenaMatchCompleted', { match, stats: this.arena.playerStats });
    }
    
    /**
     * Get current arena rank data
     */
    getCurrentArenaRank() {
        const { ArenaUtils } = require('../core/GameData.js');
        return ArenaUtils.getRankByPoints(this.arena.playerStats.points);
    }
    
    /**
     * Get next arena rank
     */
    getNextArenaRank() {
        const { ArenaUtils } = require('../core/GameData.js');
        const currentRank = this.getCurrentArenaRank();
        return ArenaUtils.getNextRank(currentRank);
    }
    
    /**
     * Get season rewards for current rank
     */
    getCurrentSeasonRewards() {
        const { ArenaUtils } = require('../core/GameData.js');
        return ArenaUtils.getSeasonRewards(this.arena.playerStats.rank);
    }
    
    /**
     * Add player to leaderboard
     */
    addToLeaderboard(playerData) {
        const existingIndex = this.arena.leaderboard.findIndex(
            entry => entry.playerName === playerData.playerName
        );
        
        const leaderboardEntry = {
            playerName: playerData.playerName,
            points: playerData.points,
            rank: playerData.rank,
            level: playerData.level,
            wins: playerData.wins,
            losses: playerData.losses,
            winRate: playerData.wins / Math.max(1, playerData.wins + playerData.losses),
            lastActive: Date.now()
        };
        
        if (existingIndex > -1) {
            this.arena.leaderboard[existingIndex] = leaderboardEntry;
        } else {
            this.arena.leaderboard.push(leaderboardEntry);
        }
        
        // Sort by points descending
        this.arena.leaderboard.sort((a, b) => b.points - a.points);
        
        // Keep only top 100
        if (this.arena.leaderboard.length > 100) {
            this.arena.leaderboard = this.arena.leaderboard.slice(0, 100);
        }
        
        this.notifyListeners('leaderboardUpdated', { leaderboard: this.arena.leaderboard });
    }
    
    /**
     * Get player's leaderboard position
     */
    getLeaderboardPosition() {
        const { ArenaUtils } = require('../core/GameData.js');
        return ArenaUtils.getLeaderboardPosition(
            this.arena.playerStats.points, 
            this.arena.leaderboard
        );
    }
    
    /**
     * Check if match type is available
     */
    isMatchTypeAvailable(matchType) {
        const { ArenaUtils, arenaMatchTypes } = require('../core/GameData.js');
        
        // Check if match type exists
        if (!arenaMatchTypes[matchType]) return false;
        
        // Check requirements
        if (!ArenaUtils.canParticipate(this.player, matchType)) return false;
        
        // Check cooldown
        const cooldown = this.arena.cooldowns[matchType] || 0;
        if (cooldown > Date.now()) return false;
        
        return true;
    }
    
    /**
     * Set match type cooldown
     */
    setMatchTypeCooldown(matchType, cooldownMs) {
        this.arena.cooldowns[matchType] = Date.now() + cooldownMs;
    }
    
    /**
     * Get match type cooldown remaining
     */
    getMatchTypeCooldown(matchType) {
        const cooldown = this.arena.cooldowns[matchType] || 0;
        return Math.max(0, cooldown - Date.now());
    }
    
    /**
     * Reset arena stats (for new season)
     */
    resetArenaStats() {
        this.arena.playerStats = {
            rank: 'Chưa Xếp Hạng',
            points: 1000,
            wins: 0,
            losses: 0,
            winStreak: 0,
            bestWinStreak: this.arena.playerStats.bestWinStreak, // Keep best streak
            totalMatches: 0,
            lastMatchTime: 0,
            seasonStartTime: Date.now(),
            highestRank: this.arena.playerStats.highestRank, // Keep highest rank
            highestPoints: this.arena.playerStats.highestPoints // Keep highest points
        };
        
        this.arena.matchHistory = [];
        this.arena.leaderboard = [];
        
        this.notifyListeners('arenaStatsReset', { season: this.arena.season });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.listeners.clear();
        console.log('GameState destroyed');
    }
}
