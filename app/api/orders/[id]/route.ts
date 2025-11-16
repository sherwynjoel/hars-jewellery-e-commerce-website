import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get a single order (admin or the owner)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// Update shipment/status (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, trackingNumber, trackingCarrier, trackingUrl, shippedAt, deliveredAt, addressVerified, addressVerificationMethod } = body

    const data: any = {}
    if (status) data.status = status
    if (typeof trackingNumber !== 'undefined') data.trackingNumber = trackingNumber
    if (typeof trackingCarrier !== 'undefined') data.trackingCarrier = trackingCarrier
    if (typeof trackingUrl !== 'undefined') data.trackingUrl = trackingUrl
    if (typeof shippedAt !== 'undefined') data.shippedAt = shippedAt ? new Date(shippedAt) : null
    if (typeof deliveredAt !== 'undefined') data.deliveredAt = deliveredAt ? new Date(deliveredAt) : null
    // Address verification
    if (typeof addressVerified !== 'undefined') {
      data.addressVerified = addressVerified
      data.addressVerifiedAt = addressVerified ? new Date() : null
      data.addressVerifiedBy = addressVerified ? session.user.id : null
    }
    if (addressVerificationMethod) data.addressVerificationMethod = addressVerificationMethod

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        items: { include: { product: true } }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}


