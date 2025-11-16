# 🚀 Hostinger Deployment Guide - Hars Jewellery

## 📦 Recommended Hostinger Plan

### **Best Option: VPS Hosting Plan**

**Recommended Plan: VPS 1 or VPS 2**
- **VPS 1** (Starting at ~$4.99/month)
  - 1 vCPU Core
  - 1 GB RAM
  - 20 GB SSD Storage
  - 1 TB Bandwidth
  - Full root access
  - ✅ **Good for: Small to medium traffic**

- **VPS 2** (Starting at ~$8.99/month) ⭐ **RECOMMENDED**
  - 2 vCPU Cores
  - 2 GB RAM
  - 40 GB SSD Storage
  - 2 TB Bandwidth
  - Full root access
  - ✅ **Best for: Production e-commerce site**

### **Alternative: Business Web Hosting** (If you don't need full control)
- **Business Plan** (~$3.99/month)
  - Limited Node.js support
  - May require custom configuration
  - Less control over server

### **Why VPS?**
- ✅ Full root access (required for Node.js/Next.js)
- ✅ Can install Node.js, PostgreSQL, PM2
- ✅ Better performance for e-commerce
- ✅ Can handle traffic spikes
- ✅ Full control over environment

---

## 📋 Pre-Deployment Checklist

- [ ] Hostinger VPS account created
- [ ] Domain name configured (optional)
- [ ] SSH access to server
- [ ] PostgreSQL database ready (or install on VPS)
- [ ] Environment variables prepared
- [ ] Razorpay production keys ready
- [ ] SMTP email credentials ready

---

## 🔧 Step-by-Step Deployment

### Step 1: Purchase and Setup VPS

1. **Go to Hostinger:**
   - Visit [hostinger.com](https://www.hostinger.com)
   - Sign up/Login
   - Go to "VPS Hosting"
   - Select **VPS 2** plan (recommended)
   - Complete purchase

2. **Access Your VPS:**
   - Go to Hostinger hPanel
   - Find your VPS in the dashboard
   - Note your server IP address
   - Access via SSH (instructions provided by Hostinger)

---

### Step 2: Connect to Your VPS via SSH

**Windows (PowerShell/Command Prompt):**
```bash
ssh root@YOUR_SERVER_IP
```

**Or use PuTTY (Windows):**
- Download PuTTY
- Enter your server IP
- Port: 22
- Username: root
- Password: (from Hostinger email)

**Mac/Linux:**
```bash
ssh root@YOUR_SERVER_IP
```

---

### Step 3: Update System and Install Dependencies

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 (Process Manager)
npm install -g pm2

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (Reverse Proxy)
apt install -y nginx

# Install Git
apt install -y git

# Install build tools (required for some npm packages)
apt install -y build-essential
```

---

### Step 4: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE hars_jewellery;
CREATE USER hars_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE hars_jewellery TO hars_user;
\q

# Test connection
sudo -u postgres psql -d hars_jewellery -U hars_user
```

**Note:** Replace `your_secure_password_here` with a strong password!

**Get Database Connection String:**
```
postgresql://hars_user:your_secure_password_here@localhost:5432/hars_jewellery
```

---

### Step 5: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/sherwynjoel/hars-jewellery-e-commerce-website.git hars-jewellery

# Navigate to project directory
cd hars-jewellery

# Install dependencies
npm install
```

---

### Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Add these environment variables:**

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://hars_user:your_secure_password_here@localhost:5432/hars_jewellery"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Razorpay (Production Keys)
RAZORPAY_KEY_ID="your_production_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_production_razorpay_key_secret"

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="harsjewellery2005@gmail.com"
SMTP_PASS="your_gmail_app_password"
EMAIL_FROM="Hars Jewellery <harsjewellery2005@gmail.com>"

# Production Environment
NODE_ENV="production"
PORT="3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 7: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional - creates admin user)
npm run db:seed

# Setup admin user
npm run setup:admin
```

---

### Step 8: Build the Application

```bash
# Build Next.js application
npm run build
```

**This will create the `.next` folder with optimized production build.**

---

### Step 9: Configure PM2 (Process Manager)

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add this content:**

```javascript
module.exports = {
  apps: [{
    name: 'hars-jewellery',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hars-jewellery',
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

**Start application with PM2:**
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown (copy and run the command it provides)
```

**PM2 Commands:**
```bash
pm2 status          # Check application status
pm2 logs            # View logs
pm2 restart hars-jewellery  # Restart application
pm2 stop hars-jewellery     # Stop application
```

---

### Step 10: Configure Nginx (Reverse Proxy)

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/hars-jewellery
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, proxy to Node.js (remove after SSL setup)
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

    # Increase file upload size (for product images)
    client_max_body_size 10M;
}
```

**Enable the site:**
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/hars-jewellery /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

### Step 11: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

**Auto-renewal (already configured by Certbot):**
```bash
# Test renewal
certbot renew --dry-run
```

---

### Step 12: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install -y ufw

# Allow SSH (important - do this first!)
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

### Step 13: Update Nginx Config for HTTPS

After SSL is installed, update Nginx config:

```bash
nano /etc/nginx/sites-available/hars-jewellery
```

**Updated configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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

    client_max_body_size 10M;
}
```

**Restart Nginx:**
```bash
nginx -t
systemctl restart nginx
```

---

### Step 14: Setup File Uploads Directory

```bash
# Create uploads directory
mkdir -p /var/www/hars-jewellery/public/uploads

# Set permissions
chmod -R 755 /var/www/hars-jewellery/public/uploads
chown -R www-data:www-data /var/www/hars-jewellery/public/uploads
```

---

### Step 15: Verify Deployment

1. **Check PM2 Status:**
   ```bash
   pm2 status
   pm2 logs hars-jewellery
   ```

2. **Check Nginx Status:**
   ```bash
   systemctl status nginx
   ```

3. **Check PostgreSQL:**
   ```bash
   sudo -u postgres psql -d hars_jewellery -c "SELECT COUNT(*) FROM \"User\";"
   ```

4. **Visit Your Site:**
   - Open browser: `https://your-domain.com`
   - Test admin login
   - Test product creation
   - Test checkout

---

## 🔄 Updating Your Application

When you make changes to your code:

```bash
# Navigate to project directory
cd /var/www/hars-jewellery

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Regenerate Prisma Client
npx prisma generate

# Push database changes (if schema changed)
npx prisma db push

# Rebuild application
npm run build

# Restart PM2
pm2 restart hars-jewellery
```

**Or use the deploy script:**
```bash
npm run deploy
```

---

## 🛠️ Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs hars-jewellery

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart PM2
pm2 restart hars-jewellery
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
sudo -u postgres psql -d hars_jewellery -U hars_user

# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql
```

### Nginx Not Working

```bash
# Check Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# View Nginx error logs
tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew

# Check renewal logs
tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View application info
pm2 show hars-jewellery

# View logs
pm2 logs hars-jewellery --lines 100
```

### Server Resources

```bash
# Check CPU and Memory
htop

# Check disk space
df -h

# Check system load
uptime
```

---

## 🔐 Security Best Practices

1. **Keep System Updated:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Use Strong Passwords:**
   - Database password
   - SSH password
   - Admin account password

3. **Configure Firewall:**
   - Only allow necessary ports (22, 80, 443)

4. **Regular Backups:**
   ```bash
   # Backup database
   pg_dump -U hars_user hars_jewellery > backup_$(date +%Y%m%d).sql
   
   # Backup application files
   tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/hars-jewellery
   ```

5. **Monitor Logs:**
   - Check PM2 logs regularly
   - Monitor Nginx access/error logs
   - Check system logs

---

## 💰 Cost Breakdown

**Monthly Costs:**
- VPS 2 Plan: ~$8.99/month
- Domain (if purchased): ~$10-15/year
- **Total: ~$9-10/month**

**Optional:**
- Email hosting: Included with some plans
- SSL Certificate: Free (Let's Encrypt)
- CDN: Optional (Cloudflare Free tier)

---

## ✅ Deployment Checklist

- [ ] VPS purchased and configured
- [ ] SSH access working
- [ ] Node.js 18.x installed
- [ ] PostgreSQL installed and database created
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Database schema pushed
- [ ] Application built
- [ ] PM2 configured and running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Domain DNS configured
- [ ] Site accessible via HTTPS
- [ ] Admin panel accessible
- [ ] Test checkout working
- [ ] Email sending working

---

## 🎉 You're Done!

Your Hars Jewellery e-commerce site is now live on Hostinger!

**Next Steps:**
1. Test all features
2. Setup regular backups
3. Monitor performance
4. Configure monitoring alerts (optional)

**Support:**
- Hostinger Support: Available 24/7 via chat
- Check logs if issues occur
- PM2 and Nginx logs are your friends!

---

**Need Help?** Check the main `DEPLOYMENT_GUIDE.md` for more detailed information.

