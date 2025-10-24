'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface RazorpayPaymentProps {
  onSuccess: () => void
  onError: () => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({ onSuccess, onError }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const { items, getTotalWithTax, clearCart } = useCartStore()
  const router = useRouter()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      // For now, always use development mode (direct order creation)
      const isDevelopment = true
      
      if (isDevelopment) {
        // For development, create order directly without payment
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            })),
            total: getTotalWithTax()
          })
        })

        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          toast.success(`Development mode: Order #${orderData.id.slice(-8).toUpperCase()} created successfully!`)
          clearCart()
          onSuccess()
        } else {
          const errorData = await orderResponse.json()
          throw new Error(errorData.error || 'Failed to create order')
        }
        return
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }

      // Create payment order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: getTotalWithTax(),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 500 && errorData.error?.includes('Authentication failed')) {
          throw new Error('Payment gateway not configured. Please contact support or try again later.')
        }
        throw new Error(`Failed to create payment order: ${errorData.error || 'Unknown error'}`)
      }

      const { orderId, amount, currency, key } = await response.json()

      // Razorpay options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Hars Jewellery',
        description: 'Jewelry Purchase',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: items.map(item => ({
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.price
                })),
                total: getTotalWithTax()
              })
            })

            if (verifyResponse.ok) {
              const result = await verifyResponse.json()
              toast.success('Payment successful! Order placed.')
              clearCart()
              onSuccess()
              router.push('/orders')
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
            onError()
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '+91XXXXXXXXXX'
        },
        notes: {
          address: 'Jewelry Store Address'
        },
        theme: {
          color: '#f59e0b'
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled')
            onError()
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
      onError()
    } finally {
      setLoading(false)
    }
  }

  const isDevMode = true // Always in development mode for now

  return (
    <button
      onClick={handlePayment}
      disabled={loading || items.length === 0}
      className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : isDevMode ? 'Proceed to Pay (Dev Mode)' : 'Proceed to Pay'}
    </button>
  )
}
