// Server-side Game Logic - Migrated from game-complete.html
class ServerGameLogic {
    constructor() {
        this.itemDatabase = new Map();
        this.questDatabase = new Map();
        this.petDatabase = new Map();
        this.wifeDatabase = new Map();
        this.premiumShopItems = new Map();
        this.guilds = new Map();
        this.leaderboards = new Map();
        
        this.initializeDatabases();
    }

    initializeDatabases() {
        // Item Database
        const items = {
            'hp_potion_small': {
                id: 'hp_potion_small', name: 'Bình Máu Nhỏ', description: 'Hồi phục 50 điểm sinh lực.',
                type: 'consumable', rarity: 'common', icon: '🍷',
                effect: { type: 'HEAL', amount: 50 }, value: 10
            },
            'mana_potion_small': {
                id: 'mana_potion_small', name: 'Bình Mana Nhỏ', description: 'Hồi phục 30 điểm pháp lực.',
                type: 'consumable', rarity: 'common', icon: '💙',
                effect: { type: 'RESTORE_MANA', amount: 30 }, value: 8
            },
            'gold_pouch': {
                id: 'gold_pouch', name: 'Túi Vàng', description: 'Nhận được 100 vàng.',
                type: 'consumable', rarity: 'common', icon: '💰',
                effect: { type: 'ADD_GOLD', amount: 100 }, value: 50
            },
            'experience_pill': {
                id: 'experience_pill', name: 'Kinh Nghiệm Đan', description: 'Tăng kinh nghiệm dựa trên cấp độ.',
                type: 'consumable', rarity: 'rare', icon: '💊',
                effect: { type: 'ADD_EXP', multiplier: 100 }, value: 200
            },
            'cultivation_pill': {
                id: 'cultivation_pill', name: 'Tu Luyện Đan', description: 'Tăng 500 điểm tiến độ tu luyện.',
                type: 'consumable', rarity: 'uncommon', icon: '🔮',
                effect: { type: 'ADD_CULTIVATION', amount: 500 }, value: 150
            }
        };

        Object.values(items).forEach(item => {
            this.itemDatabase.set(item.id, item);
        });

        // Pet Database
        const pets = {
            'fire_fox': {
                id: 'fire_fox', name: 'Hồ Ly Lửa', description: 'Linh thú thuộc tính lửa, sở hữu sức mạnh tấn công cao',
                element: 'fire', rarity: 'rare',
                baseStats: { attack: 50, defense: 30, speed: 80, intelligence: 60, luck: 40 },
                skills: [
                    { id: 'fire_ball', name: 'Cầu Lửa', damage: 120, cooldown: 3000, description: 'Tấn công bằng cầu lửa mạnh mẽ' },
                    { id: 'fire_shield', name: 'Khiên Lửa', defense: 50, duration: 10000, description: 'Tạo khiên lửa bảo vệ chủ nhân' }
                ],
                evolution: { level: 20, nextForm: 'fire_fox_king', requirements: { items: ['fire_crystal', 'spirit_essence'] } },
                maxLevel: 100, expToNext: 1000
            },
            'ice_wolf': {
                id: 'ice_wolf', name: 'Sói Băng', description: 'Linh thú thuộc tính băng, có khả năng làm chậm kẻ thù',
                element: 'ice', rarity: 'epic',
                baseStats: { attack: 45, defense: 60, speed: 70, intelligence: 80, luck: 35 },
                skills: [
                    { id: 'ice_claw', name: 'Vuốt Băng', damage: 100, cooldown: 2500, description: 'Tấn công bằng vuốt băng sắc lạnh' },
                    { id: 'freeze', name: 'Đóng Băng', effect: 'slow', duration: 5000, description: 'Làm chậm tất cả kẻ thù xung quanh' }
                ],
                evolution: { level: 25, nextForm: 'ice_wolf_alpha', requirements: { items: ['ice_crystal', 'wolf_fang'] } },
                maxLevel: 100, expToNext: 1200
            }
        };

        Object.values(pets).forEach(pet => {
            this.petDatabase.set(pet.id, pet);
        });

        // Wife Database
        const wives = {
            'ice_fairy': {
                id: 'ice_fairy', name: 'Băng Tiên Tử', description: 'Tiên nữ thuộc tính băng, xinh đẹp và mạnh mẽ',
                element: 'ice', rarity: 'epic',
                baseStats: { attack: 60, defense: 80, speed: 70, intelligence: 120, luck: 90 },
                skills: [
                    { id: 'ice_heal', name: 'Hồi Phục Băng', heal: 200, cooldown: 4000, description: 'Hồi phục máu bằng phép thuật băng' },
                    { id: 'ice_prison', name: 'Ngục Băng', damage: 150, duration: 6000, description: 'Bẫy kẻ thù trong ngục băng' }
                ],
                affinity: { max: 1000, current: 0, bonuses: { 100: { exp: 1.1, gold: 1.05 }, 300: { exp: 1.2, gold: 1.1 } } },
                gifts: ['ice_flower', 'crystal_necklace', 'frozen_tear'],
                maxLevel: 100, expToNext: 2000
            }
        };

        Object.values(wives).forEach(wife => {
            this.wifeDatabase.set(wife.id, wife);
        });

        // Quest Database
        const quests = {
            'first_cultivation': {
                id: 'first_cultivation', title: 'Tu Luyện Đầu Tiên', description: 'Bắt đầu hành trình tu luyện của bạn.',
                objective: { type: 'CULTIVATION_STAGE', targetValue: 2 },
                rewards: { exp: 200, gold: 50, items: [{ id: 'cultivation_pill', quantity: 2 }] },
                requirements: { level: 1 }, category: 'Tu Luyện', difficulty: 'Dễ'
            },
            'level_up_quest': {
                id: 'level_up_quest', title: 'Lên Cấp', description: 'Đạt cấp độ 5 để mở khóa nhiều tính năng mới.',
                objective: { type: 'LEVEL_UP', targetValue: 5 },
                rewards: { exp: 500, gold: 100, items: [{ id: 'experience_pill', quantity: 1 }] },
                requirements: { level: 1 }, category: 'Phát Triển', difficulty: 'Trung Bình'
            }
        };

        Object.values(quests).forEach(quest => {
            this.questDatabase.set(quest.id, quest);
        });
    }

    // Calculate player power including companions
    calculatePlayerPower(player) {
        let power = 0;
        
        // Base stats
        Object.values(player.stats).forEach(stat => power += stat);
        
        // Pet bonus (30% of pet power)
        if (player.pet && player.pet.petId) {
            const petPower = Object.values(player.pet.stats || {}).reduce((sum, stat) => sum + stat, 0);
            power += Math.floor(petPower * 0.3);
        }
        
        // Wife bonus (20% of wife power + affinity bonus)
        if (player.wife && player.wife.wifeId) {
            const wifePower = Object.values(player.wife.stats || {}).reduce((sum, stat) => sum + stat, 0);
            power += Math.floor(wifePower * 0.2);
            
            if (player.wife.affinity) {
                power += (player.wife.affinity.level || 0) * 10;
            }
        }
        
        return Math.floor(power);
    }

    // Process player command
    processCommand(playerId, command, data) {
        const player = this.getPlayer(playerId);
        if (!player) return { success: false, message: 'Player not found' };

        switch (command) {
            case 'use_item':
                return this.useItem(player, data.itemId);
            case 'cultivate':
                return this.cultivate(player, data.duration);
            case 'feed_pet':
                return this.feedPet(player, data.foodType);
            case 'give_gift':
                return this.giveGift(player, data.giftId);
            case 'obtain_pet':
                return this.obtainPet(player, data.petId);
            case 'obtain_wife':
                return this.obtainWife(player, data.wifeId);
            case 'accept_quest':
                return this.acceptQuest(player, data.questId);
            case 'complete_quest':
                return this.completeQuest(player, data.questId);
            case 'join_guild':
                return this.joinGuild(player, data.guildId);
            case 'contribute_guild':
                return this.contributeGuild(player, data.goldAmount, data.spiritStonesAmount);
            case 'purchase_premium':
                return this.purchasePremiumItem(player, data.itemId);
            case 'admin_add_knb':
                return this.adminAddKNB(player, data.amount);
            default:
                return { success: false, message: 'Unknown command' };
        }
    }

    getPlayer(playerId) {
        // This should be implemented by the server to get player from gameState
        return null; // Placeholder
    }

    useItem(player, itemId) {
        const item = this.itemDatabase.get(itemId);
        if (!item) return { success: false, message: 'Item not found' };

        // Check if player has item
        const inventoryItem = player.inventory.items.find(invItem => invItem.itemId === itemId);
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return { success: false, message: 'Item not in inventory' };
        }

        // Apply item effect
        let result = { success: true, message: `Used ${item.name}` };
        
        switch (item.effect.type) {
            case 'HEAL':
                player.health = Math.min(player.maxHealth, player.health + item.effect.amount);
                result.healthUpdate = { current: player.health, max: player.maxHealth };
                break;
            case 'RESTORE_MANA':
                player.mana = Math.min(player.maxMana, player.mana + item.effect.amount);
                result.manaUpdate = { current: player.mana, max: player.maxMana };
                break;
            case 'ADD_GOLD':
                player.resources.gold += item.effect.amount;
                result.resourceUpdate = { gold: player.resources.gold };
                break;
            case 'ADD_EXP':
                const expGain = player.level * item.effect.multiplier;
                player.experience += expGain;
                result.expUpdate = { current: player.experience, gain: expGain };
                
                // Check level up
                if (player.experience >= player.experienceToNext) {
                    const levelUpResult = this.levelUp(player);
                    result.levelUp = levelUpResult;
                }
                break;
            case 'ADD_CULTIVATION':
                player.cultivation.progress += item.effect.amount;
                result.cultivationUpdate = { progress: player.cultivation.progress };
                
                // Check cultivation breakthrough
                if (player.cultivation.progress >= player.cultivation.progressToNext) {
                    const breakthroughResult = this.cultivationBreakthrough(player);
                    result.breakthrough = breakthroughResult;
                }
                break;
        }

        // Remove item from inventory
        inventoryItem.quantity--;
        if (inventoryItem.quantity <= 0) {
            const index = player.inventory.items.indexOf(inventoryItem);
            player.inventory.items.splice(index, 1);
        }

        return result;
    }

    cultivate(player, duration) {
        const progress = duration * 0.1; // Simplified calculation
        player.cultivation.progress += progress;
        
        const result = {
            success: true,
            message: 'Cultivation progress updated',
            cultivationUpdate: { progress: player.cultivation.progress }
        };
        
        if (player.cultivation.progress >= player.cultivation.progressToNext) {
            const breakthroughResult = this.cultivationBreakthrough(player);
            result.breakthrough = breakthroughResult;
        }
        
        return result;
    }

    cultivationBreakthrough(player) {
        player.cultivation.stage++;
        player.cultivation.progress = 0;
        player.cultivation.progressToNext = Math.floor(player.cultivation.progressToNext * 1.5);
        
        // Increase stats based on cultivation stage
        const statIncrease = player.cultivation.stage * 2;
        Object.keys(player.stats).forEach(stat => {
            player.stats[stat] += statIncrease;
        });
        
        return {
            success: true,
            message: `Cultivation breakthrough! Reached stage ${player.cultivation.stage}`,
            newStage: player.cultivation.stage,
            statIncrease: statIncrease
        };
    }

    levelUp(player) {
        player.level++;
        player.experience -= player.experienceToNext;
        player.experienceToNext = Math.floor(player.experienceToNext * 1.2);
        
        // Increase health and mana
        const healthIncrease = 20;
        const manaIncrease = 10;
        player.maxHealth += healthIncrease;
        player.health = player.maxHealth; // Full heal on level up
        player.maxMana += manaIncrease;
        player.mana = player.maxMana; // Full mana on level up
        
        // Increase stats
        const statIncrease = 2;
        Object.keys(player.stats).forEach(stat => {
            player.stats[stat] += statIncrease;
        });
        
        return {
            success: true,
            message: `Level up! Now level ${player.level}`,
            newLevel: player.level,
            healthIncrease: healthIncrease,
            manaIncrease: manaIncrease,
            statIncrease: statIncrease
        };
    }

    feedPet(player, foodType) {
        if (!player.pet || !player.pet.petId) {
            return { success: false, message: 'No pet to feed' };
        }

        const foodEffects = {
            'basic_food': { happiness: 20, exp: 50 },
            'premium_food': { happiness: 50, exp: 150 },
            'spirit_food': { happiness: 100, exp: 300 }
        };

        const effect = foodEffects[foodType] || foodEffects['basic_food'];
        player.pet.happiness = Math.min(100, (player.pet.happiness || 0) + effect.happiness);
        player.pet.experience = (player.pet.experience || 0) + effect.exp;

        // Check pet level up
        let petLevelUp = null;
        if (player.pet.experience >= player.pet.experienceToNext) {
            petLevelUp = this.levelUpPet(player);
        }

        return {
            success: true,
            message: `Pet fed with ${foodType}`,
            petUpdate: {
                happiness: player.pet.happiness,
                experience: player.pet.experience
            },
            petLevelUp: petLevelUp
        };
    }

    levelUpPet(player) {
        player.pet.experience -= player.pet.experienceToNext;
        player.pet.level++;
        player.pet.experienceToNext = Math.floor(player.pet.experienceToNext * 1.2);

        // Increase pet stats
        const petData = this.petDatabase.get(player.pet.petId);
        if (petData) {
            Object.keys(player.pet.stats).forEach(stat => {
                player.pet.stats[stat] += Math.floor(petData.baseStats[stat] * 0.1);
            });
        }

        return {
            success: true,
            message: `Pet leveled up to level ${player.pet.level}`,
            newLevel: player.pet.level
        };
    }

    giveGift(player, giftId) {
        if (!player.wife || !player.wife.wifeId) {
            return { success: false, message: 'No wife to give gift to' };
        }

        const giftEffects = {
            'ice_flower': { affinity: 50, mood: 30 },
            'crystal_necklace': { affinity: 100, mood: 50 },
            'frozen_tear': { affinity: 200, mood: 100 }
        };

        const effect = giftEffects[giftId] || { affinity: 20, mood: 10 };
        player.wife.affinity = player.wife.affinity || { current: 0, max: 1000, level: 0 };
        player.wife.affinity.current = Math.min(player.wife.affinity.max, player.wife.affinity.current + effect.affinity);
        player.wife.mood = Math.min(100, (player.wife.mood || 0) + effect.mood);

        return {
            success: true,
            message: `Gift given: ${giftId}`,
            wifeUpdate: {
                affinity: player.wife.affinity.current,
                mood: player.wife.mood
            }
        };
    }

    obtainPet(player, petId) {
        const petData = this.petDatabase.get(petId);
        if (!petData) {
            return { success: false, message: 'Pet not found' };
        }

        if (player.pet && player.pet.petId) {
            return { success: false, message: 'Already have a pet' };
        }

        player.pet = {
            petId: petId,
            level: 1,
            experience: 0,
            experienceToNext: petData.expToNext,
            stats: { ...petData.baseStats },
            skills: [...petData.skills],
            equipment: { collar: null, charm: null, accessory: null },
            happiness: 100,
            lastFed: 0,
            evolution: { 
                canEvolve: false, 
                nextForm: petData.evolution.nextForm, 
                requirements: petData.evolution.requirements 
            }
        };

        return {
            success: true,
            message: `Obtained ${petData.name}!`,
            pet: player.pet
        };
    }

    obtainWife(player, wifeId) {
        const wifeData = this.wifeDatabase.get(wifeId);
        if (!wifeData) {
            return { success: false, message: 'Wife not found' };
        }

        if (player.wife && player.wife.wifeId) {
            return { success: false, message: 'Already have a wife' };
        }

        player.wife = {
            wifeId: wifeId,
            level: 1,
            experience: 0,
            experienceToNext: wifeData.expToNext,
            stats: { ...wifeData.baseStats },
            skills: [...wifeData.skills],
            affinity: { 
                current: 0, 
                max: wifeData.affinity.max, 
                level: 0 
            },
            equipment: { dress: null, jewelry: null, shoes: null },
            mood: 100,
            lastGift: 0,
            gifts: [...wifeData.gifts]
        };

        return {
            success: true,
            message: `Married ${wifeData.name}!`,
            wife: player.wife
        };
    }

    acceptQuest(player, questId) {
        const quest = this.questDatabase.get(questId);
        if (!quest) {
            return { success: false, message: 'Quest not found' };
        }

        // Check if already has quest
        if (player.activeQuests && player.activeQuests.find(q => q.questId === questId)) {
            return { success: false, message: 'Quest already active' };
        }

        // Check requirements
        if (quest.requirements.level && player.level < quest.requirements.level) {
            return { success: false, message: 'Level requirement not met' };
        }

        if (!player.activeQuests) {
            player.activeQuests = [];
        }

        player.activeQuests.push({
            questId: questId,
            progress: 0,
            acceptedAt: Date.now()
        });

        return {
            success: true,
            message: `Quest accepted: ${quest.title}`,
            quest: quest
        };
    }

    completeQuest(player, questId) {
        const quest = this.questDatabase.get(questId);
        if (!quest) {
            return { success: false, message: 'Quest not found' };
        }

        const activeQuest = player.activeQuests?.find(q => q.questId === questId);
        if (!activeQuest) {
            return { success: false, message: 'Quest not active' };
        }

        // Check if quest is completed (simplified)
        if (activeQuest.progress < 100) {
            return { success: false, message: 'Quest not completed yet' };
        }

        // Give rewards
        if (quest.rewards.exp) {
            player.experience += quest.rewards.exp;
        }
        if (quest.rewards.gold) {
            player.resources.gold += quest.rewards.gold;
        }
        if (quest.rewards.items) {
            quest.rewards.items.forEach(item => {
                this.addItemToInventory(player, item.id, item.quantity);
            });
        }

        // Remove quest from active
        player.activeQuests = player.activeQuests.filter(q => q.questId !== questId);

        return {
            success: true,
            message: `Quest completed: ${quest.title}`,
            rewards: quest.rewards
        };
    }

    addItemToInventory(player, itemId, quantity) {
        if (!player.inventory) {
            player.inventory = { items: [], equipment: {} };
        }

        const existingItem = player.inventory.items.find(item => item.itemId === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            player.inventory.items.push({ itemId, quantity });
        }
    }

    joinGuild(player, guildId) {
        // Simplified guild joining
        if (player.guild && player.guild.guildId) {
            return { success: false, message: 'Already in a guild' };
        }

        player.guild = {
            guildId: guildId,
            rank: 'Member',
            joinDate: Date.now(),
            contribution: 0,
            lastContributionTime: 0,
            permissions: []
        };

        return {
            success: true,
            message: 'Joined guild successfully',
            guild: player.guild
        };
    }

    contributeGuild(player, goldAmount, spiritStonesAmount) {
        if (!player.guild || !player.guild.guildId) {
            return { success: false, message: 'Not in a guild' };
        }

        if (player.resources.gold < goldAmount || player.resources.spirit_stones < spiritStonesAmount) {
            return { success: false, message: 'Insufficient resources' };
        }

        player.resources.gold -= goldAmount;
        player.resources.spirit_stones -= spiritStonesAmount;
        player.guild.contribution += goldAmount + spiritStonesAmount * 10;
        player.guild.lastContributionTime = Date.now();

        return {
            success: true,
            message: 'Guild contribution successful',
            contribution: player.guild.contribution
        };
    }

    purchasePremiumItem(player, itemId) {
        // Simplified premium purchase
        const premiumItems = {
            'monthly_card': { price: 500, name: 'Thẻ Tháng' },
            'rare_mount': { price: 2500, name: 'Thú Cưỡi Hiếm' }
        };

        const item = premiumItems[itemId];
        if (!item) {
            return { success: false, message: 'Premium item not found' };
        }

        if (player.resources.kim_nguyen_bao < item.price) {
            return { success: false, message: 'Insufficient Kim Nguyên Bảo' };
        }

        player.resources.kim_nguyen_bao -= item.price;

        return {
            success: true,
            message: `Purchased ${item.name}`,
            newBalance: player.resources.kim_nguyen_bao
        };
    }

    adminAddKNB(player, amount) {
        // Only for testing - in real game, this would require admin privileges
        player.resources.kim_nguyen_bao = (player.resources.kim_nguyen_bao || 0) + amount;

        return {
            success: true,
            message: `Added ${amount} Kim Nguyên Bảo`,
            newBalance: player.resources.kim_nguyen_bao
        };
    }
}

module.exports = ServerGameLogic;
