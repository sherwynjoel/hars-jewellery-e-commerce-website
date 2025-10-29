import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Order API: Starting order creation...')
    
    const session = await getServerSession(authOptions)
    console.log('Order API: Session check:', { session: !!session, userId: session?.user?.id })
    
    if (!session) {
      console.log('Order API: No session found')
      return NextResponse.json({ error: 'Unauthorized - Please sign in to place an order' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Order API: Request body:', { itemsCount: body.items?.length, total: body.total })
    console.log('Order API: Items details:', body.items)

    const { items, total, customer } = body

    if (!items || items.length === 0) {
      console.log('Order API: No items provided')
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Use the total with tax from the frontend, or calculate if not provided
    const orderTotal = total || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    console.log('Order API: Order total:', orderTotal)

    // Create order
    console.log('Order API: Creating order with items:', items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })))
    
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: orderTotal,
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
    
    console.log('Order API: Created order with items count:', order.items.length)
    console.log('Order API: Order items:', order.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price
    })))

    console.log('Order API: Order created successfully:', order.id)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Order API: Error creating order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
