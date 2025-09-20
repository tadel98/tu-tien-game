// Production Configuration
const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        nodeEnv: 'production',
        cluster: process.env.CLUSTER_MODE === 'true',
        workers: process.env.WORKERS || require('os').cpus().length
    },

    // Database Configuration
    database: {
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tu-tien-game-prod',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 20,
                minPoolSize: 5,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                retryWrites: true,
                retryReads: true,
                readPreference: 'secondaryPreferred',
                writeConcern: {
                    w: 'majority',
                    j: true,
                    wtimeout: 10000
                }
            }
        },
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: process.env.REDIS_DB || 0,
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: null
        }
    },

    // Game Configuration
    game: {
        maxPlayersPerRoom: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 100,
        gameTickRate: parseInt(process.env.GAME_TICK_RATE) || 20,
        autoSaveInterval: parseInt(process.env.AUTO_SAVE_INTERVAL) || 30000,
        maxRooms: parseInt(process.env.MAX_ROOMS) || 50,
        playerTimeout: parseInt(process.env.PLAYER_TIMEOUT) || 300000, // 5 minutes
        maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        },
        cors: {
            origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://yourdomain.com'],
            credentials: true
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "wss:", "ws:"]
                }
            }
        }
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        file: {
            enabled: process.env.LOG_FILE_ENABLED === 'true',
            path: process.env.LOG_FILE_PATH || './logs/app.log',
            maxSize: process.env.LOG_MAX_SIZE || '10m',
            maxFiles: process.env.LOG_MAX_FILES || '5'
        },
        console: {
            enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
            colorize: process.env.LOG_COLORIZE !== 'false'
        }
    },

    // Monitoring Configuration
    monitoring: {
        enabled: process.env.MONITORING_ENABLED === 'true',
        metrics: {
            enabled: process.env.METRICS_ENABLED === 'true',
            port: parseInt(process.env.METRICS_PORT) || 9090
        },
        healthCheck: {
            enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
            interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
        }
    },

    // Cache Configuration
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
        max: parseInt(process.env.CACHE_MAX) || 1000
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Email Configuration (for notifications)
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_FROM || 'noreply@tu-tien-game.com'
    },

    // Backup Configuration
    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        interval: process.env.BACKUP_INTERVAL || '0 2 * * *', // Daily at 2 AM
        retention: parseInt(process.env.BACKUP_RETENTION) || 7, // 7 days
        path: process.env.BACKUP_PATH || './backups'
    }
};

module.exports = config;
