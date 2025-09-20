const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,
    defaultMeta: { service: 'tu-tien-game' },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: fileFormat
        }),
        
        // Combined log file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: fileFormat
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: fileFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: fileFormat
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Add console transport in production if enabled
if (process.env.LOG_CONSOLE_ENABLED === 'true') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Custom log levels
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'grey'
    }
};

winston.addColors(customLevels.colors);

// Game-specific logging methods
const gameLogger = {
    // Player actions
    playerJoin: (playerId, playerName, ip) => {
        logger.info('Player joined', {
            type: 'player_join',
            playerId,
            playerName,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    playerLeave: (playerId, playerName, duration) => {
        logger.info('Player left', {
            type: 'player_leave',
            playerId,
            playerName,
            duration,
            timestamp: new Date().toISOString()
        });
    },
    
    playerAction: (playerId, action, data) => {
        logger.info('Player action', {
            type: 'player_action',
            playerId,
            action,
            data,
            timestamp: new Date().toISOString()
        });
    },
    
    // Game events
    gameEvent: (eventType, data) => {
        logger.info('Game event', {
            type: 'game_event',
            eventType,
            data,
            timestamp: new Date().toISOString()
        });
    },
    
    // Database operations
    dbOperation: (operation, collection, duration, success) => {
        logger.info('Database operation', {
            type: 'db_operation',
            operation,
            collection,
            duration,
            success,
            timestamp: new Date().toISOString()
        });
    },
    
    // Security events
    securityEvent: (eventType, ip, details) => {
        logger.warn('Security event', {
            type: 'security_event',
            eventType,
            ip,
            details,
            timestamp: new Date().toISOString()
        });
    },
    
    // Performance metrics
    performance: (metric, value, unit) => {
        logger.info('Performance metric', {
            type: 'performance',
            metric,
            value,
            unit,
            timestamp: new Date().toISOString()
        });
    },
    
    // Error logging
    error: (error, context) => {
        logger.error('Application error', {
            type: 'error',
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }
};

// HTTP request logging
const httpLogger = winston.createLogger({
    level: 'http',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'http.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Socket.IO logging
const socketLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'socket.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Log rotation utility
const rotateLogs = () => {
    const logFiles = [
        'error.log',
        'combined.log',
        'http.log',
        'socket.log',
        'exceptions.log',
        'rejections.log'
    ];
    
    logFiles.forEach(file => {
        const filePath = path.join(logsDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            
            if (fileSizeInMB > 5) { // 5MB
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFile = path.join(logsDir, `${file}.${timestamp}`);
                fs.renameSync(filePath, rotatedFile);
                logger.info(`Rotated log file: ${file}`);
            }
        }
    });
};

// Schedule log rotation every hour
setInterval(rotateLogs, 60 * 60 * 1000);

// Export logger and utilities
module.exports = {
    logger,
    gameLogger,
    httpLogger,
    socketLogger,
    rotateLogs
};
