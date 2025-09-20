const mongoose = require('mongoose');

// Player Schema - Dữ liệu động của người chơi
const playerSchema = new mongoose.Schema({
    // Authentication Info
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-zA-Z0-9_]+$/
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    email: { 
        type: String, 
        unique: true, 
        sparse: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    
    // Basic Info
    playerId: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 50 },
    
    // Character Stats
    level: { type: Number, default: 1, min: 1, max: 1000 },
    experience: { type: Number, default: 0, min: 0 },
    experienceToNext: { type: Number, default: 100, min: 0 },
    
    // Health & Mana
    health: { type: Number, default: 100, min: 0 },
    maxHealth: { type: Number, default: 100, min: 1 },
    mana: { type: Number, default: 50, min: 0 },
    maxMana: { type: Number, default: 50, min: 1 },
    
    // Cultivation System
    cultivation: {
        realm: { type: String, default: 'Phàm Nhân' },
        stage: { type: Number, default: 1, min: 1 },
        progress: { type: Number, default: 0, min: 0 },
        progressToNext: { type: Number, default: 1000, min: 0 }
    },
    
    // Character Stats
    stats: {
        attack: { type: Number, default: 10, min: 0 },
        defense: { type: Number, default: 5, min: 0 },
        speed: { type: Number, default: 8, min: 0 },
        intelligence: { type: Number, default: 5, min: 0 },
        luck: { type: Number, default: 5, min: 0 }
    },
    
    // Resources
    resources: {
        gold: { type: Number, default: 100, min: 0 },
        spirit_stones: { type: Number, default: 0, min: 0 },
        cultivation_pills: { type: Number, default: 0, min: 0 },
        kim_nguyen_bao: { type: Number, default: 0, min: 0 }
    },
    
    // Companions
    pet: {
        petId: { type: String, default: null },
        name: { type: String, default: null },
        level: { type: Number, default: 1, min: 1 },
        experience: { type: Number, default: 0, min: 0 },
        experienceToNext: { type: Number, default: 1000, min: 0 },
        stats: {
            attack: { type: Number, default: 0, min: 0 },
            defense: { type: Number, default: 0, min: 0 },
            speed: { type: Number, default: 0, min: 0 },
            intelligence: { type: Number, default: 0, min: 0 },
            luck: { type: Number, default: 0, min: 0 }
        },
        skills: [{ type: mongoose.Schema.Types.Mixed }],
        equipment: {
            collar: { type: String, default: null },
            charm: { type: String, default: null },
            accessory: { type: String, default: null }
        },
        happiness: { type: Number, default: 100, min: 0, max: 100 },
        lastFed: { type: Date, default: Date.now },
        evolution: {
            canEvolve: { type: Boolean, default: false },
            nextForm: { type: String, default: null },
            requirements: { type: mongoose.Schema.Types.Mixed, default: {} }
        }
    },
    
    wife: {
        wifeId: { type: String, default: null },
        name: { type: String, default: null },
        level: { type: Number, default: 1, min: 1 },
        experience: { type: Number, default: 0, min: 0 },
        experienceToNext: { type: Number, default: 2000, min: 0 },
        stats: {
            attack: { type: Number, default: 0, min: 0 },
            defense: { type: Number, default: 0, min: 0 },
            speed: { type: Number, default: 0, min: 0 },
            intelligence: { type: Number, default: 0, min: 0 },
            luck: { type: Number, default: 0, min: 0 }
        },
        skills: [{ type: mongoose.Schema.Types.Mixed }],
        affinity: {
            current: { type: Number, default: 0, min: 0 },
            max: { type: Number, default: 1000, min: 0 },
            level: { type: Number, default: 0, min: 0 }
        },
        equipment: {
            dress: { type: String, default: null },
            jewelry: { type: String, default: null },
            shoes: { type: String, default: null }
        },
        mood: { type: Number, default: 100, min: 0, max: 100 },
        lastGift: { type: Date, default: Date.now },
        gifts: [{ type: String }]
    },
    
    // Inventory
    inventory: {
        items: [{
            itemId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        equipment: {
            weapon: { type: String, default: null },
            helmet: { type: String, default: null },
            armor: { type: String, default: null },
            pants: { type: String, default: null },
            boots: { type: String, default: null },
            leftRing: { type: String, default: null },
            rightRing: { type: String, default: null },
            necklace: { type: String, default: null },
            belt: { type: String, default: null },
            gloves: { type: String, default: null }
        }
    },
    
    // Arena Stats
    arenaStats: {
        rank: { type: String, default: 'Chưa xếp hạng' },
        points: { type: Number, default: 1000, min: 0 },
        wins: { type: Number, default: 0, min: 0 },
        losses: { type: Number, default: 0, min: 0 },
        winStreak: { type: Number, default: 0, min: 0 },
        lastMatchTime: { type: Date, default: null }
    },
    
    // Active Quests
    activeQuests: [{
        questId: { type: String, required: true },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        acceptedAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null }
    }],
    
    // Guild Info
    guild: {
        guildId: { type: String, default: null },
        rank: { type: String, default: null },
        joinDate: { type: Date, default: null },
        contribution: { type: Number, default: 0, min: 0 },
        lastContributionTime: { type: Date, default: null },
        permissions: [{ type: String }]
    },
    
    // Authentication State
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    
    // Game State
    isOnline: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    lastLogout: { type: Date, default: null },
    totalPlayTime: { type: Number, default: 0, min: 0 }, // in minutes
    
    // Position & Room
    currentRoom: { type: String, default: 'main_room' },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    
    // Settings
    settings: {
        language: { type: String, default: 'vi' },
        soundEnabled: { type: Boolean, default: true },
        musicEnabled: { type: Boolean, default: true },
        autoSave: { type: Boolean, default: true }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'players'
});

// Indexes for better performance
playerSchema.index({ playerId: 1 });
playerSchema.index({ username: 1 });
playerSchema.index({ email: 1 });
playerSchema.index({ name: 1 });
playerSchema.index({ level: -1 });
playerSchema.index({ 'arenaStats.points': -1 });
playerSchema.index({ isOnline: 1 });
playerSchema.index({ currentRoom: 1 });
playerSchema.index({ verificationToken: 1 });
playerSchema.index({ passwordResetToken: 1 });

// Virtual for total power calculation
playerSchema.virtual('totalPower').get(function() {
    let power = 0;
    
    // Base stats
    Object.values(this.stats).forEach(stat => power += stat);
    
    // Pet bonus (30% of pet power)
    if (this.pet && this.pet.petId) {
        const petPower = Object.values(this.pet.stats || {}).reduce((sum, stat) => sum + stat, 0);
        power += Math.floor(petPower * 0.3);
    }
    
    // Wife bonus (20% of wife power + affinity bonus)
    if (this.wife && this.wife.wifeId) {
        const wifePower = Object.values(this.wife.stats || {}).reduce((sum, stat) => sum + stat, 0);
        power += Math.floor(wifePower * 0.2);
        
        if (this.wife.affinity) {
            power += (this.wife.affinity.level || 0) * 10;
        }
    }
    
    return Math.floor(power);
});

// Methods
playerSchema.methods.calculatePower = function() {
    return this.totalPower;
};

playerSchema.methods.addExperience = function(amount) {
    this.experience += amount;
    
    // Check for level up
    while (this.experience >= this.experienceToNext) {
        this.experience -= this.experienceToNext;
        this.level++;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        // Increase stats on level up
        Object.keys(this.stats).forEach(stat => {
            this.stats[stat] += 2;
        });
        
        // Increase health and mana
        this.maxHealth += 20;
        this.health = this.maxHealth; // Full heal on level up
        this.maxMana += 10;
        this.mana = this.maxMana; // Full mana on level up
    }
    
    return this;
};

playerSchema.methods.addItem = function(itemId, quantity = 1) {
    const existingItem = this.inventory.items.find(item => item.itemId === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.inventory.items.push({ itemId, quantity });
    }
    
    return this;
};

playerSchema.methods.removeItem = function(itemId, quantity = 1) {
    const itemIndex = this.inventory.items.findIndex(item => item.itemId === itemId);
    
    if (itemIndex !== -1) {
        const item = this.inventory.items[itemIndex];
        item.quantity -= quantity;
        
        if (item.quantity <= 0) {
            this.inventory.items.splice(itemIndex, 1);
        }
        
        return true;
    }
    
    return false;
};

// Authentication methods
playerSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
};

playerSchema.methods.generateAuthToken = function() {
    const jwt = require('jsonwebtoken');
    const payload = {
        player: {
            id: this._id,
            playerId: this.playerId,
            username: this.username
        }
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

playerSchema.methods.generateVerificationToken = function() {
    const crypto = require('crypto');
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    return this.verificationToken;
};

playerSchema.methods.generatePasswordResetToken = function() {
    const crypto = require('crypto');
    this.passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetExpires = Date.now() + 3600000; // 1 hour
    return this.passwordResetToken;
};

playerSchema.methods.isAccountLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

playerSchema.methods.incrementLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

playerSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

module.exports = mongoose.model('Player', playerSchema);
