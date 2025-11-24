import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import { buildInvoiceEmail } from '@/lib/invoice-email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT VERIFICATION STARTED ===')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('Payment Verify: ❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Payment Verify: Session found for user:', session.user.email)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, total, customer } = await request.json()
    console.log('Payment Verify: Received payment data:', {
      razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id?.substring(0, 10) + '...',
      itemsCount: items?.length,
      total,
      customerEmail: customer?.email
    })

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

    // Determine customer email - prioritize customer object, then session
    const customerEmail = customer?.email || session.user.email || null

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: total,
        status: 'PROCESSING',
        customerName: customer?.name ?? session.user.name ?? 'Customer',
        email: customerEmail || '',
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

    console.log('=== ORDER CREATED SUCCESSFULLY ===')
    console.log('Payment Verify: Order ID:', order.id)
    console.log('Payment Verify: Order email:', order.email)
    console.log('Payment Verify: Order total:', order.total)

    // Send invoice email to customer after successful payment
    const emailToSend = (order.email || customerEmail || session.user.email || '').trim()
    
    console.log('Payment Verify: Checking email for invoice...', { 
      orderEmail: order.email, 
      customerEmail: customer?.email,
      sessionEmail: session.user.email,
      emailToSend,
      isValidEmail: emailToSend && emailToSend.includes('@')
    })
    
    if (emailToSend && emailToSend.includes('@')) {
      try {
        console.log('Payment Verify: Building invoice email for:', emailToSend)
        const invoiceHtml = buildInvoiceEmail(order)
        const emailSubject = `Invoice ${order.id.slice(-8).toUpperCase()} - Hars Jewellery`
        console.log('Payment Verify: Sending invoice email...', { to: emailToSend, subject: emailSubject })
        
        const emailResult = await sendEmail(emailToSend, emailSubject, invoiceHtml)
        
        if (emailResult.success) {
          console.log('=== INVOICE EMAIL SENT SUCCESSFULLY ===')
          console.log('Payment Verify: ✅ Invoice email sent successfully to:', emailToSend)
          console.log('Payment Verify: Invoice number:', order.id.slice(-8).toUpperCase())
        } else {
          console.error('=== INVOICE EMAIL FAILED ===')
          console.error('Payment Verify: ❌ Failed to send invoice email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Payment Verify: ❌ Exception while sending invoice email:', emailError)
        console.error('Payment Verify: Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
        // Don't fail the payment verification if email fails
      }
    } else {
      console.warn('Payment Verify: ⚠️ No email address found for order. Order email:', order.email, 'Customer:', customer?.email, 'Session:', session.user.email)
    }

    console.log('=== PAYMENT VERIFICATION COMPLETED ===')
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
