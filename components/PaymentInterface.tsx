'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react'

interface PaymentInterfaceProps {
  onSuccess: () => void
  onError: () => void
}

export default function PaymentInterface({ onSuccess, onError }: PaymentInterfaceProps) {
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'ready' | 'processing' | 'success' | 'error'>('ready')
  const { items, getTotalWithTax, clearCart } = useCartStore()
  const router = useRouter()

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    setPaymentStep('processing')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create order
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
        setPaymentStep('success')
        toast.success(`Payment successful! Order #${orderData.id.slice(-8).toUpperCase()} created.`)
        
        // Clear cart and redirect after success animation
        setTimeout(() => {
          clearCart()
          onSuccess()
          router.push('/orders')
        }, 2000)
      } else {
        throw new Error('Order creation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStep('error')
      toast.error('Payment failed. Please try again.')
      onError()
    } finally {
      setLoading(false)
    }
  }

  const renderPaymentStep = () => {
    switch (paymentStep) {
      case 'ready':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={loading || items.length === 0}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Proceed to Pay ₹{getTotalWithTax().toLocaleString('en-IN')}</span>
          </motion.button>
        )

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
          >
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Processing Payment</h3>
            <p className="text-blue-700">Please wait while we process your payment...</p>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Successful!</h3>
            <p className="text-green-700">Your order has been placed successfully.</p>
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-red-900 mb-2">Payment Failed</h3>
            <p className="text-red-700 mb-4">Something went wrong. Please try again.</p>
            <button
              onClick={() => setPaymentStep('ready')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {renderPaymentStep()}
    </div>
  )
}
