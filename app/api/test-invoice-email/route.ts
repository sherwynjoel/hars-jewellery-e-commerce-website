import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/mailer'
import { buildInvoiceEmail, OrderWithItems } from '@/lib/invoice-email'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint to send invoice email
 * Usage: POST /api/test-invoice-email
 * Body: { email: "test@example.com", orderId?: "optional-existing-order-id" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin or authenticated users to test
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, orderId } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    let order: OrderWithItems | null = null

    // If orderId is provided, fetch that order
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
    } else {
      // Create a mock order for testing
      const mockProduct = await prisma.product.findFirst({
        where: { inStock: true }
      })

      if (!mockProduct) {
        return NextResponse.json({ 
          error: 'No products found in database. Cannot create test invoice.' 
        }, { status: 400 })
      }

      // Create a temporary mock order
      const testOrderId = `test-${Date.now()}`
      order = {
        id: testOrderId,
        userId: session.user.id,
        total: mockProduct.price * 1.03 + (mockProduct.shippingCost || 0), // price + tax + shipping
        customerName: session.user.name || 'Test Customer',
        email: email,
        phone: '+91 98765 43210',
        addressLine1: '123 Test Street',
        addressLine2: null,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641001',
        addressVerified: true,
        addressVerifiedAt: new Date(),
        addressVerifiedBy: null,
        addressVerificationMethod: 'TEST',
        trackingNumber: null,
        trackingCarrier: null,
        trackingUrl: null,
        shippedAt: null,
        deliveredAt: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: `test-item-${Date.now()}`,
            orderId: testOrderId,
            productId: mockProduct.id,
            quantity: 1,
            price: mockProduct.price,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: mockProduct
          }
        ]
      } as OrderWithItems
    }

    console.log('🧪 Test Invoice Email: Building invoice for:', email)
    const invoiceHtml = buildInvoiceEmail(order)
    const invoiceNumber = order.id.slice(-8).toUpperCase()
    const emailSubject = `Test Invoice ${invoiceNumber} - Hars Jewellery`

    console.log('🧪 Test Invoice Email: Sending to:', email)
    const emailResult = await sendEmail(email, emailSubject, invoiceHtml)

    if (emailResult.success) {
      console.log('🧪 Test Invoice Email: ✅ Successfully sent to:', email)
      return NextResponse.json({
        success: true,
        message: 'Test invoice email sent successfully',
        email: email,
        invoiceNumber: invoiceNumber
      })
    } else {
      console.error('🧪 Test Invoice Email: ❌ Failed to send:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error,
        message: 'Failed to send test invoice email'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('🧪 Test Invoice Email: ❌ Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send test invoice email'
    }, { status: 500 })
  }
}

