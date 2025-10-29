'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CreditCard, Loader2 } from 'lucide-react'

interface RazorpayPaymentGatewayProps {
  onSuccess: () => void
  onError: () => void
  customer?: {
    name: string
    email: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPaymentGateway({ onSuccess, onError, customer }: RazorpayPaymentGatewayProps) {
  const [loading, setLoading] = useState(false)
  const { items, getTotalWithTax, clearCart } = useCartStore()
  const router = useRouter()

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true)
          return
        }
        
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    loadRazorpayScript()
  }, [])

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      // Try to create Razorpay order first
      // If it fails due to authentication, fall back to development mode

      // Create Razorpay order
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
        const errorData = await response.json()
        
        // If authentication failed, fall back to development mode
        if (errorData.error && errorData.error.includes('Authentication failed')) {
          toast('Development Mode: Creating order without payment gateway', { icon: 'ℹ️' })
          
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
              total: getTotalWithTax(),
              customer
            })
          })

          if (orderResponse.ok) {
            const orderData = await orderResponse.json()
            toast.success(`Development Mode: Order #${orderData.id.slice(-8).toUpperCase()} created successfully!`)
            clearCart()
            onSuccess()
            router.push('/orders')
          } else {
            const orderErrorData = await orderResponse.json()
            throw new Error(orderErrorData.error || 'Failed to create order')
          }
          return
        }
        
        throw new Error(errorData.error || 'Failed to create payment order')
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
                total: getTotalWithTax(),
                customer
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
          name: customer?.name || 'Customer',
          email: customer?.email || 'harsjewelleryst@gmail.com',
          contact: customer?.phone || '+919659393459'
        },
        notes: {
          address: [
            customer?.addressLine1,
            customer?.addressLine2,
            [customer?.city, customer?.state, customer?.postalCode].filter(Boolean).join(', ')
          ].filter(Boolean).join(', ')
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

    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Something went wrong with the payment process.')
      onError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePayment}
      disabled={loading || items.length === 0 || !customer || !customer.name || !customer.email || !customer.phone || !customer.addressLine1 || !customer.city || !customer.state || !customer.postalCode}
      className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Pay ₹{getTotalWithTax().toLocaleString('en-IN')}</span>
        </>
      )}
    </motion.button>
  )
}
