import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all video carousel items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to access the model - if it doesn't exist, the catch will handle it
    const items = await (prisma as any).videoCarouselItem?.findMany({
      orderBy: { position: 'asc' }
    }) || []
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
    console.error('Error fetching video carousel items:', error)
    // Return empty array if model doesn't exist yet
    if (error.message?.includes('videoCarouselItem') || error.message?.includes('Unknown arg')) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: 'Failed to fetch video carousel items' }, { status: 500 })
  }
}

// POST - Create new video carousel item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, title, subtitle, position, isActive, type } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check if model exists
    if (!(prisma as any).videoCarouselItem) {
      return NextResponse.json({ 
        error: 'VideoCarouselItem model not available. Please restart the server after running: npx prisma generate',
        details: 'Prisma client needs to be regenerated'
      }, { status: 500 })
    }

    const item = await (prisma as any).videoCarouselItem.create({
      data: {
        url,
        title: title || null,
        subtitle: subtitle || null,
        position: position || 0,
        isActive: isActive !== undefined ? isActive : true,
        type: type || 'video'
      }
    })

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error creating video carousel item:', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = error?.meta || error?.code || ''
    
    // Check for common Prisma errors
    if (errorMessage.includes('videoCarouselItem') || errorMessage.includes('Unknown arg')) {
      return NextResponse.json({ 
        error: 'Database model not found. Please restart the server after running: npx prisma generate',
        details: errorMessage
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create video carousel item',
      details: errorMessage,
      code: errorDetails
    }, { status: 500 })
  }
}

// PATCH - Update video carousel item
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, subtitle, position, isActive, type } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (position !== undefined) updateData.position = position
    if (isActive !== undefined) updateData.isActive = isActive
    if (type !== undefined) updateData.type = type

    const item = await (prisma as any).videoCarouselItem.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating video carousel item:', error)
    return NextResponse.json({ error: 'Failed to update video carousel item' }, { status: 500 })
  }
}

// DELETE - Delete video carousel item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await (prisma as any).videoCarouselItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video carousel item:', error)
    return NextResponse.json({ error: 'Failed to delete video carousel item' }, { status: 500 })
  }
}

