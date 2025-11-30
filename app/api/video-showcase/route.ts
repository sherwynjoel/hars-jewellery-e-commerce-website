import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all active video showcase items (public)
export async function GET() {
  try {
    const items = await prisma.videoShowcase.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    })
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
    console.error('Error fetching video showcase:', error)
    return NextResponse.json({ error: 'Failed to fetch video showcase' }, { status: 500 })
  }
}

