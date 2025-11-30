import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    // Normalize to date-only (00:00:00) for comparison
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // First, try to get today's price
    let price = await prisma.goldPrice.findFirst({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: 'desc' }
    })

    // If no price for today, get the most recent price (from any date)
    if (!price) {
      price = await prisma.goldPrice.findFirst({
        orderBy: { date: 'desc' }
      })
    }

    if (!price) {
      return NextResponse.json({ pricePerGram: null, date: null })
    }

    return NextResponse.json({ 
      pricePerGram: price.pricePerGram, 
      date: price.date,
      isToday: price.date >= start && price.date < end
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch gold price' }, { status: 500 })
  }
}


