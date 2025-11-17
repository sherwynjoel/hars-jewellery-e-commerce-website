import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phoneRaw = body?.phone

    if (!phoneRaw) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const digits = String(phoneRaw).replace(/\D/g, '')
    if (digits.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 })
    }

    await prisma.subscriber.upsert({
      where: { phone: digits },
      update: {},
      create: { phone: digits }
    })

    return NextResponse.json({ success: true, message: 'Thank you! We will reach out soon.' })
  } catch (error) {
    console.error('Error saving subscriber:', error)
    return NextResponse.json({ error: 'Failed to save phone number' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

