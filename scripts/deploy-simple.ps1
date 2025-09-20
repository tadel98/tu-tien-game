# Tu Tiên Game - Simple Deploy Script
param([string]$Environment = "development")

Write-Host "🚀 Starting deployment for environment: $Environment" -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Create logs directory
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

# Step 3: Start server based on environment
Write-Host "🎮 Starting server..." -ForegroundColor Yellow

switch ($Environment) {
    "production" {
        Write-Host "Starting production server..." -ForegroundColor Cyan
        Start-Process -FilePath "node" -ArgumentList "server-production.js" -WindowStyle Hidden
    }
    "development" {
        Write-Host "Starting development server..." -ForegroundColor Cyan
        Start-Process -FilePath "node" -ArgumentList "server-mongodb.js" -WindowStyle Hidden
    }
    "test" {
        Write-Host "Starting test server..." -ForegroundColor Cyan
        Start-Process -FilePath "node" -ArgumentList "test-auth-server.js" -WindowStyle Hidden
    }
}

# Step 4: Wait and test
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep 5

# Step 5: Test health
Write-Host "🔍 Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Server health check failed, but server might still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Game URL: http://localhost:3000/game-multiplayer.html" -ForegroundColor Cyan
Write-Host "🔐 Auth URL: http://localhost:3000/auth.html" -ForegroundColor Cyan
Write-Host "📊 Health URL: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
