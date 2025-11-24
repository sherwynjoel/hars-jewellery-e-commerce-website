import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const revalidateHomepage = () => {
  try {
    revalidatePath('/')
    revalidatePath('/collections')
  } catch (error) {
    console.error('[Slideshow Admin] Failed to revalidate paths:', error)
  }
}

// GET all slideshow images
export async function GET() {
  try {
    const images = await prisma.slideshowImage.findMany({
      orderBy: { position: 'asc' }
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching slideshow images:', error)
    return NextResponse.json({ error: 'Failed to fetch slideshow images' }, { status: 500 })
  }
}

// POST - Create new slideshow image
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

    const image = await prisma.slideshowImage.create({
      data: {
        url,
        title: title || null,
        subtitle: subtitle || null,
        position: position || 0,
        isActive: isActive !== undefined ? isActive : true,
        type: type || 'image'
      }
    })

    revalidateHomepage()
    return NextResponse.json(image)
  } catch (error) {
    console.error('Error creating slideshow image:', error)
    return NextResponse.json({ error: 'Failed to create slideshow image' }, { status: 500 })
  }
}

// PATCH - Update slideshow image
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

    const image = await prisma.slideshowImage.update({
      where: { id },
      data: updateData
    })

    revalidateHomepage()
    return NextResponse.json(image)
  } catch (error) {
    console.error('Error updating slideshow image:', error)
    return NextResponse.json({ error: 'Failed to update slideshow image' }, { status: 500 })
  }
}

// DELETE - Delete slideshow image
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

    await prisma.slideshowImage.delete({
      where: { id }
    })

    revalidateHomepage()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting slideshow image:', error)
    return NextResponse.json({ error: 'Failed to delete slideshow image' }, { status: 500 })
  }
}

