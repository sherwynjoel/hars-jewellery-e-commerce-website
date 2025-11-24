#!/bin/bash
# Fix All Image URLs on VPS
# This script updates all image URLs in the database to use the API route

cd /var/www/hars-jewellery

echo "=== Fixing all image URLs in database ==="

sudo -u postgres psql -d hars_jewellery << 'EOF'
-- Update SlideshowImage URLs
UPDATE "SlideshowImage" 
SET url = '/api' || url 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Update EditorialFeature imageUrl
UPDATE "EditorialFeature" 
SET "imageUrl" = '/api' || "imageUrl" 
WHERE "imageUrl" LIKE '/uploads/%' AND "imageUrl" NOT LIKE '/api/uploads/%';

-- Update Testimonial imageUrl
UPDATE "Testimonial" 
SET "imageUrl" = '/api' || "imageUrl" 
WHERE "imageUrl" LIKE '/uploads/%' AND "imageUrl" NOT LIKE '/api/uploads/%';

-- Update VideoCarouselItem URLs
UPDATE "VideoCarouselItem" 
SET url = '/api' || url 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Update Product images
UPDATE "Product" 
SET image = '/api' || image 
WHERE image LIKE '/uploads/%' AND image NOT LIKE '/api/uploads/%';

-- Update ProductImage URLs
UPDATE "ProductImage" 
SET url = '/api' || url 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Show summary
SELECT 'SlideshowImage' as table_name, COUNT(*) as updated_count 
FROM "SlideshowImage" WHERE url LIKE '/api/uploads/%'
UNION ALL
SELECT 'EditorialFeature', COUNT(*) 
FROM "EditorialFeature" WHERE "imageUrl" LIKE '/api/uploads/%'
UNION ALL
SELECT 'Testimonial', COUNT(*) 
FROM "Testimonial" WHERE "imageUrl" LIKE '/api/uploads/%'
UNION ALL
SELECT 'VideoCarouselItem', COUNT(*) 
FROM "VideoCarouselItem" WHERE url LIKE '/api/uploads/%'
UNION ALL
SELECT 'Product', COUNT(*) 
FROM "Product" WHERE image LIKE '/api/uploads/%'
UNION ALL
SELECT 'ProductImage', COUNT(*) 
FROM "ProductImage" WHERE url LIKE '/api/uploads/%';
EOF

echo ""
echo "=== Rebuilding application ==="
rm -rf .next
npm run build

echo ""
echo "=== Restarting PM2 ==="
pm2 restart hars-jewellery --update-env

echo ""
echo "=== Testing APIs ==="
sleep 5
echo "Testing slideshow API:"
curl -s http://localhost:3000/api/slideshow | head -5
echo ""
echo "Testing editorial showcase API:"
curl -s http://localhost:3000/api/editorial-showcase | head -5

echo ""
echo "=== Fix complete! ==="
echo "All image URLs have been updated to use the API route."
echo "Check your homepage - all images should now appear."

