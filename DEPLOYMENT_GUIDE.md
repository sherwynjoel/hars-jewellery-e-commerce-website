# 🚀 Complete Deployment Guide for Hostinger VPS

This guide will walk you through deploying your Hars Jewellery e-commerce application to Hostinger VPS step by step.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Hostinger VPS access (SSH credentials)
- ✅ Domain name pointed to your VPS IP
- ✅ Git repository (GitHub/GitLab/Bitbucket)
- ✅ Node.js 18+ installed on VPS
- ✅ Basic knowledge of Linux commands

---

## 🔧 Step 1: Initial VPS Setup

### 1.1 Connect to Your VPS via SSH

```bash
ssh username@your-vps-ip
# Example: ssh root@123.456.789.0
```

### 1.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Required Software

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL (for production database - recommended)
sudo apt install -y postgresql postgresql-contrib

# Or use SQLite (simpler but less scalable)
# SQLite comes pre-installed with most Linux systems
```

### 1.4 Verify Installations

```bash
node --version    # Should show v18.x or higher
npm --version
pm2 --version
nginx -v
psql --version
```

---

## 🗄️ Step 2: Database Setup

### Option A: PostgreSQL (Recommended for Production)

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE hars_jewellery;
CREATE USER hars_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hars_jewellery TO hars_user;
\q
```

### Option B: SQLite (Simpler, for smaller projects)

SQLite doesn't require setup - it will create the database file automatically.

---

## 📁 Step 3: Project Setup on VPS

### 3.1 Create Project Directory

```bash
# Create directory (adjust path as needed)
sudo mkdir -p /var/www/hars-jewellery
sudo chown -R $USER:$USER /var/www/hars-jewellery
cd /var/www/hars-jewellery
```

### 3.2 Clone Your Repository

```bash
# Clone your repository
git clone https://github.com/your-username/hars-jewellery.git .

# Or if using SSH
# git clone git@github.com:your-username/hars-jewellery.git .
```

### 3.3 Install Dependencies

```bash
npm ci
```

---

## ⚙️ Step 4: Environment Configuration

### 4.1 Create Production .env File

```bash
nano .env
```

### 4.2 Configure Environment Variables

Copy and customize these values:

```env
# Database Configuration
# For PostgreSQL:
DATABASE_URL="postgresql://hars_user:your_secure_password@localhost:5432/hars_jewellery?schema=public"
# For SQLite:
# DATABASE_URL="file:./prisma/prod.db"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-random-secret-key-here-minimum-32-characters"

# Razorpay Configuration (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Deployment Webhook
DEPLOY_WEBHOOK_URL="https://your-domain.com/api/webhook/deploy"
WEBHOOK_SECRET="your-secure-webhook-secret-key"

# Production Environment
NODE_ENV="production"
PORT="3000"

# SMTP Configuration (For email sending)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your.email@gmail.com"
SMTP_PASS="your_app_password"
EMAIL_FROM="Hars Jewellery <your.email@gmail.com>"
```

### 4.3 Generate NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
# Copy the output and use it as NEXTAUTH_SECRET
```

### 4.4 Save and Exit

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 🗄️ Step 5: Database Migration

### 5.1 Update Prisma Schema (if using PostgreSQL)

If you're using PostgreSQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5.2 Generate Prisma Client and Push Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database with initial data
npm run db:seed
```

---

## 🏗️ Step 6: Build the Application

```bash
# Build Next.js application
npm run build
```

---

## 🚀 Step 7: Start Application with PM2

### 7.1 Update PM2 Configuration

Edit `ecosystem.config.js` to match your project path:

```javascript
module.exports = {
  apps: [{
    name: 'hars-jewellery',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hars-jewellery',  // Update this path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 7.2 Create Logs Directory

```bash
mkdir -p logs
```

### 7.3 Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration to auto-start on reboot
pm2 save
pm2 startup
# Follow the instructions shown to enable auto-start
```

### 7.4 Verify Application is Running

```bash
# Check status
pm2 status

# View logs
pm2 logs hars-jewellery

# Monitor in real-time
pm2 monit
```

---

## 🌐 Step 8: Configure Nginx Reverse Proxy

### 8.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hars-jewellery
```

### 8.2 Add Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, proxy to Next.js (remove after SSL setup)
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Increase upload size limit
    client_max_body_size 10M;
}
```

### 8.3 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hars-jewellery /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 9: SSL Certificate Setup (Let's Encrypt)

### 9.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 9.3 Auto-Renewal Setup

Certbot automatically sets up auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## 🔄 Step 10: Update Deployment Script

### 10.1 Update deploy.sh

Edit `deploy.sh` to match your project path:

```bash
#!/bin/bash

# Deployment script for Hostinger
echo "🚀 Starting deployment process..."

# Navigate to project directory
cd /var/www/hars-jewellery  # Update this path

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Updating database schema..."
npx prisma db push

# Build the application
echo "🔨 Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart hars-jewellery || pm2 start ecosystem.config.js

# Check if application is running
echo "✅ Checking application status..."
pm2 status

echo "🎉 Deployment completed successfully!"
```

### 10.2 Make Script Executable

```bash
chmod +x deploy.sh
```

---

## 🧪 Step 11: Test Deployment

### 11.1 Test Application

1. Open your browser and visit: `https://your-domain.com`
2. Check if the homepage loads
3. Test admin login
4. Verify API endpoints

### 11.2 Check Logs

```bash
# PM2 logs
pm2 logs hars-jewellery

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 Step 12: Set Up Auto-Deployment (Optional)

### 12.1 GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger VPS

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.HOSTINGER_HOST }}
        username: ${{ secrets.HOSTINGER_USERNAME }}
        key: ${{ secrets.HOSTINGER_SSH_KEY }}
        port: ${{ secrets.HOSTINGER_PORT }}
        script: |
          cd /var/www/hars-jewellery
          bash deploy.sh
```

### 12.2 Add GitHub Secrets

In your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `HOSTINGER_HOST`: Your VPS IP address
   - `HOSTINGER_USERNAME`: Your SSH username
   - `HOSTINGER_SSH_KEY`: Your private SSH key
   - `HOSTINGER_PORT`: Usually `22`

### 12.3 Manual Deployment via Webhook

You can also trigger deployment manually via the admin panel or by calling:

```bash
curl -X POST https://your-domain.com/api/webhook/deploy \
  -H "x-webhook-secret: your-webhook-secret"
```

---

## 📝 Step 13: Post-Deployment Checklist

- [ ] Application is accessible at your domain
- [ ] SSL certificate is active (HTTPS working)
- [ ] Admin login works
- [ ] Database connection is working
- [ ] File uploads work (check uploads directory permissions)
- [ ] Email sending works (test registration/OTP)
- [ ] Payment gateway (Razorpay) is configured
- [ ] PM2 auto-restart is enabled
- [ ] Nginx is serving the application
- [ ] Logs are being written correctly

---

## 🔧 Common Issues and Solutions

### Issue 1: Application Not Starting

```bash
# Check PM2 logs
pm2 logs hars-jewellery --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart hars-jewellery
```

### Issue 2: Database Connection Error

```bash
# Test PostgreSQL connection
psql -U hars_user -d hars_jewellery

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Regenerate Prisma Client
npx prisma generate
```

### Issue 3: Permission Denied Errors

```bash
# Fix uploads directory permissions
sudo chown -R $USER:$USER /var/www/hars-jewellery
sudo chmod -R 755 /var/www/hars-jewellery/public/uploads
```

### Issue 4: Nginx 502 Bad Gateway

```bash
# Check if Next.js is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL in Nginx config
```

### Issue 5: SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 📊 Monitoring and Maintenance

### View Application Status

```bash
# PM2 status
pm2 status

# System resources
pm2 monit

# Application logs
pm2 logs hars-jewellery
```

### Update Application

```bash
cd /var/www/hars-jewellery
git pull origin main
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart hars-jewellery
```

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U hars_user hars_jewellery > backup_$(date +%Y%m%d).sql

# SQLite backup
cp prisma/prod.db prisma/backup_$(date +%Y%m%d).db
```

---

## 🎯 Quick Reference Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop hars-jewellery

# Restart application
pm2 restart hars-jewellery

# View logs
pm2 logs hars-jewellery

# Check status
pm2 status

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# Deploy manually
cd /var/www/hars-jewellery && bash deploy.sh
```

---

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs hars-jewellery`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `cat .env`
4. Test database connection
5. Verify all services are running: `pm2 status && sudo systemctl status nginx`

---

**🎉 Congratulations! Your application should now be live on Hostinger VPS!**

