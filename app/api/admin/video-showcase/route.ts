import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const revalidateHomepage = () => {
  try {
    revalidatePath('/')
  } catch (error) {
    console.error('[Video Showcase Admin] Failed to revalidate paths:', error)
  }
}

// GET all video showcase items (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.videoShowcase.findMany({
      orderBy: { position: 'asc' }
    })
    
    return NextResponse.json(Array.isArray(items) ? items : [])
  } catch (error: any) {
    console.error('Error fetching video showcase items:', error)
    return NextResponse.json({ error: 'Failed to fetch video showcase items' }, { status: 500 })
  }
}

// POST - Create new video showcase item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, title, subtitle, position, isActive, duration } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Get max position to add at end if not specified
    let finalPosition = position
    if (finalPosition === undefined) {
      const maxPosition = await prisma.videoShowcase.findFirst({
        orderBy: { position: 'desc' },
        select: { position: true }
      })
      finalPosition = (maxPosition?.position ?? -1) + 1
    }

    const item = await prisma.videoShowcase.create({
      data: {
        url,
        title: title || null,
        subtitle: subtitle || null,
        position: finalPosition,
        isActive: isActive !== undefined ? isActive : true,
        duration: duration || null
      }
    })

    revalidateHomepage()
    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error creating video showcase item:', error)
    return NextResponse.json({ 
      error: 'Failed to create video showcase item',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH - Update video showcase item
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, url, title, subtitle, position, isActive, duration } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (url !== undefined) updateData.url = url
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (position !== undefined) updateData.position = position
    if (isActive !== undefined) updateData.isActive = isActive
    if (duration !== undefined) updateData.duration = duration

    const item = await prisma.videoShowcase.update({
      where: { id },
      data: updateData
    })

    revalidateHomepage()
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating video showcase item:', error)
    return NextResponse.json({ error: 'Failed to update video showcase item' }, { status: 500 })
  }
}

// DELETE - Delete video showcase item
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

    await prisma.videoShowcase.delete({
      where: { id }
    })

    revalidateHomepage()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video showcase item:', error)
    return NextResponse.json({ error: 'Failed to delete video showcase item' }, { status: 500 })
  }
}

