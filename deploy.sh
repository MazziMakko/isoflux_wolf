#!/bin/bash

# =====================================================
# ISOFLUX DEPLOYMENT SCRIPT
# Deploy to isoflux.app (198.211.109.46)
# =====================================================

set -e

echo "🚀 IsoFlux Deployment Script"
echo "================================"
echo ""

# Configuration
SERVER_IP="198.211.109.46"
DOMAIN="www.isoflux.app"
APP_DIR="/var/www/isoflux"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on server or local
if [ "$1" == "local" ]; then
    echo "${YELLOW}📦 Building application locally...${NC}"
    
    # Build locally
    npm run build
    
    echo ""
    echo "${GREEN}✅ Build complete!${NC}"
    echo ""
    echo "To deploy to server, run:"
    echo "  ./deploy.sh remote"
    exit 0
fi

if [ "$1" == "remote" ]; then
    echo "${YELLOW}📤 Deploying to server...${NC}"
    
    # Upload files to server
    echo "Uploading files to $SERVER_IP..."
    rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        ./ root@$SERVER_IP:$APP_DIR/
    
    # Run deployment on server
    ssh root@$SERVER_IP << 'ENDSSH'
        cd /var/www/isoflux
        
        if [ ! -f .env.production ]; then
            echo "⚠️  .env.production not found. Copy .env.production.example and set NEXT_PUBLIC_APP_URL=https://www.isoflux.app and secrets."
            exit 1
        fi
        
        echo "📦 Installing dependencies..."
        npm install --legacy-peer-deps --production
        
        echo "🔨 Building application..."
        npm run build
        
        echo "♻️ Restarting PM2..."
        pm2 restart isoflux || pm2 start ecosystem.config.js
        
        echo "📊 Status:"
        pm2 status
ENDSSH
    
    echo ""
    echo "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "Your application is now live at:"
    echo "  ${GREEN}https://$DOMAIN${NC}"
    echo ""
    exit 0
fi

if [ "$1" == "server" ]; then
    echo "${YELLOW}⚙️ Setting up server (run this ON the server)...${NC}"
    
    # Install prerequisites
    echo "📦 Installing prerequisites..."
    apt update && apt upgrade -y
    
    # Install Node.js
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        apt install -y nginx
    fi
    
    # Install Redis
    if ! command -v redis-server &> /dev/null; then
        echo "Installing Redis..."
        apt install -y redis-server
        systemctl enable redis-server
        systemctl start redis-server
    fi
    
    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        apt install -y certbot python3-certbot-nginx
    fi
    
    # Create app directory
    mkdir -p $APP_DIR
    chown -R www-data:www-data $APP_DIR
    
    echo ""
    echo "${GREEN}✅ Server setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Upload your code: ./deploy.sh remote"
    echo "  2. Configure Nginx (see docs/DEPLOYMENT.md)"
    echo "  3. Obtain SSL certificate: certbot certonly --standalone -d $DOMAIN"
    echo ""
    exit 0
fi

# Default: show usage
echo "Usage:"
echo "  ./deploy.sh local   - Build locally"
echo "  ./deploy.sh remote  - Deploy to server"
echo "  ./deploy.sh server  - Setup server (run ON the server)"
echo ""
echo "Current status:"
echo "  Domain: $DOMAIN"
echo "  Server: $SERVER_IP"
echo ""
