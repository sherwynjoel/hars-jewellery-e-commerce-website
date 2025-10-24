'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import RealPaymentInterface from '@/components/RealPaymentInterface'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems, getSubtotal, getTaxAmount, getTotalWithTax } = useCartStore()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!session) {
      toast.error('Please sign in to place an order')
      router.push('/auth/signin')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    
    try {
      console.log('Cart: Starting checkout process...', {
        itemsCount: items.length,
        total: getTotalWithTax(),
        session: !!session
      })
      console.log('Cart: Items being sent to order API:', items)

      // Create order
      const response = await fetch('/api/orders', {
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

      console.log('Cart: Order API response:', response.status, response.ok)

      if (response.ok) {
        const orderData = await response.json()
        console.log('Cart: Order created successfully:', orderData.id)
        toast.success(`Order #${orderData.id.slice(-8).toUpperCase()} placed successfully!`)
        clearCart()
        router.push('/orders')
      } else {
        const errorData = await response.json()
        console.error('Cart: Order placement error:', errorData)
        toast.error(errorData.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Cart: Order placement error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                href="/collections"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Start Shopping</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 flex items-center space-x-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{getSubtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (3%)</span>
                    <span className="font-medium">₹{getTaxAmount().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gold-600">
                        ₹{getTotalWithTax().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

        <RealPaymentInterface
          onSuccess={() => {
            toast.success('Payment successful! Order placed.')
            router.push('/orders')
          }}
          onError={() => {
            toast.error('Payment failed. Please try again.')
          }}
        />

                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Cart
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
