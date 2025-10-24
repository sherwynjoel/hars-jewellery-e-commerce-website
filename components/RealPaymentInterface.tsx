'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, QrCode, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

interface RealPaymentInterfaceProps {
  onSuccess: () => void
  onError: () => void
}

export default function RealPaymentInterface({ onSuccess, onError }: RealPaymentInterfaceProps) {
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'methods' | 'qr' | 'processing' | 'success' | 'error'>('methods')
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'wallet' | null>(null)
  const [qrCode, setQrCode] = useState('')
  const { items, getTotalWithTax, clearCart } = useCartStore()
  const router = useRouter()

  // Generate QR code data
  useEffect(() => {
    if (paymentStep === 'qr') {
      const upiId = 'harsjewellery@paytm'
      const amount = getTotalWithTax()
      const qrData = `upi://pay?pa=${upiId}&pn=Hars%20Jewellery&am=${amount}&cu=INR&tn=Jewelry%20Purchase`
      setQrCode(qrData)
    }
  }, [paymentStep, getTotalWithTax])

  const handlePaymentMethod = (method: 'card' | 'upi' | 'wallet') => {
    setSelectedMethod(method)
    if (method === 'upi') {
      setPaymentStep('qr')
    } else {
      setPaymentStep('processing')
      processPayment(method)
    }
  }

  const processPayment = async (method: string) => {
    setLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

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
        }, 3000)
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

  const renderPaymentMethods = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
      
      <div className="grid gap-3">
        <button
          onClick={() => handlePaymentMethod('card')}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span className="font-medium">Credit/Debit Card</span>
          </div>
          <span className="text-sm text-gray-500">Visa, Mastercard, RuPay</span>
        </button>

        <button
          onClick={() => handlePaymentMethod('upi')}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-purple-600" />
            <span className="font-medium">UPI Payment</span>
          </div>
          <span className="text-sm text-gray-500">PhonePe, GPay, Paytm</span>
        </button>

        <button
          onClick={() => handlePaymentMethod('wallet')}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-green-600" />
            <span className="font-medium">Digital Wallet</span>
          </div>
          <span className="text-sm text-gray-500">Paytm, PhonePe, Amazon Pay</span>
        </button>
      </div>
    </motion.div>
  )

  const renderQRCode = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setPaymentStep('methods')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h3 className="text-lg font-semibold">UPI Payment</h3>
        <div></div>
      </div>

      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Scan QR Code with your UPI app</p>
          <p className="text-lg font-semibold text-gold-600">₹{getTotalWithTax().toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setPaymentStep('processing')}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          I have completed the payment
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">UPI ID: harsjewellery@paytm</p>
        </div>
      </div>
    </motion.div>
  )

  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <Loader2 className="w-16 h-16 text-gold-600 animate-spin mx-auto" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600">Please wait while we verify your payment...</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Payment Method:</span>
          <span className="text-sm font-medium">
            {selectedMethod === 'card' ? 'Credit/Debit Card' : 
             selectedMethod === 'upi' ? 'UPI Payment' : 'Digital Wallet'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-sm font-medium">₹{getTotalWithTax().toLocaleString('en-IN')}</span>
        </div>
      </div>
    </motion.div>
  )

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
      <div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h3>
        <p className="text-green-700">Your order has been confirmed and will be processed soon.</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-green-700">Order Total:</span>
          <span className="text-lg font-bold text-green-800">₹{getTotalWithTax().toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700">Payment Method:</span>
          <span className="text-sm font-medium text-green-800">
            {selectedMethod === 'card' ? 'Credit/Debit Card' : 
             selectedMethod === 'upi' ? 'UPI Payment' : 'Digital Wallet'}
          </span>
        </div>
      </div>
    </motion.div>
  )

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-4xl">❌</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-red-900 mb-2">Payment Failed</h3>
        <p className="text-red-700 mb-4">Something went wrong with your payment. Please try again.</p>
        <button
          onClick={() => setPaymentStep('methods')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-md mx-auto">
      {paymentStep === 'methods' && renderPaymentMethods()}
      {paymentStep === 'qr' && renderQRCode()}
      {paymentStep === 'processing' && renderProcessing()}
      {paymentStep === 'success' && renderSuccess()}
      {paymentStep === 'error' && renderError()}
    </div>
  )
}
