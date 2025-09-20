// Database Configuration
const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tu-tien-game',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    game: {
        maxPlayersPerRoom: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 50,
        gameTickRate: parseInt(process.env.GAME_TICK_RATE) || 20,
        autoSaveInterval: parseInt(process.env.AUTO_SAVE_INTERVAL) || 30000, // 30 seconds
    },
    server: {
        port: parseInt(process.env.PORT) || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};

module.exports = config;
