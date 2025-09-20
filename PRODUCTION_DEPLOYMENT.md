# 🚀 Production Deployment Guide

## 📋 Tổng Quan

Hướng dẫn triển khai game Tu Tiên Multiplayer lên production với đầy đủ tính năng bảo mật, monitoring và scaling.

## 🏗️ Kiến Trúc Production

### **📊 Infrastructure Stack:**
- **Application**: Node.js + Express + Socket.IO
- **Database**: MongoDB với replica set
- **Cache**: Redis
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Prometheus + Grafana
- **SSL**: Let's Encrypt

### **🔧 Production Features:**
- ✅ **Security**: Helmet, Rate Limiting, CORS, Input Validation
- ✅ **Performance**: Compression, Caching, Load Balancing
- ✅ **Monitoring**: Health Checks, Metrics, Logging
- ✅ **Scalability**: Cluster Mode, Auto-scaling
- ✅ **Reliability**: Auto-restart, Graceful Shutdown
- ✅ **Backup**: Automated Database Backups

## 🚀 Deployment Options

### **Option 1: Docker Compose (Recommended)**

#### **1.1. Chuẩn Bị Server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL)
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### **1.2. Cấu Hình Environment:**
```bash
# Copy environment file
cp env.production.example .env

# Edit environment variables
nano .env
```

#### **1.3. Deploy với Docker:**
```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f game-server
```

### **Option 2: PM2 Process Manager**

#### **2.1. Chuẩn Bị Server:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server -y
```

#### **2.2. Deploy Application:**
```bash
# Install dependencies
npm install --production

# Start with PM2
npm run pm2:start

# Check status
pm2 status
pm2 logs
```

### **Option 3: Kubernetes (Advanced)**

#### **3.1. Tạo Kubernetes Manifests:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tu-tien-game
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tu-tien-game
  template:
    metadata:
      labels:
        app: tu-tien-game
    spec:
      containers:
      - name: tu-tien-game
        image: tu-tien-game:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: tu-tien-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

## 🔒 Security Configuration

### **1. SSL/TLS Setup:**
```bash
# Generate SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Firewall Configuration:**
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **3. Database Security:**
```bash
# Enable MongoDB authentication
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled
```

## 📊 Monitoring & Logging

### **1. Health Checks:**
```bash
# Check application health
curl -f http://localhost:3000/health

# Check metrics
curl http://localhost:3000/metrics

# Check database stats
curl http://localhost:3000/stats
```

### **2. Log Management:**
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View PM2 logs
pm2 logs

# View Docker logs
docker-compose logs -f game-server
```

### **3. Performance Monitoring:**
```bash
# Monitor with PM2
pm2 monit

# Monitor with Docker
docker stats

# Monitor system resources
htop
```

## 🔄 Backup & Recovery

### **1. Database Backup:**
```bash
# Create backup
npm run backup:db

# List backups
node scripts/backup-database.js list

# Restore backup
npm run restore:db backup-2024-01-01T00-00-00-000Z.tar.gz
```

### **2. Automated Backups:**
```bash
# Add to crontab
crontab -e
# Add: 0 2 * * * cd /path/to/game && npm run backup:db
```

## 🚀 Scaling & Performance

### **1. Horizontal Scaling:**
```bash
# Scale with PM2
pm2 scale ecosystem.config.js 4

# Scale with Docker
docker-compose up -d --scale game-server=4
```

### **2. Load Balancing:**
```nginx
# nginx/conf.d/load-balancer.conf
upstream game_backend {
    server game-server-1:3000;
    server game-server-2:3000;
    server game-server-3:3000;
    server game-server-4:3000;
}
```

### **3. Database Optimization:**
```javascript
// Create indexes for better performance
db.players.createIndex({ "playerId": 1 })
db.players.createIndex({ "level": -1 })
db.players.createIndex({ "isOnline": 1 })
db.players.createIndex({ "currentRoom": 1 })
```

## 🔧 Maintenance

### **1. Updates:**
```bash
# Update application
git pull origin main
npm install
pm2 reload ecosystem.config.js

# Update with Docker
docker-compose pull
docker-compose up -d
```

### **2. Database Maintenance:**
```bash
# Compact database
mongo
use tu-tien-game
db.runCommand({ compact: "players" })

# Check database size
db.stats()
```

### **3. Log Rotation:**
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/tu-tien-game
# Add:
# /path/to/game/logs/*.log {
#     daily
#     missingok
#     rotate 7
#     compress
#     delaycompress
#     notifempty
#     create 644 nodejs nodejs
# }
```

## 🚨 Troubleshooting

### **1. Common Issues:**
```bash
# Application won't start
pm2 logs
docker-compose logs game-server

# Database connection issues
mongo --host localhost:27017 -u admin -p

# High memory usage
pm2 restart ecosystem.config.js
docker-compose restart game-server
```

### **2. Performance Issues:**
```bash
# Check CPU usage
top
htop

# Check memory usage
free -h
pm2 monit

# Check disk usage
df -h
du -sh logs/
```

### **3. Network Issues:**
```bash
# Check ports
netstat -tulpn | grep :3000
ss -tulpn | grep :3000

# Check firewall
sudo ufw status
```

## 📈 Monitoring Dashboard

### **1. Prometheus + Grafana:**
```bash
# Access Prometheus
http://yourdomain.com:9090

# Access Grafana
http://yourdomain.com:3001
# Login: admin / admin123
```

### **2. Custom Metrics:**
- **Application**: Response time, request rate, error rate
- **Database**: Connection count, operation time, query performance
- **System**: CPU, memory, disk, network
- **Game**: Player count, room count, match duration

## 🔐 Security Checklist

- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Database authentication enabled
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular backups scheduled
- [ ] Monitoring enabled
- [ ] Logs being collected
- [ ] Updates automated
- [ ] Access controls in place

## 📞 Support

### **1. Health Check Endpoints:**
- **Application**: `GET /health`
- **Metrics**: `GET /metrics`
- **Database**: `GET /stats`

### **2. Log Locations:**
- **Application**: `./logs/`
- **PM2**: `pm2 logs`
- **Docker**: `docker-compose logs`
- **System**: `/var/log/`

### **3. Configuration Files:**
- **Environment**: `.env`
- **PM2**: `ecosystem.config.js`
- **Docker**: `docker-compose.yml`
- **Nginx**: `nginx/nginx.conf`

---

**🎮 Chúc bạn triển khai thành công game Tu Tiên Multiplayer lên production!**
