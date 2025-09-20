const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/production');

class DatabaseBackup {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.dbName = 'tu-tien-game';
    }

    async createBackup() {
        try {
            console.log('🔄 Starting database backup...');
            
            // Create backup directory if it doesn't exist
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
            }

            const backupPath = path.join(this.backupDir, `backup-${this.timestamp}`);
            
            // Create backup using mongodump
            const command = `mongodump --db ${this.dbName} --out ${backupPath}`;
            
            await this.executeCommand(command);
            
            // Compress backup
            const compressedPath = `${backupPath}.tar.gz`;
            const compressCommand = `tar -czf ${compressedPath} -C ${this.backupDir} ${path.basename(backupPath)}`;
            
            await this.executeCommand(compressCommand);
            
            // Remove uncompressed backup
            await this.executeCommand(`rm -rf ${backupPath}`);
            
            console.log(`✅ Backup created: ${compressedPath}`);
            
            // Clean old backups
            await this.cleanOldBackups();
            
            return compressedPath;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            throw error;
        }
    }

    async restoreBackup(backupPath) {
        try {
            console.log('🔄 Starting database restore...');
            
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }

            // Extract backup if it's compressed
            let extractPath = backupPath;
            if (backupPath.endsWith('.tar.gz')) {
                extractPath = backupPath.replace('.tar.gz', '');
                const extractCommand = `tar -xzf ${backupPath} -C ${path.dirname(extractPath)}`;
                await this.executeCommand(extractCommand);
            }

            // Restore using mongorestore
            const command = `mongorestore --db ${this.dbName} --drop ${extractPath}/${this.dbName}`;
            
            await this.executeCommand(command);
            
            console.log('✅ Database restored successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Restore failed:', error);
            throw error;
        }
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.warn('Warning:', stderr);
                }
                resolve(stdout);
            });
        });
    }

    async cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backupFiles = files
                .filter(file => file.startsWith('backup-') && file.endsWith('.tar.gz'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    stats: fs.statSync(path.join(this.backupDir, file))
                }))
                .sort((a, b) => b.stats.mtime - a.stats.mtime);

            // Keep only last 7 backups
            const keepCount = 7;
            if (backupFiles.length > keepCount) {
                const filesToDelete = backupFiles.slice(keepCount);
                for (const file of filesToDelete) {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Deleted old backup: ${file.name}`);
                }
            }
        } catch (error) {
            console.error('❌ Error cleaning old backups:', error);
        }
    }

    async listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backupFiles = files
                .filter(file => file.startsWith('backup-') && file.endsWith('.tar.gz'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        size: this.formatBytes(stats.size),
                        created: stats.mtime,
                        path: filePath
                    };
                })
                .sort((a, b) => b.created - a.created);

            return backupFiles;
        } catch (error) {
            console.error('❌ Error listing backups:', error);
            return [];
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI usage
if (require.main === module) {
    const backup = new DatabaseBackup();
    const command = process.argv[2];
    
    switch (command) {
        case 'create':
            backup.createBackup()
                .then(path => {
                    console.log(`✅ Backup created: ${path}`);
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ Backup failed:', error);
                    process.exit(1);
                });
            break;
            
        case 'restore':
            const backupPath = process.argv[3];
            if (!backupPath) {
                console.error('❌ Please provide backup path');
                process.exit(1);
            }
            
            backup.restoreBackup(backupPath)
                .then(() => {
                    console.log('✅ Restore completed');
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ Restore failed:', error);
                    process.exit(1);
                });
            break;
            
        case 'list':
            backup.listBackups()
                .then(backups => {
                    console.log('📋 Available backups:');
                    backups.forEach(backup => {
                        console.log(`  ${backup.name} (${backup.size}) - ${backup.created}`);
                    });
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ List failed:', error);
                    process.exit(1);
                });
            break;
            
        default:
            console.log('Usage: node backup-database.js [create|restore|list] [backup-path]');
            process.exit(1);
    }
}

module.exports = DatabaseBackup;
