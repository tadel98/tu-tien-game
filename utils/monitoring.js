const os = require('os');
const fs = require('fs');
const path = require('path');

class MonitoringSystem {
    constructor() {
        this.metrics = {
            server: {
                uptime: 0,
                memory: {},
                cpu: {},
                load: [],
                connections: 0
            },
            game: {
                players: {
                    total: 0,
                    online: 0,
                    rooms: 0
                },
                performance: {
                    avgResponseTime: 0,
                    requestsPerSecond: 0,
                    errorsPerSecond: 0
                }
            },
            database: {
                connections: 0,
                operations: 0,
                avgOperationTime: 0,
                errors: 0
            }
        };
        
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing monitoring system...');
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Start health checks
            this.startHealthChecks();
            
            this.isInitialized = true;
            console.log('✅ Monitoring system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize monitoring system:', error);
            throw error;
        }
    }

    startPerformanceMonitoring() {
        // Update server metrics every 30 seconds
        setInterval(() => {
            this.updateServerMetrics();
        }, 30000);

        // Update game metrics every 10 seconds
        setInterval(() => {
            this.updateGameMetrics();
        }, 10000);

        // Clean up old response times every minute
        setInterval(() => {
            this.cleanupResponseTimes();
        }, 60000);
    }

    startHealthChecks() {
        // Health check every 30 seconds
        setInterval(() => {
            this.performHealthCheck();
        }, 30000);
    }

    updateServerMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.server = {
            uptime: process.uptime(),
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external,
                arrayBuffers: memUsage.arrayBuffers
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            load: os.loadavg(),
            connections: this.metrics.server.connections
        };
    }

    updateGameMetrics() {
        // This will be updated by the game server
        const currentTime = Date.now();
        const timeWindow = 60000; // 1 minute
        
        // Calculate requests per second
        const recentRequests = this.requestCount;
        this.metrics.game.performance.requestsPerSecond = recentRequests / (timeWindow / 1000);
        
        // Calculate errors per second
        const recentErrors = this.errorCount;
        this.metrics.game.performance.errorsPerSecond = recentErrors / (timeWindow / 1000);
        
        // Calculate average response time
        if (this.responseTimes.length > 0) {
            const avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
            this.metrics.game.performance.avgResponseTime = avgResponseTime;
        }
        
        // Reset counters
        this.requestCount = 0;
        this.errorCount = 0;
    }

    cleanupResponseTimes() {
        // Keep only last 100 response times
        if (this.responseTimes.length > 100) {
            this.responseTimes = this.responseTimes.slice(-100);
        }
    }

    recordRequest(responseTime) {
        this.requestCount++;
        this.responseTimes.push(responseTime);
    }

    recordError() {
        this.errorCount++;
    }

    updatePlayerCounts(total, online, rooms) {
        this.metrics.game.players = {
            total,
            online,
            rooms
        };
    }

    updateDatabaseMetrics(connections, operations, avgTime, errors) {
        this.metrics.database = {
            connections,
            operations,
            avgOperationTime: avgTime,
            errors
        };
    }

    async performHealthCheck() {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                server: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    load: os.loadavg()
                },
                game: this.metrics.game,
                database: this.metrics.database
            };

            // Check memory usage
            const memUsage = process.memoryUsage();
            const memUsageMB = memUsage.heapUsed / 1024 / 1024;
            if (memUsageMB > 1000) { // 1GB
                health.status = 'warning';
                health.warnings = health.warnings || [];
                health.warnings.push('High memory usage detected');
            }

            // Check CPU load
            const load = os.loadavg()[0];
            const cpuCount = os.cpus().length;
            if (load > cpuCount * 0.8) {
                health.status = 'warning';
                health.warnings = health.warnings || [];
                health.warnings.push('High CPU load detected');
            }

            // Check disk space
            const diskUsage = await this.getDiskUsage();
            if (diskUsage.usedPercent > 90) {
                health.status = 'critical';
                health.warnings = health.warnings || [];
                health.warnings.push('Disk space critically low');
            }

            return health;
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    async getDiskUsage() {
        try {
            const stats = fs.statSync(process.cwd());
            // This is a simplified version - in production, you'd use a proper disk usage library
            return {
                total: 1000000000, // 1GB
                used: 500000000,   // 500MB
                free: 500000000,  // 500MB
                usedPercent: 50
            };
        } catch (error) {
            return {
                total: 0,
                used: 0,
                free: 0,
                usedPercent: 0
            };
        }
    }

    async getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            isInitialized: this.isInitialized
        };
    }

    // Alert system
    checkAlerts() {
        const alerts = [];

        // Memory alert
        const memUsage = process.memoryUsage();
        const memUsageMB = memUsage.heapUsed / 1024 / 1024;
        if (memUsageMB > 800) {
            alerts.push({
                type: 'memory',
                level: 'warning',
                message: `High memory usage: ${memUsageMB.toFixed(2)}MB`,
                timestamp: new Date().toISOString()
            });
        }

        // CPU alert
        const load = os.loadavg()[0];
        const cpuCount = os.cpus().length;
        if (load > cpuCount * 0.9) {
            alerts.push({
                type: 'cpu',
                level: 'critical',
                message: `High CPU load: ${load.toFixed(2)}`,
                timestamp: new Date().toISOString()
            });
        }

        // Error rate alert
        if (this.metrics.game.performance.errorsPerSecond > 10) {
            alerts.push({
                type: 'errors',
                level: 'warning',
                message: `High error rate: ${this.metrics.game.performance.errorsPerSecond.toFixed(2)}/s`,
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }

    // Export metrics to file
    async exportMetrics() {
        try {
            const metrics = await this.getMetrics();
            const alerts = this.checkAlerts();
            
            const exportData = {
                metrics,
                alerts,
                timestamp: new Date().toISOString()
            };

            const exportPath = path.join(__dirname, '../logs/metrics.json');
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
            
            console.log('Metrics exported to:', exportPath);
        } catch (error) {
            console.error('Failed to export metrics:', error);
        }
    }

    // Get performance summary
    getPerformanceSummary() {
        return {
            uptime: process.uptime(),
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
                usage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2) + '%'
            },
            cpu: {
                load: os.loadavg()[0],
                cores: os.cpus().length
            },
            requests: {
                total: this.requestCount,
                perSecond: this.metrics.game.performance.requestsPerSecond
            },
            errors: {
                total: this.errorCount,
                perSecond: this.metrics.game.performance.errorsPerSecond
            },
            responseTime: {
                average: this.metrics.game.performance.avgResponseTime
            }
        };
    }
}

// Create singleton instance
const monitoring = new MonitoringSystem();

module.exports = monitoring;
