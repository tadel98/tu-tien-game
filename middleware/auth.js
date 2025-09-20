const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// JWT Authentication Middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token, truy cập bị từ chối'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get player from database
        const player = await Player.findById(decoded.player.id).select('-password');
        
        if (!player) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        // Check if account is locked
        if (player.isAccountLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần'
            });
        }

        // Add player to request object
        req.player = {
            id: player._id,
            playerId: player.playerId,
            username: player.username,
            name: player.name,
            email: player.email,
            isVerified: player.isVerified
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực'
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            req.player = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const player = await Player.findById(decoded.player.id).select('-password');
        
        if (player && !player.isAccountLocked()) {
            req.player = {
                id: player._id,
                playerId: player.playerId,
                username: player.username,
                name: player.name,
                email: player.email,
                isVerified: player.isVerified
            };
        } else {
            req.player = null;
        }

        next();
    } catch (error) {
        req.player = null;
        next();
    }
};

// Check if player is verified
const requireVerification = (req, res, next) => {
    if (!req.player) {
        return res.status(401).json({
            success: false,
            message: 'Cần đăng nhập để truy cập'
        });
    }

    if (!req.player.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.'
        });
    }

    next();
};

// Check if player is admin (example)
const requireAdmin = (req, res, next) => {
    if (!req.player) {
        return res.status(401).json({
            success: false,
            message: 'Cần đăng nhập để truy cập'
        });
    }

    // Add admin check logic here
    // For now, we'll check if username contains 'admin'
    if (!req.player.username.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'Cần quyền admin để truy cập'
        });
    }

    next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = (req, res, next) => {
    // This would integrate with your rate limiting system
    // For now, we'll just pass through
    next();
};

// Validate player ownership
const validatePlayerOwnership = (req, res, next) => {
    const requestedPlayerId = req.params.playerId || req.params.id;
    
    if (!requestedPlayerId) {
        return res.status(400).json({
            success: false,
            message: 'Player ID là bắt buộc'
        });
    }

    if (req.player.playerId !== requestedPlayerId && !req.player.username.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập tài khoản này'
        });
    }

    next();
};

// Check account status
const checkAccountStatus = async (req, res, next) => {
    try {
        if (!req.player) {
            return next();
        }

        const player = await Player.findById(req.player.id);
        
        if (!player) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại'
            });
        }

        // Check if account is locked
        if (player.isAccountLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần'
            });
        }

        // Check if account is verified (for sensitive operations)
        if (req.path.includes('/sensitive') && !player.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản chưa được xác thực'
            });
        }

        next();
    } catch (error) {
        console.error('Account status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra trạng thái tài khoản'
        });
    }
};

// Log authentication events
const logAuthEvent = (eventType) => {
    return (req, res, next) => {
        const logData = {
            eventType,
            playerId: req.player?.id,
            username: req.player?.username,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };

        console.log('Auth Event:', logData);
        
        // In production, you might want to send this to a logging service
        // or save to database
        
        next();
    };
};

module.exports = {
    authMiddleware,
    optionalAuth,
    requireVerification,
    requireAdmin,
    sensitiveOperationLimiter,
    validatePlayerOwnership,
    checkAccountStatus,
    logAuthEvent
};
