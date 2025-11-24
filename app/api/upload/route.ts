import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only authenticated users can upload
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in to upload files' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type (images or videos)
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 })
    }

    // Validate file size (max 50MB for videos, 20MB for images to preserve quality)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${isVideo ? '50MB' : '20MB'}` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return the public URL - use API route for immediate availability
    // The API route serves files dynamically, so no server restart needed
    const fileUrl = `/api/uploads/${filename}`
    // Also provide the static path for backward compatibility
    const staticUrl = `/uploads/${filename}`

    return NextResponse.json({ 
      success: true, 
      imageUrl: fileUrl, // Use API route for immediate availability
      videoUrl: isVideo ? fileUrl : undefined,
      fileUrl,
      staticUrl, // For backward compatibility
      fileType: isVideo ? 'video' : 'image',
      filename 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
