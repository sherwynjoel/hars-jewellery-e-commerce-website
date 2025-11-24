# Fix Slideshow Images on Homepage

## Problem
Slideshow images are visible in admin panel but not showing on the homepage.

## Solution
1. Update existing database URLs to use API route
2. Deploy updated components
3. Rebuild and restart

## Quick Fix Commands (Run on VPS)

```bash
cd /var/www/hars-jewellery

# Step 1: Update existing slideshow image URLs in database
sudo -u postgres psql -d hars_jewellery << 'EOF'
UPDATE "SlideshowImage" 
SET url = '/api' || url 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';
EOF

# Step 2: Make sure you have the updated components
# Copy these files to VPS if not already there:
# - components/HeroSlideshow.tsx (updated)
# - components/SlideshowManager.tsx (updated)
# - lib/image-utils.ts

# Step 3: Rebuild
rm -rf .next
npm run build

# Step 4: Restart
pm2 restart hars-jewellery --update-env

# Step 5: Test
sleep 5
curl http://localhost:3000/api/slideshow
```

## Verify the Fix

1. **Check database URLs:**
   ```bash
   sudo -u postgres psql -d hars_jewellery -c "SELECT url, \"isActive\" FROM \"SlideshowImage\" ORDER BY position;"
   ```
   All URLs should start with `/api/uploads/`

2. **Test API endpoint:**
   ```bash
   curl http://localhost:3000/api/slideshow
   ```
   Should return JSON with slideshow images

3. **Check homepage:**
   - Visit `https://harsjewellery.in`
   - Slideshow images should appear in the hero section

## If Images Still Don't Show

1. **Check browser console (F12)** for errors
2. **Verify images are active:**
   ```bash
   sudo -u postgres psql -d hars_jewellery -c "SELECT COUNT(*) FROM \"SlideshowImage\" WHERE \"isActive\" = true;"
   ```
3. **Check PM2 logs:**
   ```bash
   pm2 logs hars-jewellery --lines 50
   ```
4. **Test individual image:**
   ```bash
   # Get an image URL from database
   IMAGE_URL=$(sudo -u postgres psql -d hars_jewellery -t -c "SELECT url FROM \"SlideshowImage\" WHERE \"isActive\" = true LIMIT 1;")
   # Test it
   curl -I http://localhost:3000$IMAGE_URL
   ```

