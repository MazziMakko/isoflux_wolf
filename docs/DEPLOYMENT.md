# IsoFlux Deployment Guide

## 🚀 Primary: Vercel (recommended)

**For isoflux.app with optimized build, security headers, and zero-downtime deploys**, use:

- **[docs/DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)** — env vars, domain, Stripe webhooks, post-deploy checks.

Connect repo to Vercel, set env from `.env.production.example`, add domain www.isoflux.app. Push to deploy.

---

## Alternative: Digital Ocean (self-hosted)

This section covers deploying to a Digital Ocean droplet and connecting your Namecheap domain.

**Domain**: www.isoflux.app  
**Server IP**: 198.211.109.46  
**Registrar**: Namecheap  
**Hosting**: Digital Ocean

---

## ✅ Deployment Checklist (isoflux.app)

Use this list to keep production and frontend at **https://www.isoflux.app** in sync.

| Step | Action | Notes |
|------|--------|--------|
| 1 | **DNS (Namecheap)** | Log in at namecheap.com → Domain List → isoflux.app → Manage → Advanced DNS. Add A records: `@` → 198.211.109.46, `www` → 198.211.109.46. Optional: CNAME `api` → www.isoflux.app. |
| 2 | **Server env** | On 198.211.109.46, ensure `/var/www/isoflux/.env.production` exists. Copy from repo `.env.production.example`, set `NEXT_PUBLIC_APP_URL=https://www.isoflux.app` and all Supabase/Stripe/JWT secrets. Never commit `.env.production`. |
| 3 | **PM2** | Use repo `ecosystem.config.js`. Run `pm2 start ecosystem.config.js` (or `pm2 restart isoflux`) after deploy. App runs on port 3000. |
| 4 | **Nginx** | Point server_name to `www.isoflux.app` and `isoflux.app`; proxy_pass to `http://localhost:3000`. SSL via Let's Encrypt (see below). |
| 5 | **Deploy** | From local: `./deploy.sh local` then `./deploy.sh remote`. Or on server: `git pull`, `npm install --legacy-peer-deps`, `npm run build`, `pm2 restart isoflux`. |
| 6 | **Verify** | Open https://www.isoflux.app and https://isoflux.app (should redirect to www). Test login, signup, dashboard, and API keys. |

**Production URL:** Set `NEXT_PUBLIC_APP_URL=https://www.isoflux.app` in `.env.production` on the server. Retention emails and server-generated links use this; legal/SEO pages use the same domain. Auth (login/signup) uses relative `/api/auth/...`, so it follows the current host (isoflux.app when deployed).

---

## 📋 Prerequisites

- Digital Ocean account with access to 198.211.109.46
- Namecheap domain: isoflux.app
- SSH access to the server
- Node.js 20+ installed on server
- Redis installed on server
- SSL certificates (Let's Encrypt or custom)

---

## 🌐 DNS Configuration (Namecheap)

### Step 1: Configure DNS Records

Log into Namecheap and configure the following DNS records:

```
Type    Host    Value               TTL
-------------------------------------------
A       @       198.211.109.46      Automatic
A       www     198.211.109.46      Automatic
CNAME   api     www.isoflux.app     Automatic
```

### Step 2: Verify DNS Propagation

```bash
# Check A record
dig isoflux.app

# Check WWW record
dig www.isoflux.app

# Check propagation globally
https://www.whatsmydns.net/#A/isoflux.app
```

DNS propagation can take 24-48 hours, but usually completes in 1-4 hours.

---

## 🖥️ Server Setup (Digital Ocean)

### Step 1: Connect to Server

```bash
ssh root@198.211.109.46
```

### Step 2: Install Prerequisites

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Redis
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Install certbot (for SSL)
apt install -y certbot python3-certbot-nginx
```

### Step 3: Create Application Directory

```bash
# Create app directory
mkdir -p /var/www/isoflux
cd /var/www/isoflux

# Set ownership
chown -R www-data:www-data /var/www/isoflux
```

---

## 📦 Deploy Application

### Option 1: Git Deployment (Recommended)

```bash
# Clone repository
cd /var/www/isoflux
git clone https://github.com/your-org/isoflux.git .

# Install dependencies
npm install --legacy-peer-deps --production

# Build application
npm run build

# Create environment file
nano .env.production
```

### Option 2: Manual Upload

```bash
# From your local machine
scp -r c:/Dev/IsoFlux/* root@198.211.109.46:/var/www/isoflux/

# On server
cd /var/www/isoflux
npm install --legacy-peer-deps --production
npm run build
```

---

## 🔧 Environment Configuration

Create `/var/www/isoflux/.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://www.isoflux.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# HSM (Production)
HSM_PROVIDER=AWS_CLOUDHSM
HSM_ENDPOINT=https://your-hsm-endpoint
HSM_KEY_ID=your-key-id
HSM_REGION=us-east-1

# mTLS
MTLS_SERVER_CERT=/etc/ssl/certs/isoflux-server.crt
MTLS_SERVER_KEY=/etc/ssl/private/isoflux-server.key
MTLS_CA_CERT=/etc/ssl/certs/isoflux-ca.crt

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

# Security
SESSION_SECRET=generate_a_long_random_string_here
JWT_SECRET=generate_another_long_random_string
```

**Generate secrets**:
```bash
# Generate random secrets
openssl rand -base64 32
```

---

## 🔐 SSL Certificate Setup

### Step 1: Obtain Let's Encrypt Certificate

```bash
# Stop Nginx temporarily
systemctl stop nginx

# Obtain certificate
certbot certonly --standalone -d isoflux.app -d www.isoflux.app

# Certificates will be saved to:
# /etc/letsencrypt/live/isoflux.app/fullchain.pem
# /etc/letsencrypt/live/isoflux.app/privkey.pem

# Start Nginx
systemctl start nginx
```

### Step 2: Auto-Renewal

```bash
# Add to crontab
crontab -e

# Add this line
0 0 * * * certbot renew --quiet && systemctl reload nginx
```

---

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/isoflux`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=isoflux_api:10m rate=100r/m;

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name isoflux.app www.isoflux.app;
    
    return 301 https://www.isoflux.app$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.isoflux.app;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/isoflux.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/isoflux.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/isoflux-access.log;
    error_log /var/log/nginx/isoflux-error.log;

    # Client body size (for file uploads)
    client_max_body_size 50M;

    # API rate limiting
    location /api/ {
        limit_req zone=isoflux_api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}

# Apex domain redirect
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name isoflux.app;

    ssl_certificate /etc/letsencrypt/live/isoflux.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/isoflux.app/privkey.pem;

    return 301 https://www.isoflux.app$request_uri;
}
```

### Enable Configuration

```bash
# Create symlink
ln -s /etc/nginx/sites-available/isoflux /etc/nginx/sites-enabled/

# Remove default configuration
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 🚀 Start Application with PM2

### Step 1: Create PM2 Ecosystem File

Create `/var/www/isoflux/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'isoflux',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/isoflux',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      error_file: '/var/log/pm2/isoflux-error.log',
      out_file: '/var/log/pm2/isoflux-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
```

### Step 2: Start with PM2

```bash
# Create log directory
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/log/pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Run the command it outputs

# Check status
pm2 status
pm2 logs isoflux
```

---

## 🔥 Firewall Configuration

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## 📊 Monitoring Setup

### Step 1: PM2 Monitoring

```bash
# View logs
pm2 logs isoflux

# Monitor resources
pm2 monit

# View detailed info
pm2 info isoflux
```

### Step 2: System Monitoring

```bash
# Install htop
apt install -y htop

# Monitor system
htop

# Check disk space
df -h

# Check memory
free -h
```

### Step 3: Application Monitoring

Install monitoring tools:

```bash
# PM2 Plus (optional)
pm2 link <secret_key> <public_key>

# Or use custom monitoring
# - Datadog
# - New Relic
# - Sentry for error tracking
```

---

## 🔄 Deployment Updates

### Automated Deployment Script

Create `/var/www/isoflux/deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying IsoFlux..."

# Navigate to app directory
cd /var/www/isoflux

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "♻️ Restarting application..."
pm2 restart isoflux

# Show status
pm2 status

echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x /var/www/isoflux/deploy.sh
```

Deploy updates:
```bash
./deploy.sh
```

---

## 🔒 Security Hardening

### Step 1: Disable Root Login

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Set these values
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
systemctl restart sshd
```

### Step 2: Install Fail2Ban

```bash
# Install
apt install -y fail2ban

# Configure
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local

# Start
systemctl enable fail2ban
systemctl start fail2ban
```

### Step 3: Security Updates

```bash
# Enable automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## 🧪 Testing Deployment

### Step 1: Test Health Endpoint

```bash
curl https://www.isoflux.app/api/health
```

### Step 2: Test API Endpoints

```bash
# Get status
curl https://www.isoflux.app/api/isoflux/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Process transaction
curl -X POST https://www.isoflux.app/api/isoflux/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"...","messageType":"pacs.008"}'
```

### Step 3: Load Testing

```bash
# Install Apache Bench
apt install -y apache2-utils

# Test with 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://www.isoflux.app/
```

---

## 📈 Performance Optimization

### Step 1: Enable HTTP/2

Already enabled in Nginx configuration above.

### Step 2: Enable Brotli Compression (Optional)

```bash
# Install Brotli module
apt install -y libnginx-mod-http-brotli

# Add to Nginx config
nano /etc/nginx/nginx.conf

# Add in http block
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Step 3: Database Connection Pooling

Already configured in application via Supabase.

---

## 🔄 Backup Strategy

### Step 1: Database Backups

Supabase handles automated backups. Verify in Supabase dashboard.

### Step 2: Application Backups

```bash
# Create backup script
nano /root/backup-isoflux.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/isoflux-$DATE.tar.gz /var/www/isoflux

# Keep only last 7 days
find $BACKUP_DIR -name "isoflux-*.tar.gz" -mtime +7 -delete

echo "Backup completed: isoflux-$DATE.tar.gz"
```

```bash
chmod +x /root/backup-isoflux.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /root/backup-isoflux.sh
```

---

## 🚨 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs isoflux --lines 100

# Check system logs
journalctl -u pm2-root -n 100 --no-pager

# Check if port is in use
netstat -tulpn | grep 3000

# Restart everything
pm2 restart all
systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew manually
certbot renew --force-renewal

# Check certificate
openssl s_client -connect www.isoflux.app:443 -servername www.isoflux.app
```

### Performance Issues

```bash
# Check resource usage
htop

# Check PM2 monitoring
pm2 monit

# Increase PM2 instances
pm2 scale isoflux 4

# Check Nginx logs
tail -f /var/log/nginx/isoflux-error.log
```

---

## 🔐 Optional: Google Login

Current auth is email/password + JWT (login/signup API routes). To add **Google sign-in**:

1. **Supabase (recommended)**  
   - Supabase Dashboard → Authentication → Providers → Google: enable, add OAuth Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client, Web application, authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`).  
   - In the app: use Supabase client `signInWithOAuth({ provider: 'google' })`. After sign-in, create or link a row in `public.users` (and org/member) using the Supabase user id/email so dashboard and API keys work the same as email login.

2. **Alternative: NextAuth or custom OAuth**  
   - NextAuth.js with Google provider, then issue your own JWT and sync user to `public.users`/organizations so existing dashboard and middleware (cookie/localStorage) still work.

Ensure production redirect URIs use `https://www.isoflux.app` (and add `https://www.isoflux.app/api/auth/callback/google` or Supabase callback as needed). No credentials are stored in the repo; configure in Supabase Dashboard and server `.env.production`.

---

## 📞 Support

If you encounter issues:

1. Check logs: `pm2 logs isoflux`
2. Check Nginx logs: `/var/log/nginx/isoflux-error.log`
3. Check system resources: `htop`
4. Contact: support@isoflux.app

---

## ✅ Deployment Checklist (summary)

- [ ] DNS (Namecheap): A @ and www → 198.211.109.46
- [ ] Server: `.env.production` with `NEXT_PUBLIC_APP_URL=https://www.isoflux.app` and secrets
- [ ] PM2: `ecosystem.config.js` from repo; `pm2 start` or `pm2 restart isoflux`
- [ ] Nginx: server_name www.isoflux.app + isoflux.app → proxy to localhost:3000; SSL
- [ ] Deploy: `./deploy.sh remote` or git pull + build + pm2 restart
- [ ] Verify: https://www.isoflux.app (login, signup, dashboard, API keys)

See **Deployment Checklist (isoflux.app)** at the top for the full table.

---

**Deployment Status**: 🟢 Ready for Production  
**Domain**: https://www.isoflux.app  
**Server**: 198.211.109.46  
**Last Updated**: January 26, 2026
