# VPS Pull and Run Commands

## Quick Commands (Copy and paste these on your VPS)

```bash
# Navigate to project directory
cd /var/www/hars-jewellery

# Pull latest changes from GitHub
git pull origin main

# Install/update dependencies (if package.json changed)
npm ci

# Generate Prisma client
npx prisma generate

# Update database schema (if schema changed)
npx prisma db push

# Build the application
npm run build

# Restart the application with PM2
pm2 restart hars-jewellery

# Check application status
pm2 status
```

## Alternative: Use the Deploy Script

If you have the deploy.sh script, you can simply run:

```bash
cd /var/www/hars-jewellery
bash deploy.sh
```

## One-Line Command (All in one)

```bash
cd /var/www/hars-jewellery && git pull origin main && npm ci && npx prisma generate && npx prisma db push && npm run build && pm2 restart hars-jewellery && pm2 status
```

## Step-by-Step Explanation

1. **`cd /var/www/hars-jewellery`** - Navigate to your project directory
2. **`git pull origin main`** - Pull latest changes from GitHub
3. **`npm ci`** - Install dependencies (clean install, faster than npm install)
4. **`npx prisma generate`** - Generate Prisma client (required after schema changes)
5. **`npx prisma db push`** - Update database schema if needed
6. **`npm run build`** - Build the Next.js application
7. **`pm2 restart hars-jewellery`** - Restart the PM2 process
8. **`pm2 status`** - Verify the application is running

## Troubleshooting

If PM2 process doesn't exist:
```bash
pm2 start ecosystem.config.js
```

If you need to check logs:
```bash
pm2 logs hars-jewellery
```

If build fails, check for errors:
```bash
npm run build
```

## Notes

- Make sure you're logged in as the correct user (usually the one who owns `/var/www/hars-jewellery`)
- If you get permission errors, you might need `sudo` (but be careful with permissions)
- The application will be available on port 3000 (or whatever port is configured in your PM2 config)

