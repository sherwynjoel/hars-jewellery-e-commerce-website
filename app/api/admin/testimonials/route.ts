import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { position: 'asc' }
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerName, title, content, imageUrl, position, isActive } = body

    if (!customerName || !content || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const nextPosition =
      typeof position === 'number'
        ? position
        : await prisma.testimonial.count()

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        title: title || null,
        content,
        imageUrl,
        position: nextPosition,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, customerName, title, content, imageUrl, position, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data: Record<string, any> = {}
    if (customerName !== undefined) data.customerName = customerName
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (position !== undefined) data.position = position
    if (isActive !== undefined) data.isActive = isActive

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
}

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

    await prisma.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}

