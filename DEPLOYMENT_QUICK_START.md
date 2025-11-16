# 🚀 Quick Deployment Guide - Hars Jewellery

## Fastest Way to Deploy (Vercel - Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/YOUR_USERNAME/hars-jewellery.git
git push -u origin main
```

### Step 2: Update Database Schema

**IMPORTANT:** Change from SQLite to PostgreSQL before deploying!

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change this from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3: Get Free PostgreSQL Database

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create new project
4. Go to Settings → Database
5. Copy "Connection string" (URI format)
6. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up (free)
3. New Project → Add PostgreSQL
4. Copy DATABASE_URL

### Step 4: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://... (from Supabase/Railway)
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=run: openssl rand -base64 32
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   EMAIL_FROM=Hars Jewellery <your-email@gmail.com>
   NODE_ENV=production
   ```

7. **Click "Deploy"**

### Step 5: Run Database Migrations

After deployment:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link project:**
   ```bash
   vercel link
   ```

4. **Pull environment:**
   ```bash
   vercel env pull .env.production
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   # Or
   npx prisma db push
   ```

### Step 6: Setup Admin User

```bash
npm run setup:admin
```

---

## 🎉 Done!

Your site is now live at: `https://your-app-name.vercel.app`

---

## 📝 Important Notes

1. **Database:** Must use PostgreSQL in production (not SQLite)
2. **Email:** Use Gmail App Password (not regular password)
3. **Razorpay:** Use production keys (not test keys)
4. **NEXTAUTH_URL:** Must match your actual domain
5. **SSL:** Vercel provides automatic SSL

---

## 🔧 If Something Goes Wrong

1. **Check Vercel Logs:**
   - Project → Deployments → Click deployment → View Function Logs

2. **Test Database Connection:**
   ```bash
   npx prisma db pull
   ```

3. **Verify Environment Variables:**
   - Project → Settings → Environment Variables
   - Make sure all are set

4. **Rebuild:**
   - Project → Deployments → Click "Redeploy"

---

## 🌐 Custom Domain (Optional)

1. **In Vercel:**
   - Project → Settings → Domains
   - Add your domain
   - Follow DNS setup instructions

2. **Update NEXTAUTH_URL:**
   - Change to your custom domain
   - Redeploy

---

**Need help? Check the full DEPLOYMENT_GUIDE.md for detailed instructions!**

