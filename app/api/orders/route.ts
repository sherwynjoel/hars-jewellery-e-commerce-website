import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import { buildInvoiceEmail } from '@/lib/invoice-email'

export async function POST(request: NextRequest) {
  try {
    console.log('Order API: Starting order creation...')
    
    const session = await getServerSession(authOptions)
    console.log('Order API: Session check:', { session: !!session, userId: session?.user?.id })
    
    if (!session) {
      console.log('Order API: No session found')
      return NextResponse.json({ error: 'Unauthorized - Please sign in to place an order' }, { status: 401 })
    }

    // Check if services are stopped
    const serviceStatus = await prisma.serviceStatus.findUnique({
      where: { id: 'service-status' }
    })

    if (serviceStatus?.isStopped) {
      console.log('Order API: Services are stopped')
      return NextResponse.json(
        { 
          error: 'Services are currently stopped',
          message: serviceStatus.message || 'Our services are stopped today. Please check after 12 hours.'
        },
        { status: 503 } // Service Unavailable
      )
    }

    const body = await request.json()
    console.log('Order API: Request body:', { itemsCount: body.items?.length, total: body.total })
    console.log('Order API: Items details:', body.items)

    const { items, total, customer, addressVerification } = body

    if (!items || items.length === 0) {
      console.log('Order API: No items provided')
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Validate stock availability before creating order
    console.log('Order API: Validating stock availability...')
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        inStock: true,
        stockCount: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    const stockErrors: string[] = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      
      if (!product) {
        stockErrors.push(`Product ${item.productId} not found`)
        continue
      }

      if (!product.inStock) {
        stockErrors.push(`${product.name} is out of stock`)
        continue
      }

      if (product.stockCount < item.quantity) {
        stockErrors.push(`Insufficient stock for ${product.name}. Available: ${product.stockCount}, Requested: ${item.quantity}`)
        continue
      }
    }

    if (stockErrors.length > 0) {
      console.error('Order API: ❌ Stock validation failed:', stockErrors)
      return NextResponse.json({ 
        error: 'Stock validation failed',
        details: stockErrors
      }, { status: 400 })
    }

    console.log('Order API: ✅ Stock validation passed')

    // Use the total with tax from the frontend, or calculate if not provided
    const orderTotal = total || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    console.log('Order API: Order total:', orderTotal)

    // Create order
    console.log('Order API: Creating order with items:', items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })))
    
    const autoVerified = Boolean(addressVerification?.verified)
    const verificationMethod = addressVerification?.method || 'AUTO_PINCODE'

    // Determine customer email - prioritize customer object, then session
    const customerEmail = customer?.email || session.user.email || null
    
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: orderTotal,
        customerName: customer?.name ?? session.user.name ?? 'Customer',
        email: customerEmail,
        phone: customer?.phone ?? '',
        addressLine1: customer?.addressLine1 ?? '',
        addressLine2: customer?.addressLine2 ?? null,
        city: customer?.city ?? '',
        state: customer?.state ?? '',
        postalCode: customer?.postalCode ?? '',
        addressVerified: autoVerified,
        addressVerifiedAt: autoVerified ? new Date() : undefined,
        addressVerificationMethod: autoVerified ? verificationMethod : null,
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

    // Decrease stock count for each product in the order
    console.log('Order API: Decreasing stock counts...')
    for (const orderItem of order.items) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: orderItem.productId },
          select: { stockCount: true }
        })

        if (product) {
          const newStockCount = Math.max(0, product.stockCount - orderItem.quantity)
          const isInStock = newStockCount > 0

          await prisma.product.update({
            where: { id: orderItem.productId },
            data: {
              stockCount: newStockCount,
              inStock: isInStock
            }
          })

          console.log(`Order API: Updated stock for product ${orderItem.productId}: ${product.stockCount} -> ${newStockCount}, inStock: ${isInStock}`)
        }
      } catch (stockError) {
        console.error(`Order API: Error updating stock for product ${orderItem.productId}:`, stockError)
        // Don't fail the order if stock update fails, but log it
      }
    }

    // Send invoice email to customer
    const emailToSend = (order.email || customerEmail || session.user.email || '').trim()
    
    console.log('Order API: Checking email for invoice...', { 
      orderEmail: order.email, 
      customerEmail: customer?.email,
      sessionEmail: session.user.email,
      emailToSend,
      isValidEmail: emailToSend && emailToSend.includes('@')
    })
    
    if (emailToSend && emailToSend.includes('@')) {
      try {
        console.log('Order API: Building invoice email for:', emailToSend)
        const invoiceHtml = buildInvoiceEmail(order)
        const emailSubject = `Invoice ${order.id.slice(-8).toUpperCase()} - Hars Jewellery`
        console.log('Order API: Sending invoice email...', { to: emailToSend, subject: emailSubject })
        
        const emailResult = await sendEmail(emailToSend, emailSubject, invoiceHtml)
        
        if (emailResult.success) {
          console.log('Order API: ✅ Invoice email sent successfully to:', emailToSend)
        } else {
          console.error('Order API: ❌ Failed to send invoice email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Order API: ❌ Exception while sending invoice email:', emailError)
        console.error('Order API: Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
      }
    } else {
      console.warn('Order API: ⚠️ No email address found for order. Order email:', order.email, 'Customer:', customer?.email, 'Session:', session.user.email)
    }

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
