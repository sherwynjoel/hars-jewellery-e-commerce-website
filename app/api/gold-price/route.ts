import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    // Normalize to date-only (00:00:00) for comparison
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const price = await prisma.goldPrice.findFirst({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: 'desc' }
    })

    if (!price) {
      return NextResponse.json({ pricePerGram: null, date: start.toISOString() })
    }

    return NextResponse.json({ pricePerGram: price.pricePerGram, date: price.date })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch gold price' }, { status: 500 })
  }
}


