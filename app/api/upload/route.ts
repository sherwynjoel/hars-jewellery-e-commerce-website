import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
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

    // Return the public URL
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ 
      success: true, 
      imageUrl: fileUrl, // Keep for backward compatibility
      videoUrl: isVideo ? fileUrl : undefined,
      fileUrl,
      fileType: isVideo ? 'video' : 'image',
      filename 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
