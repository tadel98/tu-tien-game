const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('express-validator');

// Security middleware for production
const securityMiddleware = (req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server header
    res.removeHeader('X-Powered-By');
    
    next();
};

// Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: message,
                retryAfter: Math.round(windowMs / 1000)
            });
        }
    });
};

// API rate limiting
const apiRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many API requests from this IP, please try again later.'
);

// Chat rate limiting
const chatRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    10, // 10 messages per minute
    'Too many chat messages, please slow down.'
);

// Login rate limiting
const loginRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 login attempts per window
    'Too many login attempts, please try again later.'
);

// Socket rate limiting
const socketRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    200, // 200 socket events per minute
    'Too many socket events, please slow down.'
);

// Input sanitization
const sanitizeInput = (req, res, next) => {
    // Sanitize string inputs
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = typeof obj[key] === 'string' 
                    ? sanitizeString(obj[key])
                    : sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    };

    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    next();
};

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',')
            : ['https://yourdomain.com'];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Request validation
const validateRequest = (req, res, next) => {
    // Check request size
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Request too large',
            maxSize: '10MB'
        });
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i
    ];
    
    const checkSuspicious = (obj) => {
        if (typeof obj === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(obj));
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(checkSuspicious);
        }
        return false;
    };
    
    if (checkSuspicious(req.body) || checkSuspicious(req.query)) {
        return res.status(400).json({
            error: 'Suspicious input detected'
        });
    }
    
    next();
};

// IP whitelist/blacklist
const ipFilter = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Blacklist (block these IPs)
    const blacklist = process.env.BLACKLIST_IPS 
        ? process.env.BLACKLIST_IPS.split(',')
        : [];
    
    if (blacklist.includes(clientIP)) {
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    
    // Whitelist (only allow these IPs if whitelist is enabled)
    if (process.env.WHITELIST_ENABLED === 'true') {
        const whitelist = process.env.WHITELIST_IPS 
            ? process.env.WHITELIST_IPS.split(',')
            : [];
        
        if (!whitelist.includes(clientIP)) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }
    }
    
    next();
};

// Request logging
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        
        if (res.statusCode >= 400) {
            console.warn('HTTP Error:', logData);
        } else {
            console.log('HTTP Request:', logData);
        }
    });
    
    next();
};

// Error handling
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
};

module.exports = {
    securityMiddleware,
    apiRateLimit,
    chatRateLimit,
    loginRateLimit,
    socketRateLimit,
    sanitizeInput,
    corsOptions,
    validateRequest,
    ipFilter,
    requestLogger,
    errorHandler,
    notFoundHandler
};
