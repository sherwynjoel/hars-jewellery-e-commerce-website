# Deploy Image Fix to VPS

## Quick Deploy Commands

Run these commands on your VPS to deploy the image fix:

```bash
cd /var/www/hars-jewellery

# 1. Pull latest changes (if using git)
git pull origin main

# OR manually copy these files:
# - app/api/uploads/[filename]/route.ts
# - app/api/upload/route.ts (updated)
# - lib/image-utils.ts
# - components/ProductCard.tsx (updated)
# - app/products/[id]/page.tsx (updated)
# - components/EditorialShowcase.tsx (updated)

# 2. Clean build
rm -rf .next
npm run build

# 3. Restart PM2
pm2 restart hars-jewellery --update-env

# 4. Test the API route
curl -I http://localhost:3000/api/uploads/1763916772416-eb241a5b3646245d06b9267e63f849ec.jpg

# Should return HTTP 200 OK
```

## Verify the Fix

1. **Test API Route:**
   ```bash
   curl -I http://localhost:3000/api/uploads/1763916772416-eb241a5b3646245d06b9267e63f849ec.jpg
   ```

2. **Check Upload Route:**
   - Upload a new image in admin panel
   - Check browser console for the returned URL
   - Should be `/api/uploads/filename.jpg`

3. **Check Database:**
   ```bash
   sudo -u postgres psql -d hars_jewellery -c "SELECT name, image FROM \"Product\" ORDER BY \"createdAt\" DESC LIMIT 5;"
   ```
   - New products should have `/api/uploads/` URLs

## Troubleshooting

If images still don't show:

1. **Check if API route exists:**
   ```bash
   ls -la app/api/uploads/\[filename\]/route.ts
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs hars-jewellery --lines 50
   ```

3. **Test API route directly:**
   ```bash
   curl http://localhost:3000/api/uploads/1763916772416-eb241a5b3646245d06b9267e63f849ec.jpg -o /tmp/test.jpg
   file /tmp/test.jpg
   ```

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

