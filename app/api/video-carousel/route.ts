import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active video carousel items for public display
export async function GET() {
  try {
    // Try to access the model - if it doesn't exist, the catch will handle it
    const items = await (prisma as any).videoCarouselItem?.findMany({
      where: { 
        isActive: true
      },
      orderBy: { position: 'asc' }
    }) || []
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
    // Silently return empty array - don't log errors for public endpoint
    // This prevents page crashes if Prisma model isn't available yet
    return NextResponse.json([])
  }
}

