# 🗄️ Database Setup Guide

## 📋 Tổng Quan

Game Tu Tiên Multiplayer sử dụng **MongoDB** để lưu trữ dữ liệu động và **GameData.js** cho dữ liệu tĩnh.

### 🏗️ Kiến Trúc Dữ Liệu

#### **📊 Dữ Liệu Động (MongoDB)**
- **Players**: Thông tin người chơi, stats, inventory, companions
- **Guilds**: Bang hội, thành viên, facilities, activities
- **Quests**: Nhiệm vụ, tiến độ, rewards
- **Arena**: Xếp hạng, lịch sử đấu
- **Game Events**: Sự kiện, logs, analytics

#### **📁 Dữ Liệu Tĩnh (GameData.js)**
- **Items**: Vật phẩm, trang bị, consumables
- **Pets**: Linh thú database
- **Wives**: Đạo lữ database
- **Skills**: Kỹ năng, abilities
- **Configs**: Cấu hình game, constants

## 🚀 Cài Đặt MongoDB

### **1. Cài Đặt MongoDB Community Server**

#### **Windows:**
```bash
# Download từ: https://www.mongodb.com/try/download/community
# Hoặc sử dụng Chocolatey:
choco install mongodb

# Hoặc sử dụng Scoop:
scoop install mongodb
```

#### **macOS:**
```bash
# Sử dụng Homebrew:
brew tap mongodb/brew
brew install mongodb-community
```

#### **Linux (Ubuntu/Debian):**
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

### **2. Khởi Động MongoDB**

#### **Windows:**
```bash
# Khởi động MongoDB service
net start MongoDB

# Hoặc chạy thủ công
mongod --dbpath C:\data\db
```

#### **macOS:**
```bash
# Khởi động MongoDB service
brew services start mongodb/brew/mongodb-community

# Hoặc chạy thủ công
mongod --config /usr/local/etc/mongod.conf
```

#### **Linux:**
```bash
# Khởi động MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Hoặc chạy thủ công
mongod --config /etc/mongod.conf
```

### **3. Kiểm Tra Kết Nối**

```bash
# Kết nối đến MongoDB
mongosh

# Hoặc sử dụng mongo client cũ
mongo
```

## 🔧 Cấu Hình Game

### **1. Environment Variables**

Tạo file `.env` trong thư mục gốc:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tu-tien-game
DB_NAME=tu-tien-game

# Server Configuration
PORT=3000
NODE_ENV=development

# Game Configuration
MAX_PLAYERS_PER_ROOM=50
GAME_TICK_RATE=20
AUTO_SAVE_INTERVAL=30000

# Security
JWT_SECRET=your-secret-key-here
ADMIN_PASSWORD=admin123
```

### **2. Database Schema**

#### **Players Collection:**
```javascript
{
  playerId: String (unique),
  name: String,
  level: Number,
  health: Number,
  maxHealth: Number,
  mana: Number,
  maxMana: Number,
  cultivation: {
    realm: String,
    stage: Number,
    progress: Number
  },
  stats: {
    attack: Number,
    defense: Number,
    speed: Number,
    intelligence: Number,
    luck: Number
  },
  resources: {
    gold: Number,
    spirit_stones: Number,
    kim_nguyen_bao: Number
  },
  pet: { /* Pet data */ },
  wife: { /* Wife data */ },
  inventory: { /* Inventory data */ },
  arenaStats: { /* Arena data */ },
  activeQuests: [ /* Quest data */ ],
  guild: { /* Guild data */ }
}
```

#### **Guilds Collection:**
```javascript
{
  guildId: String (unique),
  name: String,
  level: Number,
  members: [ /* Member data */ ],
  facilities: { /* Facility data */ },
  activities: { /* Activity data */ },
  rankings: { /* Ranking data */ }
}
```

#### **Quests Collection:**
```javascript
{
  questId: String (unique),
  title: String,
  description: String,
  type: String,
  objectives: [ /* Objective data */ ],
  rewards: { /* Reward data */ },
  requirements: { /* Requirement data */ }
}
```

## 🚀 Chạy Game

### **1. Khởi Động MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### **2. Cài Đặt Dependencies**
```bash
npm install
```

### **3. Chạy Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### **4. Truy Cập Game**
- **Game**: http://localhost:3000/game-multiplayer.html
- **Health Check**: http://localhost:3000/health
- **Database Stats**: http://localhost:3000/stats

## 📊 Monitoring & Maintenance

### **1. Health Check**
```bash
curl http://localhost:3000/health
```

### **2. Database Stats**
```bash
curl http://localhost:3000/stats
```

### **3. MongoDB Monitoring**
```bash
# Kết nối đến MongoDB
mongosh

# Xem databases
show dbs

# Chọn database
use tu-tien-game

# Xem collections
show collections

# Xem số lượng documents
db.players.countDocuments()
db.guilds.countDocuments()
db.quests.countDocuments()
```

### **4. Backup Database**
```bash
# Backup toàn bộ database
mongodump --db tu-tien-game --out ./backup

# Restore database
mongorestore --db tu-tien-game ./backup/tu-tien-game
```

## 🔧 Troubleshooting

### **1. MongoDB không khởi động**
```bash
# Kiểm tra log
tail -f /var/log/mongodb/mongod.log

# Kiểm tra port
netstat -tulpn | grep 27017

# Kiểm tra quyền truy cập
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### **2. Kết nối database thất bại**
```bash
# Kiểm tra MongoDB service
systemctl status mongod

# Kiểm tra kết nối
mongosh --host localhost --port 27017

# Kiểm tra firewall
sudo ufw status
```

### **3. Performance Issues**
```bash
# Kiểm tra index
db.players.getIndexes()

# Tạo index mới
db.players.createIndex({ "playerId": 1 })
db.players.createIndex({ "level": -1 })
db.players.createIndex({ "isOnline": 1 })
```

## 📈 Performance Optimization

### **1. Indexing**
- Tạo index cho các field thường query
- Sử dụng compound index cho queries phức tạp
- Monitor index usage

### **2. Caching**
- Sử dụng in-memory cache cho active players
- Implement Redis cho session management
- Cache static data từ GameData.js

### **3. Connection Pooling**
- Cấu hình maxPoolSize phù hợp
- Monitor connection usage
- Implement connection retry logic

## 🔒 Security

### **1. Authentication**
- Enable MongoDB authentication
- Sử dụng strong passwords
- Implement role-based access control

### **2. Network Security**
- Bind MongoDB chỉ localhost
- Sử dụng SSL/TLS
- Configure firewall rules

### **3. Data Validation**
- Sử dụng Mongoose schemas
- Implement data validation
- Sanitize user input

## 📚 Tài Liệu Tham Khảo

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Node.js MongoDB Driver](https://docs.mongodb.com/drivers/node/)
- [MongoDB Atlas (Cloud)](https://www.mongodb.com/atlas)

---

**🎮 Chúc bạn chơi game vui vẻ với database MongoDB!**
