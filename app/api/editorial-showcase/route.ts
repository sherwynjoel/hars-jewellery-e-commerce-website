import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.editorialFeature.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        product: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching editorial showcase items:', error)
    return NextResponse.json({ error: 'Failed to fetch showcase items' }, { status: 500 })
  }
}

