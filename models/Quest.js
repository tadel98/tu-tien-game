const mongoose = require('mongoose');

// Quest Schema - Dữ liệu động của nhiệm vụ
const questSchema = new mongoose.Schema({
    // Basic Info
    questId: { type: String, required: true, unique: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    
    // Quest Type & Category
    type: { 
        type: String, 
        enum: ['Main', 'Side', 'Daily', 'Weekly', 'Event', 'Guild', 'Arena'],
        default: 'Side'
    },
    category: { 
        type: String, 
        enum: ['Tu Luyện', 'Chiến Đấu', 'Thu Thập', 'Khám Phá', 'Xã Hội', 'Kinh Tế'],
        default: 'Tu Luyện'
    },
    difficulty: { 
        type: String, 
        enum: ['Dễ', 'Trung Bình', 'Khó', 'Rất Khó', 'Cực Khó'],
        default: 'Dễ'
    },
    
    // Requirements
    requirements: {
        level: { type: Number, default: 1, min: 1 },
        cultivation: {
            realm: { type: String, default: null },
            stage: { type: Number, default: 1, min: 1 }
        },
        previousQuests: [{ type: String }],
        items: [{
            itemId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        gold: { type: Number, default: 0, min: 0 },
        spiritStones: { type: Number, default: 0, min: 0 }
    },
    
    // Objectives
    objectives: [{
        type: { 
            type: String, 
            enum: ['KILL', 'LEVEL_UP', 'CULTIVATION_STAGE', 'ARENA_WINS', 'COLLECT_GOLD', 'CULTIVATION_TIME', 'EQUIP_ITEMS', 'EXPLORE_AREAS', 'GUILD_CONTRIBUTION', 'COMPLETE_QUESTS'],
            required: true
        },
        targetId: { type: String, default: null },
        targetValue: { type: Number, required: true, min: 1 },
        currentValue: { type: Number, default: 0, min: 0 },
        description: { type: String, required: true }
    }],
    
    // Rewards
    rewards: {
        exp: { type: Number, default: 0, min: 0 },
        gold: { type: Number, default: 0, min: 0 },
        spiritStones: { type: Number, default: 0, min: 0 },
        kimNguyenBao: { type: Number, default: 0, min: 0 },
        items: [{
            itemId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            chance: { type: Number, default: 100, min: 0, max: 100 }
        }],
        cultivation: { type: Number, default: 0, min: 0 },
        reputation: { type: Number, default: 0, min: 0 }
    },
    
    // Time Limits
    timeLimit: {
        enabled: { type: Boolean, default: false },
        duration: { type: Number, default: 0, min: 0 }, // in minutes
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null }
    },
    
    // Cooldown
    cooldown: {
        enabled: { type: Boolean, default: false },
        duration: { type: Number, default: 0, min: 0 }, // in minutes
        lastCompleted: { type: Date, default: null }
    },
    
    // Quest State
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Completed', 'Expired', 'Cancelled'],
        default: 'Active'
    },
    isRepeatable: { type: Boolean, default: false },
    maxCompletions: { type: Number, default: 1, min: 1 },
    currentCompletions: { type: Number, default: 0, min: 0 },
    
    // Prerequisites
    prerequisites: {
        completedQuests: [{ type: String }],
        guildLevel: { type: Number, default: 0, min: 0 },
        arenaRank: { type: String, default: null },
        totalPlayTime: { type: Number, default: 0, min: 0 } // in minutes
    },
    
    // Quest Chain
    questChain: {
        chainId: { type: String, default: null },
        chainOrder: { type: Number, default: 0, min: 0 },
        isChainStart: { type: Boolean, default: false },
        nextQuestId: { type: String, default: null }
    },
    
    // Statistics
    statistics: {
        totalAccepted: { type: Number, default: 0, min: 0 },
        totalCompleted: { type: Number, default: 0, min: 0 },
        totalAbandoned: { type: Number, default: 0, min: 0 },
        averageCompletionTime: { type: Number, default: 0, min: 0 }, // in minutes
        successRate: { type: Number, default: 0, min: 0, max: 100 }
    },
    
    // Event Data
    eventData: {
        eventId: { type: String, default: null },
        eventStartTime: { type: Date, default: null },
        eventEndTime: { type: Date, default: null },
        eventMultiplier: { type: Number, default: 1, min: 0 }
    }
}, {
    timestamps: true,
    collection: 'quests'
});

// Indexes
questSchema.index({ questId: 1 });
questSchema.index({ type: 1 });
questSchema.index({ category: 1 });
questSchema.index({ difficulty: 1 });
questSchema.index({ status: 1 });
questSchema.index({ 'requirements.level': 1 });
questSchema.index({ 'questChain.chainId': 1 });
questSchema.index({ 'eventData.eventId': 1 });

// Virtual for completion percentage
questSchema.virtual('completionPercentage').get(function() {
    if (this.objectives.length === 0) return 0;
    
    let totalProgress = 0;
    this.objectives.forEach(objective => {
        totalProgress += (objective.currentValue / objective.targetValue) * 100;
    });
    
    return Math.min(100, totalProgress / this.objectives.length);
});

// Virtual for is completed
questSchema.virtual('isCompleted').get(function() {
    return this.objectives.every(objective => 
        objective.currentValue >= objective.targetValue
    );
});

// Methods
questSchema.methods.updateObjective = function(objectiveType, targetId, amount = 1) {
    const objective = this.objectives.find(obj => 
        obj.type === objectiveType && 
        (obj.targetId === targetId || obj.targetId === null)
    );
    
    if (objective) {
        objective.currentValue = Math.min(objective.targetValue, objective.currentValue + amount);
        return true;
    }
    
    return false;
};

questSchema.methods.resetObjectives = function() {
    this.objectives.forEach(objective => {
        objective.currentValue = 0;
    });
    return this;
};

questSchema.methods.canAccept = function(player) {
    // Check level requirement
    if (player.level < this.requirements.level) {
        return { canAccept: false, reason: 'Level requirement not met' };
    }
    
    // Check cultivation requirement
    if (this.requirements.cultivation.realm && 
        player.cultivation.realm !== this.requirements.cultivation.realm) {
        return { canAccept: false, reason: 'Cultivation realm requirement not met' };
    }
    
    if (player.cultivation.stage < this.requirements.cultivation.stage) {
        return { canAccept: false, reason: 'Cultivation stage requirement not met' };
    }
    
    // Check previous quests
    for (const questId of this.requirements.previousQuests) {
        const completedQuest = player.activeQuests.find(q => 
            q.questId === questId && q.completedAt !== null
        );
        if (!completedQuest) {
            return { canAccept: false, reason: 'Previous quest not completed' };
        }
    }
    
    // Check items
    for (const requiredItem of this.requirements.items) {
        const playerItem = player.inventory.items.find(item => 
            item.itemId === requiredItem.itemId
        );
        if (!playerItem || playerItem.quantity < requiredItem.quantity) {
            return { canAccept: false, reason: 'Required items not available' };
        }
    }
    
    // Check resources
    if (player.resources.gold < this.requirements.gold) {
        return { canAccept: false, reason: 'Insufficient gold' };
    }
    
    if (player.resources.spirit_stones < this.requirements.spiritStones) {
        return { canAccept: false, reason: 'Insufficient spirit stones' };
    }
    
    // Check cooldown
    if (this.cooldown.enabled && this.cooldown.lastCompleted) {
        const cooldownEnd = new Date(this.cooldown.lastCompleted.getTime() + this.cooldown.duration * 60000);
        if (new Date() < cooldownEnd) {
            return { canAccept: false, reason: 'Quest is on cooldown' };
        }
    }
    
    // Check max completions
    if (this.currentCompletions >= this.maxCompletions) {
        return { canAccept: false, reason: 'Quest completed maximum times' };
    }
    
    return { canAccept: true };
};

questSchema.methods.giveRewards = function(player) {
    // Give experience
    if (this.rewards.exp > 0) {
        player.addExperience(this.rewards.exp);
    }
    
    // Give resources
    if (this.rewards.gold > 0) {
        player.resources.gold += this.rewards.gold;
    }
    
    if (this.rewards.spiritStones > 0) {
        player.resources.spirit_stones += this.rewards.spiritStones;
    }
    
    if (this.rewards.kimNguyenBao > 0) {
        player.resources.kim_nguyen_bao += this.rewards.kimNguyenBao;
    }
    
    // Give items
    for (const rewardItem of this.rewards.items) {
        const chance = Math.random() * 100;
        if (chance <= rewardItem.chance) {
            player.addItem(rewardItem.itemId, rewardItem.quantity);
        }
    }
    
    // Give cultivation progress
    if (this.rewards.cultivation > 0) {
        player.cultivation.progress += this.rewards.cultivation;
    }
    
    // Update statistics
    this.statistics.totalCompleted++;
    this.currentCompletions++;
    this.cooldown.lastCompleted = new Date();
    
    return this;
};

module.exports = mongoose.model('Quest', questSchema);
