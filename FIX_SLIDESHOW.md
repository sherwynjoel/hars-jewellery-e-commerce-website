# Fix Slideshow Images Not Showing

## Quick Fix Commands

Run these commands on your server terminal:

### Step 1: Check if images exist in database

```bash
cd /var/www/hars-jewellery
sudo -u postgres psql -d hars_jewellery -c "SELECT id, url, \"isActive\", position FROM \"SlideshowImage\" ORDER BY position;"
```

### Step 2: Check if images are marked as active

If images exist but `isActive` is `false`, activate them:

```bash
sudo -u postgres psql -d hars_jewellery -c "UPDATE \"SlideshowImage\" SET \"isActive\" = true WHERE \"isActive\" = false;"
```

### Step 3: Restart your application

```bash
cd /var/www/hars-jewellery
pm2 restart hars-jewellery
pm2 logs hars-jewellery --lines 50
```

### Step 4: Test the API endpoint

```bash
curl https://harsjewellery.in/api/slideshow
```

This should return JSON with your slideshow images.

### Step 5: Check if uploads directory exists and has files

```bash
ls -la /var/www/hars-jewellery/public/uploads/
```

### Step 6: Verify Nginx is serving uploads

```bash
# Test if an uploaded image is accessible
# Replace [image-name] with an actual image filename from the uploads directory
curl -I https://harsjewellery.in/uploads/[image-name]
```

---

## Common Issues and Solutions

### Issue 1: Images exist but not showing

**Solution:** Make sure `isActive` is `true`:

```bash
sudo -u postgres psql -d hars_jewellery -c "SELECT id, url, \"isActive\" FROM \"SlideshowImage\";"
```

If any have `isActive = false`, update them:

```bash
sudo -u postgres psql -d hars_jewellery -c "UPDATE \"SlideshowImage\" SET \"isActive\" = true;"
```

### Issue 2: Database table doesn't exist

**Solution:** Run Prisma migrations:

```bash
cd /var/www/hars-jewellery
npx prisma db push
pm2 restart hars-jewellery
```

### Issue 3: Images uploaded but URLs are wrong

**Solution:** Check the URL format in database:

```bash
sudo -u postgres psql -d hars_jewellery -c "SELECT url FROM \"SlideshowImage\" LIMIT 5;"
```

URLs should start with `/uploads/` like: `/uploads/1234567890-image.jpg`

### Issue 4: Nginx not serving static files

**Solution:** Make sure Nginx config includes the uploads location (from previous fix):

```bash
cat /etc/nginx/sites-available/hars-jewellery | grep -A 5 "location /uploads"
```

If it's missing, add it (see previous image fix instructions).

---

## Complete Diagnostic Script

Run this to check everything:

```bash
#!/bin/bash
echo "=== SLIDESHOW DIAGNOSTIC ==="
echo ""

echo "1. Checking database for slideshow images..."
sudo -u postgres psql -d hars_jewellery -c "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE \"isActive\" = true) as active FROM \"SlideshowImage\";"

echo ""
echo "2. Sample slideshow images:"
sudo -u postgres psql -d hars_jewellery -c "SELECT id, url, \"isActive\", position FROM \"SlideshowImage\" ORDER BY position LIMIT 5;"

echo ""
echo "3. Testing API endpoint..."
curl -s https://harsjewellery.in/api/slideshow | jq '.[0:2]' || echo "API test failed"

echo ""
echo "4. Checking uploads directory..."
ls -la /var/www/hars-jewellery/public/uploads/ | head -5

echo ""
echo "5. Checking PM2 status..."
pm2 status

echo ""
echo "=== DIAGNOSTIC COMPLETE ==="
```

---

## Manual Fix: Activate All Slideshow Images

If you have images but they're not showing, activate them all:

```bash
sudo -u postgres psql -d hars_jewellery << EOF
UPDATE "SlideshowImage" SET "isActive" = true;
SELECT id, url, "isActive" FROM "SlideshowImage";
EOF
```

Then restart:

```bash
pm2 restart hars-jewellery
```

---

## Verify Fix

1. Visit: `https://harsjewellery.in`
2. The slideshow should display your images
3. If still not showing, check browser console (F12) for errors

