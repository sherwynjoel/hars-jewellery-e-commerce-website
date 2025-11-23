# ⚡ Quick Start Deployment Guide

This is a condensed version of the full deployment guide. Use this for a quick reference.

## 🎯 Essential Steps (30 minutes)

### 1. Connect to VPS
```bash
ssh username@your-vps-ip
```

### 2. Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git nginx postgresql postgresql-contrib
sudo npm install -g pm2
```

### 3. Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE hars_jewellery;
CREATE USER hars_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hars_jewellery TO hars_user;
\q
```

### 4. Clone & Setup Project
```bash
sudo mkdir -p /var/www/hars-jewellery
sudo chown -R $USER:$USER /var/www/hars-jewellery
cd /var/www/hars-jewellery
git clone https://github.com/your-repo/hars-jewellery.git .
npm ci
```

### 5. Configure Environment
```bash
nano .env
# Add all required variables (see DEPLOYMENT_GUIDE.md)
```

### 6. Update Prisma Schema
```bash
# Edit prisma/schema.prisma - change to postgresql
nano prisma/schema.prisma
# Change: provider = "postgresql"
```

### 7. Build & Start
```bash
npx prisma generate
npx prisma db push
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/hars-jewellery
# Copy content from nginx-production.conf
# Replace 'your-domain.com' with your actual domain
sudo ln -s /etc/nginx/sites-available/hars-jewellery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Setup SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 10. Test
Visit: `https://your-domain.com`

---

## 🔄 Update Deployment

```bash
cd /var/www/hars-jewellery
bash deploy.sh
```

---

## 🆘 Common Commands

```bash
# Check status
pm2 status
pm2 logs hars-jewellery

# Restart
pm2 restart hars-jewellery

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx

# Database
sudo -u postgres psql -d hars_jewellery
```

---

For detailed instructions, see **DEPLOYMENT_GUIDE.md**

