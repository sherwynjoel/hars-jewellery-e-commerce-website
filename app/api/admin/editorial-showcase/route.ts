import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET() {
  try {
    const items = await prisma.editorialFeature.findMany({
      orderBy: { position: 'asc' },
      include: {
        product: {
          select: { id: true, name: true }
        }
      }
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching editorial features:', error)
    return NextResponse.json({ error: 'Failed to fetch editorial features' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await ensureAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, subtitle, imageUrl, productId, linkUrl, layout } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!productId && !linkUrl) {
      return NextResponse.json({ error: 'Product or custom link is required' }, { status: 400 })
    }

    const nextPosition = await prisma.editorialFeature.count()

    const feature = await prisma.editorialFeature.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        productId: productId || null,
        linkUrl: linkUrl || null,
        layout: layout || 'square',
        position: nextPosition,
        isActive: true
      }
    })

    return NextResponse.json(feature)
  } catch (error) {
    console.error('Error creating editorial feature:', error)
    return NextResponse.json({ error: 'Failed to create editorial feature' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await ensureAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data: Record<string, any> = {}
    if (rest.title !== undefined) data.title = rest.title
    if (rest.subtitle !== undefined) data.subtitle = rest.subtitle
    if (rest.imageUrl !== undefined) data.imageUrl = rest.imageUrl
    if (rest.productId !== undefined) data.productId = rest.productId || null
    if (rest.linkUrl !== undefined) data.linkUrl = rest.linkUrl || null
    if (rest.layout !== undefined) data.layout = rest.layout
    if (rest.position !== undefined) data.position = rest.position
    if (rest.isActive !== undefined) data.isActive = rest.isActive

    const updated = await prisma.editorialFeature.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating editorial feature:', error)
    return NextResponse.json({ error: 'Failed to update editorial feature' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await ensureAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.editorialFeature.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting editorial feature:', error)
    return NextResponse.json({ error: 'Failed to delete editorial feature' }, { status: 500 })
  }
}

