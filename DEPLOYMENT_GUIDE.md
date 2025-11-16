# 🚀 Hars Jewellery - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Before You Deploy

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database migrated to production database (PostgreSQL/MySQL)
- [ ] SMTP email configured
- [ ] Razorpay keys configured
- [ ] Domain name ready (optional)
- [ ] SSL certificate ready (for HTTPS)

---

## 🗄️ Database Migration (IMPORTANT!)

**Current Setup:** SQLite (development only)
**Production Required:** PostgreSQL or MySQL

### Option 1: PostgreSQL (Recommended)

1. **Get a PostgreSQL database:**
   - **Free Options:**
     - [Supabase](https://supabase.com) - Free tier available
     - [Railway](https://railway.app) - Free tier available
     - [Neon](https://neon.tech) - Free tier available
     - [Render](https://render.com) - Free tier available

2. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Get Database URL:**
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Example: `postgresql://user:pass@db.xyz.supabase.co:5432/postgres?sslmode=require`

### Option 2: MySQL

1. **Get a MySQL database:**
   - [PlanetScale](https://planetscale.com) - Free tier
   - [Railway](https://railway.app) - Free tier

2. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

---

## 🌐 Deployment Options

### Option 1: Vercel (Easiest - Recommended for Next.js)

**Pros:** 
- Free tier available
- Automatic SSL
- Built for Next.js
- Easy setup
- Automatic deployments from GitHub

**Steps:**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/hars-jewellery.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env` file

4. **Database Setup:**
   - Use Vercel Postgres (built-in) OR
   - Connect external PostgreSQL database

5. **After Deployment:**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   # Or
   npx prisma db push
   ```

**Note:** Vercel uses serverless functions. For database, use Vercel Postgres or external database.

---

### Option 2: Railway (Easy - Full Stack)

**Pros:**
- Free tier available
- PostgreSQL included
- Easy deployment
- Automatic SSL

**Steps:**

1. **Sign up:** [railway.app](https://railway.app)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL:**
   - Click "+ New"
   - Select "PostgreSQL"
   - Copy the DATABASE_URL

4. **Configure Environment Variables:**
   - Go to Variables tab
   - Add all required variables

5. **Deploy:**
   - Railway auto-deploys on git push
   - Or click "Deploy Now"

6. **Run Migrations:**
   - Go to project → Settings → Deployments
   - Click on deployment → Open shell
   - Run: `npx prisma migrate deploy`

---

### Option 3: Render (Free Tier Available)

**Pros:**
- Free tier available
- PostgreSQL included
- Automatic SSL
- Easy setup

**Steps:**

1. **Sign up:** [render.com](https://render.com)

2. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repository
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL Database:**
   - New → PostgreSQL
   - Copy DATABASE_URL

4. **Configure Environment Variables:**
   - Go to Environment tab
   - Add all variables

5. **Deploy:**
   - Render auto-deploys on git push

---

### Option 4: DigitalOcean App Platform

**Pros:**
- Reliable
- Good performance
- PostgreSQL available
- Automatic SSL

**Steps:**

1. **Sign up:** [digitalocean.com](https://digitalocean.com)

2. **Create App:**
   - Apps → Create App
   - Connect GitHub
   - Select repository

3. **Configure:**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Run Command: `npm start`
   - Add PostgreSQL database

4. **Environment Variables:**
   - Add all required variables

---

### Option 5: VPS (Virtual Private Server)

**For: Hostinger, AWS EC2, DigitalOcean Droplet, etc.**

**Steps:**

1. **Connect to Server:**
   ```bash
   ssh username@your-server-ip
   ```

2. **Install Node.js:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Install PostgreSQL:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo -u postgres createdb hars_jewellery
   ```

4. **Clone Repository:**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/hars-jewellery.git
   cd hars-jewellery
   ```

5. **Install Dependencies:**
   ```bash
   npm install
   ```

6. **Configure Environment:**
   ```bash
   cp env.example .env
   nano .env  # Edit with production values
   ```

7. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   # Or
   npx prisma db push
   ```

8. **Build:**
   ```bash
   npm run build
   ```

9. **Start with PM2:**
   ```bash
   pm2 start npm --name "hars-jewellery" -- start
   pm2 save
   pm2 startup  # Follow instructions
   ```

10. **Setup Nginx (Reverse Proxy):**
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. **Setup SSL (Let's Encrypt):**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 🔐 Required Environment Variables

Create a `.env` file in production with these variables:

```env
# Database (PostgreSQL for production)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Razorpay (Production Keys)
RAZORPAY_KEY_ID="your_production_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_production_razorpay_key_secret"

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Hars Jewellery <your-email@gmail.com>"

# Production Environment
NODE_ENV="production"
PORT="3000"

# Optional: Admin IP Whitelist
ADMIN_ALLOWED_IPS="your-ip-address"
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 📝 Step-by-Step Deployment (Vercel Example)

### 1. Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Update Prisma Schema for Production

**Before deploying, update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

### 4. Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Hars Jewellery <your-email@gmail.com>
NODE_ENV=production
```

### 5. Add PostgreSQL Database

**Option A: Vercel Postgres**
- Project → Storage → Create Database → Postgres
- Copy the connection string to DATABASE_URL

**Option B: External Database (Supabase)**
- Create database at [supabase.com](https://supabase.com)
- Copy connection string
- Add to DATABASE_URL

### 6. Run Database Migrations

After first deployment, run:
```bash
# In Vercel, go to project → Deployments → Click on deployment → View Function Logs
# Or use Vercel CLI:
vercel env pull
npx prisma migrate deploy
```

### 7. Setup Custom Domain (Optional)

- Project → Settings → Domains
- Add your domain
- Follow DNS instructions

---

## 🔧 Post-Deployment Steps

### 1. Verify Database Connection
- Check if tables are created
- Verify data can be read/written

### 2. Test Authentication
- Sign up a test user
- Verify email works
- Test login

### 3. Test Admin Panel
- Login as admin
- Request verification email
- Access admin panel

### 4. Test Payment
- Add items to cart
- Test checkout (use Razorpay test mode first)
- Verify order creation

### 5. Test Email Sending
- Request password reset
- Verify email delivery
- Test admin verification emails

### 6. Setup Admin User
```bash
# If needed, run on server or via Vercel CLI
npm run setup:admin
```

---

## 🛠️ Production Optimizations

### 1. Update Next.js Config (if needed)

Create/update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker/VPS
  images: {
    domains: ['your-domain.com'],
  },
}

module.exports = nextConfig
```

### 2. Enable Caching
- Vercel: Automatic
- Other platforms: Configure CDN

### 3. Monitor Performance
- Use Vercel Analytics (if on Vercel)
- Setup error tracking (Sentry, etc.)

---

## 🔍 Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall rules
- Test connection: `npx prisma db pull`

### Build Errors
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors: `npm run lint`

### Email Not Sending
- Verify SMTP credentials
- Check Gmail App Password (if using Gmail)
- Test SMTP connection
- Check spam folder

### Payment Issues
- Verify Razorpay keys are production keys
- Check Razorpay webhook configuration
- Test with Razorpay test mode first

---

## 📊 Recommended Deployment Platform

**For This Project, I Recommend:**

1. **Vercel** (Best for Next.js)
   - Easiest setup
   - Free tier
   - Automatic SSL
   - Built for Next.js

2. **Railway** (Best for Full Stack)
   - Includes PostgreSQL
   - Easy database setup
   - Free tier available

3. **Render** (Good Alternative)
   - Free tier
   - PostgreSQL included
   - Easy setup

---

## 🎯 Quick Start (Vercel - 5 Minutes)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. **Deploy on Vercel:**
   - Visit vercel.com
   - Import GitHub repo
   - Add environment variables
   - Deploy!

3. **Add Database:**
   - Vercel Postgres OR Supabase
   - Add DATABASE_URL to environment variables

4. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

5. **Done!** Your site is live 🎉

---

## 📞 Support

If you encounter issues during deployment:
1. Check the error logs
2. Verify all environment variables
3. Test database connection
4. Check email configuration
5. Verify Razorpay keys

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Database migrated to PostgreSQL/MySQL
- [ ] Prisma schema updated
- [ ] Environment variables configured
- [ ] SMTP email configured
- [ ] Razorpay keys configured (production)
- [ ] NEXTAUTH_SECRET generated
- [ ] NEXTAUTH_URL set to production domain
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Test signup/login
- [ ] Test email sending
- [ ] Test payment (test mode first)
- [ ] Test admin panel access
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Site tested on mobile
- [ ] Performance checked

---

**Your project is ready for deployment! 🚀**

Choose a platform above and follow the steps. Vercel is recommended for the easiest deployment experience.

