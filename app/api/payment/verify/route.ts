import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, total, customer } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify payment signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpaySecret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 })
    }
    
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: total,
        status: 'PROCESSING',
        customerName: customer?.name ?? session.user.name ?? 'Customer',
        email: customer?.email ?? session.user.email,
        phone: customer?.phone ?? '',
        addressLine1: customer?.addressLine1 ?? '',
        addressLine2: customer?.addressLine2 ?? null,
        city: customer?.city ?? '',
        state: customer?.state ?? '',
        postalCode: customer?.postalCode ?? '',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      order,
      paymentId: razorpay_payment_id,
      message: 'Payment verified and order created successfully'
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
