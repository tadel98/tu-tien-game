const mongoose = require('mongoose');

// Guild Schema - Dữ liệu động của bang hội
const guildSchema = new mongoose.Schema({
    // Basic Info
    guildId: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 50, unique: true },
    description: { type: String, maxlength: 500 },
    tag: { type: String, maxlength: 10, unique: true },
    
    // Guild Level & Stats
    level: { type: Number, default: 1, min: 1, max: 100 },
    experience: { type: Number, default: 0, min: 0 },
    experienceToNext: { type: Number, default: 1000, min: 0 },
    
    // Resources
    resources: {
        gold: { type: Number, default: 0, min: 0 },
        spirit_stones: { type: Number, default: 0, min: 0 },
        contribution_points: { type: Number, default: 0, min: 0 }
    },
    
    // Members
    members: [{
        playerId: { type: String, required: true },
        name: { type: String, required: true },
        rank: { 
            type: String, 
            enum: ['Leader', 'Vice Leader', 'Elder', 'Member', 'Recruit'],
            default: 'Member'
        },
        joinDate: { type: Date, default: Date.now },
        contribution: { type: Number, default: 0, min: 0 },
        lastActive: { type: Date, default: Date.now },
        permissions: [{ type: String }]
    }],
    
    // Guild Facilities
    facilities: {
        cultivation_hall: {
            level: { type: Number, default: 1, min: 1, max: 20 },
            experience: { type: Number, default: 0, min: 0 },
            experienceToNext: { type: Number, default: 1000, min: 0 },
            benefits: {
                exp_bonus: { type: Number, default: 0, min: 0, max: 100 },
                cultivation_speed: { type: Number, default: 0, min: 0, max: 50 }
            }
        },
        treasure_vault: {
            level: { type: Number, default: 1, min: 1, max: 20 },
            experience: { type: Number, default: 0, min: 0 },
            experienceToNext: { type: Number, default: 1000, min: 0 },
            benefits: {
                storage_capacity: { type: Number, default: 100, min: 0 },
                item_rarity_bonus: { type: Number, default: 0, min: 0, max: 20 }
            }
        },
        war_hall: {
            level: { type: Number, default: 1, min: 1, max: 20 },
            experience: { type: Number, default: 0, min: 0 },
            experienceToNext: { type: Number, default: 1000, min: 0 },
            benefits: {
                attack_bonus: { type: Number, default: 0, min: 0, max: 30 },
                defense_bonus: { type: Number, default: 0, min: 0, max: 30 }
            }
        },
        library: {
            level: { type: Number, default: 1, min: 1, max: 20 },
            experience: { type: Number, default: 0, min: 0 },
            experienceToNext: { type: Number, default: 1000, min: 0 },
            benefits: {
                skill_bonus: { type: Number, default: 0, min: 0, max: 25 },
                research_speed: { type: Number, default: 0, min: 0, max: 40 }
            }
        }
    },
    
    // Guild Activities
    activities: {
        lastBossHunt: { type: Date, default: null },
        lastGuildWar: { type: Date, default: null },
        lastContribution: { type: Date, default: null },
        weeklyContribution: { type: Number, default: 0, min: 0 },
        monthlyContribution: { type: Number, default: 0, min: 0 }
    },
    
    // Guild Wars
    wars: [{
        warId: { type: String, required: true },
        opponentGuildId: { type: String, required: true },
        opponentGuildName: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: { 
            type: String, 
            enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
            default: 'Scheduled'
        },
        result: { 
            type: String, 
            enum: ['Victory', 'Defeat', 'Draw', 'Pending'],
            default: 'Pending'
        },
        score: { type: Number, default: 0, min: 0 },
        opponentScore: { type: Number, default: 0, min: 0 }
    }],
    
    // Guild Rankings
    rankings: {
        power: { type: Number, default: 0, min: 0 },
        wealth: { type: Number, default: 0, min: 0 },
        activity: { type: Number, default: 0, min: 0 },
        lastUpdated: { type: Date, default: Date.now }
    },
    
    // Settings
    settings: {
        maxMembers: { type: Number, default: 50, min: 10, max: 200 },
        autoAccept: { type: Boolean, default: false },
        minLevelToJoin: { type: Number, default: 1, min: 1, max: 100 },
        minContributionToStay: { type: Number, default: 0, min: 0 },
        warParticipation: { type: Boolean, default: true },
        publicGuild: { type: Boolean, default: true }
    },
    
    // Guild History
    history: [{
        type: { 
            type: String, 
            enum: ['Created', 'MemberJoined', 'MemberLeft', 'MemberPromoted', 'MemberDemoted', 'LevelUp', 'WarWon', 'WarLost', 'BossDefeated'],
            required: true
        },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        playerId: { type: String, default: null },
        playerName: { type: String, default: null },
        data: { type: mongoose.Schema.Types.Mixed, default: {} }
    }]
}, {
    timestamps: true,
    collection: 'guilds'
});

// Indexes
guildSchema.index({ guildId: 1 });
guildSchema.index({ name: 1 });
guildSchema.index({ tag: 1 });
guildSchema.index({ level: -1 });
guildSchema.index({ 'rankings.power': -1 });
guildSchema.index({ 'rankings.wealth': -1 });
guildSchema.index({ 'rankings.activity': -1 });
guildSchema.index({ 'members.playerId': 1 });

// Virtual for member count
guildSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Virtual for total power
guildSchema.virtual('totalPower').get(function() {
    return this.rankings.power;
});

// Methods
guildSchema.methods.addMember = function(playerId, playerName, rank = 'Member') {
    // Check if already a member
    if (this.members.find(member => member.playerId === playerId)) {
        return false;
    }
    
    // Check member limit
    if (this.members.length >= this.settings.maxMembers) {
        return false;
    }
    
    this.members.push({
        playerId,
        name: playerName,
        rank,
        joinDate: new Date(),
        contribution: 0,
        lastActive: new Date(),
        permissions: []
    });
    
    // Add to history
    this.history.push({
        type: 'MemberJoined',
        description: `${playerName} đã tham gia bang hội`,
        playerId,
        playerName
    });
    
    return true;
};

guildSchema.methods.removeMember = function(playerId) {
    const memberIndex = this.members.findIndex(member => member.playerId === playerId);
    
    if (memberIndex !== -1) {
        const member = this.members[memberIndex];
        this.members.splice(memberIndex, 1);
        
        // Add to history
        this.history.push({
            type: 'MemberLeft',
            description: `${member.name} đã rời khỏi bang hội`,
            playerId,
            playerName: member.name
        });
        
        return true;
    }
    
    return false;
};

guildSchema.methods.updateMemberContribution = function(playerId, amount) {
    const member = this.members.find(member => member.playerId === playerId);
    
    if (member) {
        member.contribution += amount;
        member.lastActive = new Date();
        
        // Update guild resources
        this.resources.contribution_points += amount;
        this.activities.weeklyContribution += amount;
        this.activities.monthlyContribution += amount;
        this.activities.lastContribution = new Date();
        
        return true;
    }
    
    return false;
};

guildSchema.methods.promoteMember = function(playerId, newRank) {
    const member = this.members.find(member => member.playerId === playerId);
    
    if (member) {
        const oldRank = member.rank;
        member.rank = newRank;
        
        // Add to history
        this.history.push({
            type: 'MemberPromoted',
            description: `${member.name} được thăng cấp từ ${oldRank} lên ${newRank}`,
            playerId,
            playerName: member.name,
            data: { oldRank, newRank }
        });
        
        return true;
    }
    
    return false;
};

guildSchema.methods.addExperience = function(amount) {
    this.experience += amount;
    
    // Check for level up
    while (this.experience >= this.experienceToNext) {
        this.experience -= this.experienceToNext;
        this.level++;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
        
        // Increase max members
        this.settings.maxMembers = Math.min(200, 50 + (this.level - 1) * 3);
        
        // Add to history
        this.history.push({
            type: 'LevelUp',
            description: `Bang hội lên cấp ${this.level}`,
            data: { newLevel: this.level }
        });
    }
    
    return this;
};

module.exports = mongoose.model('Guild', guildSchema);
