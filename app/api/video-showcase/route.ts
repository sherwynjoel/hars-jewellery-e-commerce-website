import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Disable caching for this route
export const revalidate = 0
export const dynamic = 'force-dynamic'

// GET all active video showcase items (public)
export async function GET() {
  try {
    // Check if table exists by trying to query it
    const items = await prisma.videoShowcase.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    })
    
    console.log(`[Video Showcase API] Found ${items.length} active videos`)
    
    const response = NextResponse.json(Array.isArray(items) ? items : [])
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error: any) {
    // Handle Prisma errors gracefully (e.g., table doesn't exist)
    if (error?.code === 'P2021' || error?.code === 'P2001' || error?.message?.includes('does not exist')) {
      console.warn('[Video Showcase API] Table does not exist yet. Run migration.')
      return NextResponse.json([])
    }
    
    console.error('[Video Showcase API] Error fetching video showcase:', error)
    console.error('[Video Showcase API] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    // Return empty array instead of error to prevent page break
    return NextResponse.json([])
  }
}

