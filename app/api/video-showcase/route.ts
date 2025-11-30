import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all active video showcase items (public)
export async function GET() {
  try {
    const items = await prisma.videoShowcase.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    })
    
    console.log(`[Video Showcase API] Found ${items.length} active videos`)
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
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

