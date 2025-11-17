import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active video carousel items for public display
export async function GET() {
  try {
    const items = await prisma.videoCarouselItem.findMany({
      where: { 
        isActive: true
      },
      orderBy: { position: 'asc' }
    })
    
    // Log for debugging
    console.log(`[Video Carousel API] Found ${items.length} active items`)
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
    // Always log errors to help diagnose issues
    console.error('[Video Carousel API] Error fetching items:', error)
    console.error('[Video Carousel API] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json([])
  }
}

