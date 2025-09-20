const mongoose = require('mongoose');
const config = require('../config/database');

class DatabaseConnection {
    constructor() {
        this.isConnected = false;
        this.connection = null;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('Database already connected');
                return this.connection;
            }

            console.log('Connecting to MongoDB...');
            
            this.connection = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
            
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            
            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('✅ MongoDB reconnected');
                this.isConnected = true;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected && this.connection) {
                await mongoose.disconnect();
                this.isConnected = false;
                console.log('✅ MongoDB disconnected gracefully');
            }
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getConnection() {
        return this.connection;
    }

    isConnectedToDatabase() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    // Health check
    async healthCheck() {
        try {
            if (!this.isConnectedToDatabase()) {
                return { status: 'disconnected', message: 'Database not connected' };
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            
            return { 
                status: 'connected', 
                message: 'Database is healthy',
                readyState: mongoose.connection.readyState,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name
            };
        } catch (error) {
            return { 
                status: 'error', 
                message: 'Database health check failed',
                error: error.message 
            };
        }
    }

    // Get database statistics
    async getStats() {
        try {
            if (!this.isConnectedToDatabase()) {
                return null;
            }

            const stats = await mongoose.connection.db.stats();
            return {
                collections: stats.collections,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize,
                objects: stats.objects
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            return null;
        }
    }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
