#!/bin/bash
# VPS Initial Setup Commands for Hostinger
# Run these commands one by one or as a script

echo "🚀 Starting VPS Setup for Hars Jewellery Deployment..."

# Step 1: Update system packages
echo "📦 Step 1: Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Node.js 18.x
echo "📦 Step 2: Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Step 3: Install Git
echo "📦 Step 3: Installing Git..."
apt install -y git

# Step 4: Install PM2 globally
echo "📦 Step 4: Installing PM2..."
npm install -g pm2

# Step 5: Install Nginx
echo "📦 Step 5: Installing Nginx..."
apt install -y nginx

# Step 6: Install PostgreSQL
echo "📦 Step 6: Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Step 7: Install Certbot for SSL
echo "📦 Step 7: Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Step 8: Verify installations
echo "✅ Verifying installations..."
echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo "PM2 version:"
pm2 --version
echo "Nginx version:"
nginx -v
echo "PostgreSQL version:"
psql --version

echo "🎉 Initial setup complete!"
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Clone your repository"
echo "3. Configure environment variables"
echo "4. Build and deploy"

