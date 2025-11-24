#!/bin/bash
# Deploy Image Fix to VPS
# Run this script on your VPS: bash deploy-image-fix-vps.sh

cd /var/www/hars-jewellery

echo "=== Creating API uploads route directory ==="
mkdir -p app/api/uploads/\[filename\]

echo "=== Creating API uploads route file ==="
cat > app/api/uploads/\[filename\]/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Ensure this route is dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Path to the uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadsDir, filename)

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(filepath)

    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    }
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving upload:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
EOF

echo "=== Updating upload route ==="
# Backup original
cp app/api/upload/route.ts app/api/upload/route.ts.backup

# Update the upload route to return API URLs
sed -i 's|const fileUrl = `/uploads/${filename}`|const fileUrl = `/api/uploads/${filename}`\n    const staticUrl = `/uploads/${filename}`|' app/api/upload/route.ts

# Update the return statement
sed -i 's|imageUrl: fileUrl|imageUrl: fileUrl,\n      staticUrl|' app/api/upload/route.ts || {
  # If sed fails, we'll need to manually edit
  echo "Note: You may need to manually update app/api/upload/route.ts"
  echo "Change line 57 from: const fileUrl = \`/uploads/\${filename}\`"
  echo "To: const fileUrl = \`/api/uploads/\${filename}\`"
  echo "And add: const staticUrl = \`/uploads/\${filename}\`"
}

echo "=== Creating image-utils.ts ==="
mkdir -p lib
cat > lib/image-utils.ts << 'EOF'
/**
 * Check if an image URL should be unoptimized
 * Images from /uploads/ or /api/uploads/ should be unoptimized
 * to avoid Next.js image optimization issues with dynamically uploaded files
 */
export function shouldUnoptimizeImage(url: string | undefined | null): boolean {
  if (!url) return false
  return url.startsWith('/uploads/') || url.startsWith('/api/uploads/')
}
EOF

echo "=== Rebuilding application ==="
rm -rf .next
npm run build

echo "=== Restarting PM2 ==="
pm2 restart hars-jewellery --update-env

echo ""
echo "=== Testing API route ==="
sleep 3
curl -I http://localhost:3000/api/uploads/1763916772416-eb241a5b3646245d06b9267e63f849ec.jpg

echo ""
echo "=== Deployment complete! ==="
echo "Now try uploading a new product image in the admin panel."
echo "It should appear immediately without needing to restart PM2."

