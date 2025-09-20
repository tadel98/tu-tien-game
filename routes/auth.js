const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: {
        error: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.'
    }
});

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Tên đăng nhập phải có từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới')
        .toLowerCase(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Tên phải có từ 2-50 ký tự')
        .trim()
];

const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Tên đăng nhập là bắt buộc')
        .toLowerCase(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
];

// @route   POST /api/auth/register
// @desc    Register new player
// @access  Public
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { username, password, email, name } = req.body;

        // Additional validation
        const validationErrors = AuthService.validateRegistration({ username, password, email, name });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: validationErrors
            });
        }

        const result = await AuthService.register({ username, password, email, name });

        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Đăng ký thất bại'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login player
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Additional validation
        const validationErrors = AuthService.validateLogin({ username, password });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: validationErrors
            });
        }

        const result = await AuthService.login({ username, password });

        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Đăng nhập thất bại'
        });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token xác thực là bắt buộc'
            });
        }

        const result = await AuthService.verifyEmail(token);

        res.json(result);
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Xác thực email thất bại'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const result = await AuthService.forgotPassword(email);

        res.json(result);
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Gửi email đặt lại mật khẩu thất bại'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token và mật khẩu mới là bắt buộc'
            });
        }

        const result = await AuthService.resetPassword(token, newPassword);

        res.json(result);
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Đặt lại mật khẩu thất bại'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const playerId = req.player.id;

        const result = await AuthService.changePassword(playerId, currentPassword, newPassword);

        res.json(result);
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Thay đổi mật khẩu thất bại'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current player info
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const playerId = req.player.id;
        const Player = require('../models/Player');
        
        const player = await Player.findById(playerId).select('-password -verificationToken -passwordResetToken');
        
        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Người chơi không tồn tại'
            });
        }

        res.json({
            success: true,
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
                guild: player.guild,
                createdAt: player.createdAt,
                lastLogin: player.lastLogin
            }
        });
    } catch (error) {
        console.error('Get player info error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', authMiddleware, async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token là bắt buộc'
            });
        }

        const result = await AuthService.refreshToken(token);

        res.json(result);
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Làm mới token thất bại'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout player
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
});

module.exports = router;
