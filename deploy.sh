#!/bin/bash

# Deployment script for Hostinger
echo "🚀 Starting deployment process..."

# Navigate to project directory
# Update this path to match your VPS setup
cd /var/www/hars-jewellery

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
