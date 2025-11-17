import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active slideshow images for public display
export async function GET() {
  try {
    const images = await prisma.slideshowImage.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    })
    
    // Log for debugging
    console.log(`[Slideshow API] Found ${images.length} active images`)
    
    return NextResponse.json(Array.isArray(images) ? images : [])
  } catch (error: any) {
    // Always log errors to help diagnose issues
    console.error('[Slideshow API] Error fetching slideshow images:', error)
    console.error('[Slideshow API] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json([])
  }
}

