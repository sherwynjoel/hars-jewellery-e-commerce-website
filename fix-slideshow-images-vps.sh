#!/bin/bash
# Fix Slideshow Images on VPS
# This script updates existing slideshow image URLs to use the API route

cd /var/www/hars-jewellery

echo "=== Checking current slideshow image URLs ==="
sudo -u postgres psql -d hars_jewellery -c "SELECT id, url, \"isActive\" FROM \"SlideshowImage\" ORDER BY position;"

echo ""
echo "=== Updating slideshow image URLs to use API route ==="
sudo -u postgres psql -d hars_jewellery << 'EOF'
-- Update slideshow images from /uploads/ to /api/uploads/
UPDATE "SlideshowImage" 
SET url = '/api' || url 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Show updated URLs
SELECT id, url, "isActive", position FROM "SlideshowImage" ORDER BY position;
EOF

echo ""
echo "=== Rebuilding application ==="
rm -rf .next
npm run build

echo ""
echo "=== Restarting PM2 ==="
pm2 restart hars-jewellery --update-env

echo ""
echo "=== Testing slideshow API ==="
sleep 5
curl -s http://localhost:3000/api/slideshow | head -20

echo ""
echo "=== Fix complete! ==="
echo "Check your homepage now - slideshow images should appear."




