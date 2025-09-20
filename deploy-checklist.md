# 🚀 Deploy Checklist - Tu Tiên Game

## ✅ Pre-Deploy Checklist

### 1. **Server Configuration**
- [x] MongoDB connection configured
- [x] Authentication system implemented
- [x] Security middleware (Helmet, CORS, Rate Limiting)
- [x] Production server (server-production.js)
- [x] Environment variables configured
- [x] Logging system (Winston)
- [x] Monitoring system (Prometheus metrics)

### 2. **Database Setup**
- [x] MongoDB models (Player, Guild, Quest)
- [x] Database connection manager
- [x] Player service layer
- [x] Auto-save mechanism
- [x] Backup scripts

### 3. **Authentication & Security**
- [x] JWT token authentication
- [x] Password hashing (bcrypt)
- [x] Rate limiting
- [x] Input validation
- [x] Account locking
- [x] CORS protection

### 4. **Game Features**
- [x] Multiplayer system (Socket.IO)
- [x] Character system
- [x] Inventory system
- [x] Equipment system
- [x] Arena ranking
- [x] Quest system
- [x] Guild system
- [x] Companion system (Pets & Wives)
- [x] Premium currency (Kim Nguyên Bảo)
- [x] Leaderboard system

### 5. **UI/UX**
- [x] Responsive design
- [x] Modern UI with CSS
- [x] Authentication UI
- [x] Game interface
- [x] Mobile-friendly

### 6. **Production Tools**
- [x] PM2 configuration
- [x] Docker configuration
- [x] Nginx configuration
- [x] Backup scripts
- [x] Health check endpoints
- [x] Monitoring endpoints

## 🚀 Deploy Steps

### Step 1: Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp env.production.example .env.production
# Edit .env.production with your values

# 3. Set up MongoDB
# Install MongoDB or use MongoDB Atlas
```

### Step 2: Local Testing
```bash
# 1. Test authentication server
node test-auth-server.js

# 2. Test game server
node server-mongodb.js

# 3. Test production server
node server-production.js
```

### Step 3: Production Deploy

#### Option A: PM2 (Recommended)
```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Start with PM2
pm2 start ecosystem.config.js --env production

# 3. Save PM2 configuration
pm2 save

# 4. Setup PM2 startup
pm2 startup
```

#### Option B: Docker
```bash
# 1. Build Docker image
docker build -t tu-tien-game .

# 2. Run with Docker Compose
docker-compose up -d

# 3. Check logs
docker-compose logs -f
```

#### Option C: Manual
```bash
# 1. Start production server
NODE_ENV=production node server-production.js

# 2. Or use npm script
npm run start:production
```

### Step 4: Nginx Setup (Optional)
```bash
# 1. Install Nginx
# 2. Copy nginx configuration
cp nginx/nginx.conf /etc/nginx/sites-available/tu-tien-game
ln -s /etc/nginx/sites-available/tu-tien-game /etc/nginx/sites-enabled/

# 3. Test and reload Nginx
nginx -t
systemctl reload nginx
```

## 🔧 Post-Deploy Verification

### 1. **Health Checks**
```bash
# Check server health
curl http://your-domain.com/health

# Check database stats
curl http://your-domain.com/stats

# Check metrics
curl http://your-domain.com/metrics
```

### 2. **Authentication Test**
```bash
# Test registration
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123","email":"test@example.com"}'

# Test login
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123"}'
```

### 3. **Game Test**
- Open game in browser
- Test registration/login
- Test multiplayer features
- Test all game systems

## 📊 Monitoring

### 1. **PM2 Monitoring**
```bash
# View PM2 status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### 2. **Docker Monitoring**
```bash
# View container status
docker ps

# View logs
docker-compose logs -f

# View resource usage
docker stats
```

### 3. **Application Monitoring**
- Health endpoint: `/health`
- Stats endpoint: `/stats`
- Metrics endpoint: `/metrics`

## 🔒 Security Checklist

- [x] HTTPS enabled (if using Nginx)
- [x] Environment variables secured
- [x] Database credentials secured
- [x] JWT secret secured
- [x] Rate limiting enabled
- [x] CORS configured
- [x] Helmet security headers
- [x] Input validation
- [x] Password hashing
- [x] Account locking

## 📝 Maintenance

### Daily
- Check server health
- Monitor logs for errors
- Check player activity

### Weekly
- Backup database
- Update dependencies
- Review security logs

### Monthly
- Security audit
- Performance review
- Feature updates

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**
   - Check MongoDB service
   - Verify connection string
   - Check firewall settings

2. **Authentication Not Working**
   - Check JWT secret
   - Verify bcrypt installation
   - Check API endpoints

3. **Socket.IO Connection Failed**
   - Check CORS settings
   - Verify port configuration
   - Check firewall

4. **High Memory Usage**
   - Check for memory leaks
   - Restart PM2 processes
   - Monitor with PM2 monit

### Logs Location
- PM2 logs: `~/.pm2/logs/`
- Docker logs: `docker-compose logs`
- Application logs: `logs/` directory

## 📞 Support

- Game Documentation: `PRODUCTION_DEPLOYMENT.md`
- Database Setup: `DATABASE_SETUP.md`
- API Documentation: Check routes files
- Issues: Check logs and health endpoints
