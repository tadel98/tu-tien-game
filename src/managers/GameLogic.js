import { GameDataUtils, itemDatabase, rarityData, ArenaUtils, arenaMatchTypes, arenaOpponents } from '../core/GameData.js';

/**
 * GameLogic - Xử lý các logic game và tính toán
 */
export class GameLogic {
    constructor(gameState) {
        this.gameState = gameState;
        this.lastUpdateTime = 0;
        
        // Các hệ số tính toán
        this.constants = {
            // Experience calculations
            EXPERIENCE_BASE_MULTIPLIER: 1.2,
            LEVEL_STAT_GROWTH: {
                attack: 2,
                defense: 1,
                health: 10,
                mana: 5
            },
            
            // Cultivation system
            CULTIVATION_REALMS: [
                { name: 'Phàm Nhân', stages: 9, multiplier: 1 },
                { name: 'Luyện Khí', stages: 9, multiplier: 2 },
                { name: 'Trúc Cơ', stages: 9, multiplier: 4 },
                { name: 'Kim Đan', stages: 9, multiplier: 8 },
                { name: 'Nguyên Anh', stages: 9, multiplier: 16 }
            ],
            
            // Combat calculations
            DAMAGE_VARIANCE: 0.2, // 20% damage variance
            CRITICAL_CHANCE_BASE: 0.05, // 5% base crit chance
            CRITICAL_MULTIPLIER: 2.0,
            
            // Resource generation
            PASSIVE_GOLD_PER_SECOND: 0.1,
            CULTIVATION_PROGRESS_PER_SECOND: 1
        };
    }

    /**
     * Initialize logic system
     */
    initialize(gameEngine) {
        this.gameEngine = gameEngine;
        console.log('GameLogic initialized');
    }

    /**
     * Update logic every frame
     */
    update(deltaTime) {
        this.lastUpdateTime += deltaTime;
        
        // Update every second for resource generation
        if (this.lastUpdateTime >= 1000) {
            this.updatePassiveProgression();
            this.lastUpdateTime = 0;
        }
        
        // Update cultivation progress
        this.updateCultivationProgress(deltaTime);
        
        // Update active effects
        this.updateActiveEffects(deltaTime);
    }

    /**
     * Cập nhật tiến triển thụ động
     */
    updatePassiveProgression() {
        // Passive gold generation
        const goldPerSecond = this.calculatePassiveGoldGeneration();
        if (goldPerSecond > 0) {
            this.gameState.addResource('gold', goldPerSecond);
        }
        
        // Passive experience generation (if player has certain items/skills)
        const expPerSecond = this.calculatePassiveExperienceGeneration();
        if (expPerSecond > 0) {
            this.gameState.addExperience(expPerSecond);
        }
    }

    /**
     * Cập nhật tiến triển tu luyện
     */
    updateCultivationProgress(deltaTime) {
        const player = this.gameState.player;
        const cultivationRate = this.calculateCultivationRate();
        const progressGain = cultivationRate * (deltaTime / 1000);
        
        player.cultivation.progress += progressGain;
        
        // Check for cultivation breakthrough
        if (player.cultivation.progress >= player.cultivation.progressToNext) {
            this.handleCultivationBreakthrough();
        }
    }

    /**
     * Xử lý đột phá tu luyện
     */
    handleCultivationBreakthrough() {
        const player = this.gameState.player;
        const currentRealm = this.getCurrentCultivationRealm();
        
        if (player.cultivation.stage < currentRealm.stages) {
            // Advance to next stage in current realm
            player.cultivation.stage++;
            player.cultivation.progress = 0;
            player.cultivation.progressToNext = this.calculateNextCultivationTarget();
            
            // Increase player stats
            this.applyCultivationStatBonus();
            
            console.log(`Đột phá tu luyện! ${player.cultivation.realm} Tầng ${player.cultivation.stage}`);
            this.gameState.notifyListeners('cultivationBreakthrough', {
                realm: player.cultivation.realm,
                stage: player.cultivation.stage
            });
        } else {
            // Try to advance to next realm
            this.attemptRealmAdvancement();
        }
    }

    /**
     * Thử tiến lên cảnh giới tiếp theo
     */
    attemptRealmAdvancement() {
        const player = this.gameState.player;
        const currentRealmIndex = this.constants.CULTIVATION_REALMS.findIndex(
            r => r.name === player.cultivation.realm
        );
        
        if (currentRealmIndex < this.constants.CULTIVATION_REALMS.length - 1) {
            const nextRealm = this.constants.CULTIVATION_REALMS[currentRealmIndex + 1];
            
            // Check if player meets requirements (level, items, etc.)
            if (this.canAdvanceToRealm(nextRealm)) {
                player.cultivation.realm = nextRealm.name;
                player.cultivation.stage = 1;
                player.cultivation.progress = 0;
                player.cultivation.progressToNext = this.calculateNextCultivationTarget();
                
                // Major stat boost for realm advancement
                this.applyRealmAdvancementBonus();
                
                console.log(`Tiến lên cảnh giới mới: ${nextRealm.name}!`);
                this.gameState.notifyListeners('realmAdvancement', {
                    newRealm: nextRealm.name
                });
            }
        }
    }

    /**
     * Tính toán sức mạnh tổng thể của player
     */
    calculatePlayerPower() {
        const player = this.gameState.player;
        const stats = player.stats;
        
        // Base power from stats
        let power = stats.attack * 2 + stats.defense + stats.intelligence;
        
        // Cultivation multiplier
        const realmMultiplier = this.getCurrentCultivationRealm().multiplier;
        const stageMultiplier = 1 + (player.cultivation.stage - 1) * 0.1;
        power *= realmMultiplier * stageMultiplier;
        
        // Level multiplier
        power *= (1 + player.level * 0.05);
        
        return Math.floor(power);
    }

    /**
     * Tính toán damage trong combat
     */
    calculateDamage(attacker, defender) {
        const baseDamage = attacker.stats.attack;
        const defense = defender.stats.defense;
        
        // Calculate base damage after defense
        let damage = Math.max(1, baseDamage - defense * 0.5);
        
        // Apply damage variance
        const variance = this.constants.DAMAGE_VARIANCE;
        damage *= (1 - variance + Math.random() * variance * 2);
        
        // Check for critical hit
        const critChance = this.constants.CRITICAL_CHANCE_BASE + attacker.stats.luck * 0.01;
        if (Math.random() < critChance) {
            damage *= this.constants.CRITICAL_MULTIPLIER;
            return { damage: Math.floor(damage), isCritical: true };
        }
        
        return { damage: Math.floor(damage), isCritical: false };
    }

    /**
     * Tính toán chi phí nâng cấp
     */
    calculateUpgradeCost(currentLevel, type = 'equipment') {
        const baseCost = type === 'equipment' ? 100 : 50;
        return Math.floor(baseCost * Math.pow(1.5, currentLevel - 1));
    }

    /**
     * Tính toán tỷ lệ drop item
     */
    calculateDropRate(playerLevel, itemRarity) {
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 0.3,
            rare: 0.1,
            epic: 0.03,
            legendary: 0.01
        };
        
        const baseRate = 0.1; // 10% base drop rate
        const levelBonus = 1 + (playerLevel - 1) * 0.02; // 2% per level
        const rarityMultiplier = rarityMultipliers[itemRarity] || 1.0;
        
        return baseRate * levelBonus * rarityMultiplier;
    }

    /**
     * Tính toán passive gold generation
     */
    calculatePassiveGoldGeneration() {
        const player = this.gameState.player;
        let goldPerSecond = this.constants.PASSIVE_GOLD_PER_SECOND;
        
        // Level bonus
        goldPerSecond *= (1 + player.level * 0.1);
        
        // Cultivation bonus
        const realmMultiplier = this.getCurrentCultivationRealm().multiplier;
        goldPerSecond *= realmMultiplier;
        
        return Math.floor(goldPerSecond * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Tính toán passive experience generation
     */
    calculatePassiveExperienceGeneration() {
        // Base passive exp is 0, can be increased by items/skills
        return 0;
    }

    /**
     * Tính toán tốc độ tu luyện
     */
    calculateCultivationRate() {
        const player = this.gameState.player;
        let rate = this.constants.CULTIVATION_PROGRESS_PER_SECOND;
        
        // Intelligence bonus
        rate *= (1 + player.stats.intelligence * 0.02);
        
        // Level bonus
        rate *= (1 + player.level * 0.01);
        
        return rate;
    }

    /**
     * Lấy thông tin cảnh giới tu luyện hiện tại
     */
    getCurrentCultivationRealm() {
        const player = this.gameState.player;
        return this.constants.CULTIVATION_REALMS.find(
            r => r.name === player.cultivation.realm
        ) || this.constants.CULTIVATION_REALMS[0];
    }

    /**
     * Tính toán target cho cultivation breakthrough tiếp theo
     */
    calculateNextCultivationTarget() {
        const player = this.gameState.player;
        const baseTarget = 1000;
        const stageMultiplier = Math.pow(1.5, player.cultivation.stage);
        const realmMultiplier = this.getCurrentCultivationRealm().multiplier;
        
        return Math.floor(baseTarget * stageMultiplier * realmMultiplier);
    }

    /**
     * Kiểm tra xem có thể tiến lên cảnh giới không
     */
    canAdvanceToRealm(nextRealm) {
        const player = this.gameState.player;
        
        // Minimum level requirement
        const requiredLevel = nextRealm.multiplier * 10;
        if (player.level < requiredLevel) {
            return false;
        }
        
        // Could add more requirements like specific items, quests completed, etc.
        return true;
    }

    /**
     * Áp dụng bonus stats từ cultivation breakthrough
     */
    applyCultivationStatBonus() {
        const player = this.gameState.player;
        const bonus = this.getCurrentCultivationRealm().multiplier;
        
        player.maxHealth += 5 * bonus;
        player.health = player.maxHealth;
        player.maxMana += 3 * bonus;
        player.mana = player.maxMana;
        
        this.gameState.calculatePlayerStats();
    }

    /**
     * Áp dụng bonus từ realm advancement
     */
    applyRealmAdvancementBonus() {
        const player = this.gameState.player;
        const newRealm = this.getCurrentCultivationRealm();
        
        // Major stat increase
        player.maxHealth += 20 * newRealm.multiplier;
        player.health = player.maxHealth;
        player.maxMana += 15 * newRealm.multiplier;
        player.mana = player.maxMana;
        player.maxStamina += 10 * newRealm.multiplier;
        player.stamina = player.maxStamina;
        
        // Stat bonuses
        player.stats.attack += 5 * newRealm.multiplier;
        player.stats.defense += 3 * newRealm.multiplier;
        player.stats.intelligence += 2 * newRealm.multiplier;
        
        this.gameState.calculatePlayerStats();
    }

    /**
     * Update active effects (buffs, debuffs, etc.)
     */
    updateActiveEffects(deltaTime) {
        // Placeholder for future active effect system
        // This would handle temporary buffs, debuffs, skills, etc.
    }

    /**
     * Validate action với resource requirements
     */
    canAfford(costs) {
        for (const [resource, cost] of Object.entries(costs)) {
            if (this.gameState.resources[resource] < cost) {
                return false;
            }
        }
        return true;
    }

    /**
     * Thực hiện action và trừ resources
     */
    executeAction(costs, action) {
        if (!this.canAfford(costs)) {
            return false;
        }
        
        // Deduct costs
        for (const [resource, cost] of Object.entries(costs)) {
            this.gameState.subtractResource(resource, cost);
        }
        
        // Execute action
        if (typeof action === 'function') {
            action();
        }
        
        return true;
    }

    /**
     * Generate random loot based on player level and luck
     */
    generateLoot(context = 'generic') {
        const player = this.gameState.player;
        const loot = [];
        
        // Gold drop
        const goldAmount = Math.floor(Math.random() * player.level * 5) + 1;
        loot.push({ type: 'gold', amount: goldAmount });
        
        // Item drop chance
        const itemDropChance = 0.3 + (player.stats.luck * 0.01);
        if (Math.random() < itemDropChance) {
            const item = this.generateRandomItem(player.level);
            loot.push({ type: 'item', data: item });
        }
        
        return loot;
    }

    /**
     * Generate random item
     */
    generateRandomItem(playerLevel) {
        const itemTypes = ['weapon', 'armor', 'accessory', 'consumable'];
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const rarity = this.selectRandomRarity();
        
        return {
            id: this.gameState.generateItemId(),
            name: this.generateItemName(type, rarity),
            type: type,
            rarity: rarity,
            level: playerLevel + Math.floor(Math.random() * 3) - 1,
            stats: this.generateItemStats(type, rarity, playerLevel)
        };
    }

    /**
     * Select random rarity based on drop rates
     */
    selectRandomRarity() {
        const rand = Math.random();
        if (rand < 0.6) return 'common';
        if (rand < 0.85) return 'uncommon';
        if (rand < 0.95) return 'rare';
        if (rand < 0.99) return 'epic';
        return 'legendary';
    }

    /**
     * Generate item name
     */
    generateItemName(type, rarity) {
        const prefixes = {
            common: ['Cũ', 'Gỉ', 'Thường'],
            uncommon: ['Tốt', 'Sắc'],
            rare: ['Quý', 'Hiếm'],
            epic: ['Huyền', 'Thần'],
            legendary: ['Thánh', 'Tiên']
        };
        
        const typeNames = {
            weapon: ['Kiếm', 'Đao', 'Thương'],
            armor: ['Áo', 'Giáp', 'Bào'],
            accessory: ['Nhẫn', 'Dây chuyền', 'Lắc tay'],
            consumable: ['Đan dược', 'Linh đan', 'Bảo đan']
        };
        
        const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
        const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
        
        return `${prefix} ${typeName}`;
    }

    /**
     * Generate item stats
     */
    generateItemStats(type, rarity, level) {
        const stats = {};
        const rarityMultipliers = {
            common: 1,
            uncommon: 1.5,
            rare: 2,
            epic: 3,
            legendary: 5
        };
        
        const multiplier = rarityMultipliers[rarity] * (1 + level * 0.1);
        
        switch (type) {
            case 'weapon':
                stats.attack = Math.floor(5 * multiplier);
                break;
            case 'armor':
                stats.defense = Math.floor(3 * multiplier);
                stats.health = Math.floor(10 * multiplier);
                break;
            case 'accessory':
                stats.intelligence = Math.floor(2 * multiplier);
                stats.luck = Math.floor(1 * multiplier);
                break;
        }
        
        return stats;
    }

    /**
     * Use consumable item
     */
    useConsumable(item) {
        const player = this.gameState.player;
        let used = false;
        
        switch (item.id) {
            case 'health_potion':
                if (player.health < player.maxHealth) {
                    const healAmount = Math.min(50, player.maxHealth - player.health);
                    player.health += healAmount;
                    used = true;
                    this.gameState.notifyListeners('playerHealed', { amount: healAmount });
                }
                break;
                
            case 'mana_potion':
                if (player.mana < player.maxMana) {
                    const manaAmount = Math.min(30, player.maxMana - player.mana);
                    player.mana += manaAmount;
                    used = true;
                    this.gameState.notifyListeners('playerManaRestored', { amount: manaAmount });
                }
                break;
                
            case 'experience_pill':
                const expGain = 100 * player.level;
                this.gameState.addExperience(expGain);
                used = true;
                break;
                
            case 'cultivation_pill':
                player.cultivation.progress += 500;
                used = true;
                this.gameState.notifyListeners('cultivationProgressGained', { amount: 500 });
                break;
                
            case 'stat_book':
                // Random stat increase
                const stats = ['attack', 'defense', 'intelligence', 'luck'];
                const randomStat = stats[Math.floor(Math.random() * stats.length)];
                player.stats[randomStat] += 1;
                used = true;
                this.gameState.notifyListeners('statIncreased', { stat: randomStat, amount: 1 });
                break;
        }
        
        if (used) {
            // Remove item from inventory
            this.gameState.removeItem(item.id, 1);
            return true;
        }
        
        return false;
    }

    /**
     * Thêm một vật phẩm vào túi đồ
     * @param {string} itemId - ID của vật phẩm
     * @param {number} quantity - Số lượng
     * @returns {boolean} - Thành công hay không
     */
    addItemToInventory(itemId, quantity = 1) {
        const itemData = GameDataUtils.getItem(itemId);
        if (!itemData) {
            console.error(`Item không tồn tại: ${itemId}`);
            return false;
        }

        const inventory = this.gameState.inventory.items;
        const existingItemIndex = inventory.findIndex(item => item.id === itemId);

        if (existingItemIndex > -1) {
            // Nếu vật phẩm đã có, tăng số lượng
            inventory[existingItemIndex].quantity += quantity;
        } else if (inventory.length < this.gameState.inventory.maxSlots) {
            // Nếu chưa có và túi đồ còn chỗ, thêm vật phẩm mới
            const newItem = {
                id: itemId,
                name: itemData.name,
                type: itemData.type,
                rarity: itemData.rarity,
                description: itemData.description,
                stats: itemData.stats || {},
                effect: itemData.effect || null,
                value: itemData.value || 0,
                quantity: quantity,
                addedTime: Date.now()
            };
            inventory.push(newItem);
        } else {
            console.log("Túi đồ đã đầy!");
            this.gameState.notifyListeners('inventoryFull', { itemId, quantity });
            return false;
        }

        console.log(`Đã thêm ${quantity} x ${itemData.name} vào túi đồ.`);
        this.gameState.notifyListeners('itemAdded', { itemId, quantity, itemData });
        return true;
    }

    /**
     * Sử dụng một vật phẩm từ túi đồ
     * @param {string} itemId - ID của vật phẩm
     * @returns {boolean} - Thành công hay không
     */
    useItemFromInventory(itemId) {
        const itemInInventory = this.gameState.inventory.items.find(item => item.id === itemId);
        if (!itemInInventory || itemInInventory.quantity <= 0) {
            console.log("Không có vật phẩm này để sử dụng.");
            return false;
        }

        const itemData = GameDataUtils.getItem(itemId);
        if (!itemData || !itemData.effect) {
            console.log("Vật phẩm này không thể sử dụng.");
            return false;
        }

        // Áp dụng hiệu ứng của vật phẩm
        const success = this.applyItemEffect(itemData.effect, itemData);
        
        if (success) {
            // Giảm số lượng vật phẩm
            itemInInventory.quantity--;
            console.log(`Đã sử dụng ${itemData.name}.`);

            // Nếu hết, xóa khỏi túi đồ
            if (itemInInventory.quantity <= 0) {
                this.gameState.inventory.items = this.gameState.inventory.items.filter(item => item.id !== itemId);
            }

            this.gameState.notifyListeners('itemUsed', { itemId, itemData });
            return true;
        }

        return false;
    }

    /**
     * Áp dụng hiệu ứng của vật phẩm
     * @param {object} effect - Hiệu ứng của vật phẩm
     * @param {object} itemData - Dữ liệu vật phẩm
     * @returns {boolean} - Thành công hay không
     */
    applyItemEffect(effect, itemData) {
        const player = this.gameState.player;
        
        switch (effect.type) {
            case 'HEAL':
                if (player.health < player.maxHealth) {
                    const healAmount = Math.min(effect.amount, player.maxHealth - player.health);
                    player.health += healAmount;
                    this.gameState.notifyListeners('playerHealed', { amount: healAmount, itemName: itemData.name });
                    return true;
                } else {
                    console.log("Sinh lực đã đầy!");
                    return false;
                }

            case 'RESTORE_MANA':
                if (player.mana < player.maxMana) {
                    const manaAmount = Math.min(effect.amount, player.maxMana - player.mana);
                    player.mana += manaAmount;
                    this.gameState.notifyListeners('playerManaRestored', { amount: manaAmount, itemName: itemData.name });
                    return true;
                } else {
                    console.log("Pháp lực đã đầy!");
                    return false;
                }

            case 'ADD_GOLD':
                this.gameState.addResource('gold', effect.amount);
                this.gameState.notifyListeners('goldReceived', { amount: effect.amount, itemName: itemData.name });
                return true;

            case 'ADD_EXP':
                const expGain = effect.multiplier * player.level;
                this.gameState.addExperience(expGain);
                this.gameState.notifyListeners('experienceReceived', { amount: expGain, itemName: itemData.name });
                return true;

            case 'ADD_CULTIVATION':
                player.cultivation.progress += effect.amount;
                this.gameState.notifyListeners('cultivationProgressGained', { amount: effect.amount, itemName: itemData.name });
                return true;

            default:
                console.log(`Hiệu ứng không được hỗ trợ: ${effect.type}`);
                return false;
        }
    }

    /**
     * Trang bị một vật phẩm
     * @param {string} itemId - ID của vật phẩm
     * @returns {boolean} - Thành công hay không
     */
    equipItem(itemId) {
        const itemInInventory = this.gameState.inventory.items.find(item => item.id === itemId);
        if (!itemInInventory) {
            console.log("Không tìm thấy vật phẩm trong túi đồ.");
            return false;
        }

        const itemData = GameDataUtils.getItem(itemId);
        if (!itemData || !['weapon', 'armor', 'accessory', 'boots'].includes(itemData.type)) {
            console.log("Vật phẩm này không thể trang bị.");
            return false;
        }

        // Kiểm tra yêu cầu
        if (!GameDataUtils.meetsRequirements(itemData, this.gameState.player)) {
            console.log("Không đủ yêu cầu để trang bị vật phẩm này.");
            this.gameState.notifyListeners('equipmentRequirementNotMet', { itemData });
            return false;
        }

        const slotType = itemData.type;
        
        // Tháo trang bị hiện tại nếu có
        if (this.gameState.inventory.equipment[slotType]) {
            this.unequipItem(slotType);
        }

        // Trang bị vật phẩm mới
        this.gameState.inventory.equipment[slotType] = { ...itemInInventory };
        
        // Xóa khỏi inventory
        this.gameState.removeItem(itemId, 1);
        
        // Tính lại stats
        this.calculatePlayerStats();
        
        console.log(`Đã trang bị ${itemData.name}.`);
        this.gameState.notifyListeners('itemEquipped', { itemId, itemData, slotType });
        return true;
    }

    /**
     * Tháo trang bị
     * @param {string} slotType - Loại slot (weapon, armor, accessory, boots)
     * @returns {boolean} - Thành công hay không
     */
    unequipItem(slotType) {
        const equippedItem = this.gameState.inventory.equipment[slotType];
        if (!equippedItem) {
            console.log("Không có gì để tháo ở slot này.");
            return false;
        }

        // Thêm lại vào inventory
        const success = this.addItemToInventory(equippedItem.id, 1);
        if (success) {
            // Xóa khỏi equipment
            this.gameState.inventory.equipment[slotType] = null;
            
            // Tính lại stats
            this.calculatePlayerStats();
            
            console.log(`Đã tháo ${equippedItem.name}.`);
            this.gameState.notifyListeners('itemUnequipped', { item: equippedItem, slotType });
            return true;
        }

        return false;
    }

    /**
     * Tính toán lại stats của player dựa trên equipment
     */
    calculatePlayerStats() {
        const player = this.gameState.player;
        
        // Base stats từ level
        const baseStats = {
            attack: 10 + (player.level - 1) * 2,
            defense: 5 + (player.level - 1),
            speed: 8,
            intelligence: 5,
            luck: 5
        };

        // Base health và mana
        const baseHealth = 100 + (player.level - 1) * 10;
        const baseMana = 50 + (player.level - 1) * 5;

        // Thêm stats từ equipment
        let equipmentStats = {
            attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0,
            health: 0, mana: 0
        };

        Object.values(this.gameState.inventory.equipment).forEach(item => {
            if (item && item.stats) {
                Object.keys(item.stats).forEach(stat => {
                    if (equipmentStats.hasOwnProperty(stat)) {
                        equipmentStats[stat] += item.stats[stat];
                    }
                });
            }
        });

        // Cập nhật final stats
        player.stats = {
            attack: baseStats.attack + equipmentStats.attack,
            defense: baseStats.defense + equipmentStats.defense,
            speed: baseStats.speed + equipmentStats.speed,
            intelligence: baseStats.intelligence + equipmentStats.intelligence,
            luck: baseStats.luck + equipmentStats.luck
        };

        // Cập nhật max health và mana
        const newMaxHealth = baseHealth + equipmentStats.health;
        const newMaxMana = baseMana + equipmentStats.mana;
        
        // Giữ tỷ lệ % hiện tại khi thay đổi max
        const healthRatio = player.health / player.maxHealth;
        const manaRatio = player.mana / player.maxMana;
        
        player.maxHealth = newMaxHealth;
        player.maxMana = newMaxMana;
        
        // Cập nhật current health/mana theo tỷ lệ
        player.health = Math.min(player.health, Math.floor(newMaxHealth * healthRatio));
        player.mana = Math.min(player.mana, Math.floor(newMaxMana * manaRatio));

        this.gameState.notifyListeners('statsChanged', { 
            stats: player.stats, 
            maxHealth: player.maxHealth, 
            maxMana: player.maxMana 
        });
    }

    /**
     * Generate loot và thêm vào inventory
     * @param {string} lootTableName - Tên bảng loot
     * @returns {array} - Danh sách items nhận được
     */
    generateAndAddLoot(lootTableName) {
        const player = this.gameState.player;
        const luckBonus = player.stats.luck || 0;
        
        const loot = GameDataUtils.generateLoot(lootTableName, player.level, luckBonus);
        const receivedItems = [];

        loot.forEach(lootItem => {
            const success = this.addItemToInventory(lootItem.itemId, lootItem.quantity);
            if (success) {
                receivedItems.push(lootItem);
            }
        });

        if (receivedItems.length > 0) {
            this.gameState.notifyListeners('lootReceived', { items: receivedItems, source: lootTableName });
        }

        return receivedItems;
    }

    /**
     * Add sample items to inventory using new system
     */
    addSampleItems() {
        const sampleItemIds = [
            { id: 'hp_potion_small', quantity: 3 },
            { id: 'mana_potion_small', quantity: 2 },
            { id: 'wooden_sword', quantity: 1 },
            { id: 'iron_sword', quantity: 1 },
            { id: 'cloth_robe', quantity: 1 },
            { id: 'leather_armor', quantity: 1 },
            { id: 'copper_ring', quantity: 1 },
            { id: 'silver_ring', quantity: 1 },
            { id: 'cloth_shoes', quantity: 1 },
            { id: 'cultivation_pill', quantity: 2 },
            { id: 'experience_pill', quantity: 1 },
            { id: 'gold_pouch', quantity: 2 }
        ];
        
        let addedCount = 0;
        sampleItemIds.forEach(({ id, quantity }) => {
            const success = this.addItemToInventory(id, quantity);
            if (success) addedCount++;
        });
        
        console.log(`Đã thêm ${addedCount}/${sampleItemIds.length} loại items mẫu vào inventory`);
        this.gameState.notifyListeners('sampleItemsAdded', { count: addedCount });
    }

    /**
     * Arena System Methods
     */
    
    /**
     * Start an arena match
     * @param {string} matchType - Type of match (RANKED, PRACTICE, TOURNAMENT)
     * @returns {object} - Match result or null if failed
     */
    startArenaMatch(matchType = 'RANKED') {
        // Check if match type is available
        if (!this.gameState.isMatchTypeAvailable(matchType)) {
            console.log(`Không thể tham gia ${matchType}: không đủ yêu cầu hoặc đang cooldown`);
            return null;
        }
        
        // Generate AI opponent
        const playerLevel = this.gameState.player.level;
        const playerRank = this.gameState.getCurrentArenaRank();
        const opponent = ArenaUtils.generateAIOpponent(playerLevel, playerRank);
        
        // Calculate match difficulty
        const playerPower = this.calculatePlayerPower();
        const opponentPower = this.calculateOpponentPower(opponent, playerLevel);
        
        // Determine match result (simplified for now)
        const winChance = this.calculateWinChance(playerPower, opponentPower, playerLevel, opponent.level);
        const isWin = Math.random() < winChance;
        
        // Calculate points change
        const pointsBefore = this.gameState.arena.playerStats.points;
        const pointsChange = isWin ? 
            ArenaUtils.calculatePointsChange(pointsBefore, opponentPower, matchType) :
            -ArenaUtils.calculatePointsChange(opponentPower, pointsBefore, matchType);
        const pointsAfter = Math.max(0, pointsBefore + pointsChange);
        
        // Create match result
        const matchResult = {
            opponentName: opponent.name,
            opponentLevel: opponent.level,
            matchType: matchType,
            result: isWin ? 'win' : 'loss',
            pointsChange: pointsChange,
            pointsBefore: pointsBefore,
            pointsAfter: pointsAfter,
            duration: Math.random() * 30000 + 10000, // 10-40 seconds
            playerPower: playerPower,
            opponentPower: opponentPower,
            winChance: winChance
        };
        
        // Add to game state
        this.gameState.addArenaMatchResult(matchResult);
        
        // Set cooldown
        const matchTypeData = arenaMatchTypes[matchType];
        if (matchTypeData.cooldown > 0) {
            this.gameState.setMatchTypeCooldown(matchType, matchTypeData.cooldown);
        }
        
        // Add to leaderboard
        this.gameState.addToLeaderboard({
            playerName: this.gameState.player.name,
            points: pointsAfter,
            rank: this.gameState.arena.playerStats.rank,
            level: this.gameState.player.level,
            wins: this.gameState.arena.playerStats.wins,
            losses: this.gameState.arena.playerStats.losses
        });
        
        console.log(`Arena match ${isWin ? 'thắng' : 'thua'}: ${opponent.name} (${opponent.level})`);
        
        return matchResult;
    }
    
    /**
     * Calculate opponent power
     */
    calculateOpponentPower(opponent, playerLevel) {
        const basePower = opponent.power;
        const levelDiff = opponent.level - playerLevel;
        const levelMultiplier = 1 + (levelDiff * 0.1);
        
        return Math.floor(basePower * levelMultiplier);
    }
    
    /**
     * Calculate win chance based on power difference
     */
    calculateWinChance(playerPower, opponentPower, playerLevel, opponentLevel) {
        const powerDiff = playerPower - opponentPower;
        const levelDiff = playerLevel - opponentLevel;
        
        // Base win chance
        let winChance = 0.5;
        
        // Power difference factor
        const powerFactor = Math.tanh(powerDiff / 1000) * 0.3; // -0.3 to 0.3
        
        // Level difference factor
        const levelFactor = Math.tanh(levelDiff / 5) * 0.2; // -0.2 to 0.2
        
        // Luck factor
        const luckFactor = (this.gameState.player.stats.luck - 5) * 0.01; // -0.05 to 0.05
        
        winChance += powerFactor + levelFactor + luckFactor;
        
        // Clamp between 0.1 and 0.9
        return Math.max(0.1, Math.min(0.9, winChance));
    }
    
    /**
     * Get available match types
     */
    getAvailableMatchTypes() {
        return this.gameState.arena.availableMatchTypes.filter(matchType => 
            this.gameState.isMatchTypeAvailable(matchType)
        );
    }
    
    /**
     * Get match type cooldown info
     */
    getMatchTypeCooldownInfo(matchType) {
        const cooldown = this.gameState.getMatchTypeCooldown(matchType);
        const matchTypeData = arenaMatchTypes[matchType];
        
        return {
            matchType: matchType,
            name: matchTypeData.name,
            description: matchTypeData.description,
            cooldownRemaining: cooldown,
            isAvailable: cooldown === 0,
            requirements: matchTypeData.requirements
        };
    }
    
    /**
     * Get arena statistics
     */
    getArenaStatistics() {
        const stats = this.gameState.arena.playerStats;
        const currentRank = this.gameState.getCurrentArenaRank();
        const nextRank = this.gameState.getNextArenaRank();
        const seasonRewards = this.gameState.getCurrentSeasonRewards();
        const leaderboardPosition = this.gameState.getLeaderboardPosition();
        
        return {
            currentRank: currentRank,
            nextRank: nextRank,
            points: stats.points,
            wins: stats.wins,
            losses: stats.losses,
            winStreak: stats.winStreak,
            bestWinStreak: stats.bestWinStreak,
            totalMatches: stats.totalMatches,
            winRate: stats.wins / Math.max(1, stats.wins + stats.losses),
            leaderboardPosition: leaderboardPosition,
            seasonRewards: seasonRewards,
            highestRank: stats.highestRank,
            highestPoints: stats.highestPoints
        };
    }
    
    /**
     * Get recent match history
     */
    getRecentMatchHistory(limit = 10) {
        return this.gameState.arena.matchHistory.slice(0, limit);
    }
    
    /**
     * Get leaderboard
     */
    getLeaderboard(limit = 20) {
        return this.gameState.arena.leaderboard.slice(0, limit);
    }
    
    /**
     * Simulate multiple arena matches (for testing)
     */
    simulateArenaMatches(count = 5, matchType = 'RANKED') {
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const result = this.startArenaMatch(matchType);
            if (result) {
                results.push(result);
            }
            
            // Small delay between matches
            if (i < count - 1) {
                // In real game, this would be handled by UI
                setTimeout(() => {}, 100);
            }
        }
        
        return results;
    }
    
    /**
     * Claim season rewards
     */
    claimSeasonRewards() {
        const rewards = this.gameState.getCurrentSeasonRewards();
        
        if (rewards.gold > 0) {
            this.gameState.addResource('gold', rewards.gold);
        }
        
        if (rewards.spiritStones > 0) {
            this.gameState.addResource('spirit_stones', rewards.spiritStones);
        }
        
        if (rewards.cultivationPills > 0) {
            this.addItemToInventory('cultivation_pill', rewards.cultivationPills);
        }
        
        this.gameState.notifyListeners('seasonRewardsClaimed', { 
            rewards, 
            rank: this.gameState.arena.playerStats.rank 
        });
        
        console.log(`Đã nhận phần thưởng mùa giải: ${JSON.stringify(rewards)}`);
        
        return rewards;
    }
    
    /**
     * Get arena season info
     */
    getArenaSeasonInfo() {
        const season = this.gameState.arena.season;
        const timeRemaining = season.endTime - Date.now();
        
        return {
            ...season,
            timeRemaining: timeRemaining,
            daysRemaining: Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)),
            isActive: timeRemaining > 0
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        console.log('GameLogic destroyed');
    }
}
