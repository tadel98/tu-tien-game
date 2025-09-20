const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Player = require('../models/Player');
const { validationResult } = require('express-validator');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
        this.bcryptRounds = parseInt(process.env.BCRYPT_ROOUNDS) || 12;
    }

    // Register new player
    async register(playerData) {
        try {
            const { username, password, email, name } = playerData;

            // Check if username already exists
            const existingPlayer = await Player.findOne({ 
                $or: [
                    { username: username.toLowerCase() },
                    { email: email?.toLowerCase() }
                ]
            });

            if (existingPlayer) {
                if (existingPlayer.username === username.toLowerCase()) {
                    throw new Error('Tên đăng nhập đã tồn tại');
                }
                if (existingPlayer.email === email?.toLowerCase()) {
                    throw new Error('Email đã được sử dụng');
                }
            }

            // Hash password
            const salt = await bcrypt.genSalt(this.bcryptRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Create new player
            const newPlayer = new Player({
                username: username.toLowerCase(),
                password: hashedPassword,
                email: email?.toLowerCase(),
                name: name || username,
                playerId: this.generatePlayerId(),
                verificationToken,
                isVerified: false
            });

            await newPlayer.save();

            // Generate auth token
            const token = newPlayer.generateAuthToken();

            return {
                success: true,
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
                token,
                player: {
                    id: newPlayer._id,
                    playerId: newPlayer.playerId,
                    username: newPlayer.username,
                    name: newPlayer.name,
                    email: newPlayer.email,
                    isVerified: newPlayer.isVerified
                }
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login player
    async login(credentials) {
        try {
            const { username, password } = credentials;

            // Find player by username
            const player = await Player.findOne({ 
                username: username.toLowerCase() 
            });

            if (!player) {
                throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            }

            // Check if account is locked
            if (player.isAccountLocked()) {
                throw new Error('Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 2 giờ.');
            }

            // Compare password
            const isMatch = await player.comparePassword(password);
            if (!isMatch) {
                await player.incrementLoginAttempts();
                throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            }

            // Reset login attempts on successful login
            await player.resetLoginAttempts();

            // Update last login
            player.lastLogin = new Date();
            await player.save();

            // Generate auth token
            const token = player.generateAuthToken();

            return {
                success: true,
                message: 'Đăng nhập thành công!',
                token,
                player: {
                    id: player._id,
                    playerId: player.playerId,
                    username: player.username,
                    name: player.name,
                    email: player.email,
                    isVerified: player.isVerified,
                    level: player.level,
                    health: player.health,
                    maxHealth: player.maxHealth,
                    mana: player.mana,
                    maxMana: player.maxMana,
                    cultivation: player.cultivation,
                    stats: player.stats,
                    resources: player.resources,
                    pet: player.pet,
                    wife: player.wife,
                    inventory: player.inventory,
                    arenaStats: player.arenaStats,
                    activeQuests: player.activeQuests,
                    guild: player.guild
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const player = await Player.findOne({ verificationToken: token });
            
            if (!player) {
                throw new Error('Token xác thực không hợp lệ');
            }

            player.isVerified = true;
            player.verificationToken = undefined;
            await player.save();

            return {
                success: true,
                message: 'Email đã được xác thực thành công!'
            };
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const player = await Player.findOne({ email: email.toLowerCase() });
            
            if (!player) {
                throw new Error('Email không tồn tại trong hệ thống');
            }

            const resetToken = player.generatePasswordResetToken();
            await player.save();

            // In a real application, you would send an email here
            console.log(`Password reset token for ${email}: ${resetToken}`);

            return {
                success: true,
                message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
                resetToken // Only for development/testing
            };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            const player = await Player.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!player) {
                throw new Error('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(this.bcryptRounds);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            player.password = hashedPassword;
            player.passwordResetToken = undefined;
            player.passwordResetExpires = undefined;
            await player.save();

            return {
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công!'
            };
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(playerId, currentPassword, newPassword) {
        try {
            const player = await Player.findById(playerId);
            
            if (!player) {
                throw new Error('Người chơi không tồn tại');
            }

            // Verify current password
            const isMatch = await player.comparePassword(currentPassword);
            if (!isMatch) {
                throw new Error('Mật khẩu hiện tại không đúng');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(this.bcryptRounds);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            player.password = hashedPassword;
            await player.save();

            return {
                success: true,
                message: 'Mật khẩu đã được thay đổi thành công!'
            };
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    // Verify JWT token
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const player = await Player.findById(decoded.player.id);
            
            if (!player) {
                throw new Error('Token không hợp lệ');
            }

            return {
                success: true,
                player: {
                    id: player._id,
                    playerId: player.playerId,
                    username: player.username,
                    name: player.name,
                    email: player.email,
                    isVerified: player.isVerified
                }
            };
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    // Refresh token
    async refreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const player = await Player.findById(decoded.player.id);
            
            if (!player) {
                throw new Error('Token không hợp lệ');
            }

            const newToken = player.generateAuthToken();

            return {
                success: true,
                token: newToken
            };
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    // Generate unique player ID
    generatePlayerId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `player_${timestamp}_${random}`;
    }

    // Validate input data
    validateRegistration(data) {
        const errors = [];

        if (!data.username || data.username.length < 3) {
            errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự');
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email không hợp lệ');
        }

        if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
            errors.push('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
        }

        return errors;
    }

    // Validate login data
    validateLogin(data) {
        const errors = [];

        if (!data.username) {
            errors.push('Tên đăng nhập là bắt buộc');
        }

        if (!data.password) {
            errors.push('Mật khẩu là bắt buộc');
        }

        return errors;
    }
}

module.exports = new AuthService();
