'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import RazorpayPaymentGateway from '@/components/RazorpayPaymentGateway'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems, getSubtotal, getShippingCost, getTaxAmount, getTotalWithTax } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<{ isStopped: boolean; message: string } | null>(null)
  const [validatingPincode, setValidatingPincode] = useState(false)
  const [pincodeValidation, setPincodeValidation] = useState<{
    isValid: boolean
    city: string | null
    state: string | null
    error: string | null
  } | null>(null)
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  })

  // Require authentication for cart access
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to manage your cart')
      router.push('/auth/signin?callbackUrl=/cart')
    }
  }, [status, router])

  // Load any saved address from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved-address')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCustomer((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
    
    // Fetch service status
    fetch('/api/admin/service-status')
      .then(r => r.json())
      .then(data => setServiceStatus(data))
      .catch(() => {})
  }, [])

  const handleSaveAddress = () => {
    if (!isCustomerValid()) {
      toast.error('Please fill all required delivery details before saving.')
      return
    }
    try {
      localStorage.setItem('saved-address', JSON.stringify(customer))
      toast.success('Address saved successfully!')
    } catch {
      toast.error('Failed to save address')
    }
  }

  const validatePincode = async (pincode: string) => {
    // Only validate if pincode is 6 digits
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPincodeValidation(null)
      return
    }

    setValidatingPincode(true)
    setPincodeValidation(null)

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0]
        const apiCity = postOffice.District || postOffice.Name || ''
        const apiState = postOffice.State || ''

        setPincodeValidation({
          isValid: true,
          city: apiCity,
          state: apiState,
          error: null
        })

        // Auto-fill city and state
        setCustomer(prev => ({
          ...prev,
          city: apiCity,
          state: apiState
        }))

        toast.success('Address validated! City and State auto-filled.')
      } else {
        setPincodeValidation({
          isValid: false,
          city: null,
          state: null,
          error: 'Invalid pincode. Please check and try again.'
        })
        toast.error('Invalid pincode')
      }
    } catch (error) {
      console.error('Pincode validation error:', error)
      setPincodeValidation({
        isValid: false,
        city: null,
        state: null,
        error: 'Failed to validate pincode. Please try again.'
      })
      toast.error('Failed to validate pincode')
    } finally {
      setValidatingPincode(false)
    }
  }

  const checkCityStateMatch = () => {
    if (!pincodeValidation || !pincodeValidation.isValid) return true

    const userCity = customer.city.trim().toLowerCase()
    const userState = customer.state.trim().toLowerCase()
    const apiCity = pincodeValidation.city?.toLowerCase() || ''
    const apiState = pincodeValidation.state?.toLowerCase() || ''

    // Check if user entered city/state matches API response
    const cityMatches = userCity === apiCity || userCity.includes(apiCity) || apiCity.includes(userCity)
    const stateMatches = userState === apiState || userState.includes(apiState) || apiState.includes(userState)

    return cityMatches && stateMatches
  }

  const isCustomerValid = () => {
    const basicValid = (
      customer.name.trim() &&
      customer.email.trim() &&
      customer.phone.trim() &&
      customer.addressLine1.trim() &&
      customer.city.trim() &&
      customer.state.trim() &&
      customer.postalCode.trim()
    )

    // If pincode is validated, also check if city/state matches
    if (pincodeValidation && pincodeValidation.isValid) {
      return basicValid && checkCityStateMatch()
    }

    return basicValid
  }

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

    // Validate pincode if entered
    if (customer.postalCode.length === 6 && !pincodeValidation?.isValid) {
      toast.error('Please validate your pincode before checkout')
      await validatePincode(customer.postalCode)
      return
    }

    // Check if city/state matches validated pincode
    if (pincodeValidation && pincodeValidation.isValid && !checkCityStateMatch()) {
      toast.error('City and State must match the pincode. Please correct your address.')
      return
    }

    // Check if services are stopped
    try {
      const statusResponse = await fetch('/api/admin/service-status')
      const statusData = await statusResponse.json()
      
      if (statusData.isStopped) {
        toast.error(statusData.message || 'Our services are stopped today. Please check after 12 hours.')
        return
      }
    } catch (error) {
      console.error('Error checking service status:', error)
      // Continue with checkout if status check fails
    }

    setLoading(true)
    
    try {
      console.log('Cart: Starting checkout process...', {
        itemsCount: items.length,
        total: getTotalWithTax(),
        session: !!session
      })
      console.log('Cart: Items being sent to order API:', items)

      const autoVerified = Boolean(pincodeValidation?.isValid && checkCityStateMatch())

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
          total: getTotalWithTax(),
          customer: customer,
          addressVerification: {
            verified: autoVerified,
            method: autoVerified ? 'AUTO_PINCODE' : null
          }
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
        // Show service stopped message if applicable
        if (response.status === 503 && errorData.message) {
          toast.error(errorData.message)
        } else {
          toast.error(errorData.error || errorData.message || 'Failed to place order')
        }
      }
    } catch (error) {
      console.error('Cart: Order placement error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 sm:pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-xl"
              >
                <ShoppingBag className="w-16 h-16 text-black" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
                <span className="block text-dark-900">Your</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">Cart is Empty</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start exploring our exquisite collection!
              </p>
              <Link
                href="/collections"
                className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Start Shopping</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
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
      
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-dark-900 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </motion.div>

          {/* Service Stopped Banner */}
          {serviceStatus?.isStopped && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-2xl shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    Services Temporarily Stopped
                  </h3>
                  <p className="text-red-800 mb-2">
                    {serviceStatus.message || 'Our services are stopped today. Please check after 12 hours.'}
                  </p>
                  <p className="text-sm text-red-700">
                    You can still browse and view all products, but orders cannot be placed at this time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50"
              >
                <div className="p-6 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50/30 to-white">
                  <h2 className="text-2xl font-bold text-dark-900">Cart Items</h2>
                  <p className="text-sm text-gray-600 mt-1">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg ring-2 ring-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-dark-900 mb-1 break-words">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 w-full sm:w-auto justify-center sm:justify-start flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </motion.button>
                        
                        <span className="w-10 text-center font-bold text-dark-900">
                          {item.quantity}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </motion.button>
                      </div>

                      <div className="text-left sm:text-right w-full sm:w-auto flex items-center justify-between sm:block">
                        <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700 mb-2 sm:mb-2">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 lg:sticky lg:top-32 border border-gray-100/50"
              >
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-dark-900 mb-1">
                    Order Summary
                  </h2>
                  <p className="text-sm text-gray-600">Review your order details</p>
                </div>

                {/* Delivery Details */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-800">Delivery Details</h3>
                  <input
                    className="input-field"
                    placeholder="Full Name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                  <input
                    className="input-field"
                    placeholder="Email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                  <input
                    className="input-field"
                    placeholder="Phone Number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                  <input
                    className="input-field"
                    placeholder="Address Line 1"
                    value={customer.addressLine1}
                    onChange={(e) => setCustomer({ ...customer, addressLine1: e.target.value })}
                  />
                  <input
                    className="input-field"
                    placeholder="Address Line 2 (optional)"
                    value={customer.addressLine2}
                    onChange={(e) => setCustomer({ ...customer, addressLine2: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="relative">
                      <input
                        className={`input-field ${pincodeValidation?.isValid ? 'border-green-500' : pincodeValidation?.error ? 'border-red-500' : ''}`}
                        placeholder="Postal Code"
                        type="text"
                        maxLength={6}
                        value={customer.postalCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '') // Only numbers
                          setCustomer({ ...customer, postalCode: value })
                          setPincodeValidation(null) // Reset validation when user types
                          
                          // Auto-validate when 6 digits are entered
                          if (value.length === 6) {
                            setTimeout(() => validatePincode(value), 300) // Small delay to avoid too many API calls
                          }
                        }}
                        onBlur={() => {
                          if (customer.postalCode.length === 6) {
                            validatePincode(customer.postalCode)
                          }
                        }}
                        disabled={validatingPincode}
                      />
                      {validatingPincode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      {pincodeValidation?.isValid && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                      )}
                      {pincodeValidation?.error && (
                        <p className="text-xs text-red-600 mt-1">{pincodeValidation.error}</p>
                      )}
                      {pincodeValidation?.isValid && checkCityStateMatch() && (
                        <p className="text-xs text-green-600 mt-1">✓ Address validated</p>
                      )}
                    </div>
                    <div className="relative">
                    <input
                        className={`input-field ${pincodeValidation && pincodeValidation.isValid && checkCityStateMatch() ? 'border-green-500' : pincodeValidation && !checkCityStateMatch() ? 'border-red-500' : ''}`}
                      placeholder="City"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        disabled={validatingPincode}
                    />
                      {pincodeValidation && pincodeValidation.isValid && !checkCityStateMatch() && (
                        <p className="text-xs text-red-600 mt-1">City doesn't match pincode</p>
                      )}
                    </div>
                    <div className="relative">
                    <input
                        className={`input-field ${pincodeValidation && pincodeValidation.isValid && checkCityStateMatch() ? 'border-green-500' : pincodeValidation && !checkCityStateMatch() ? 'border-red-500' : ''}`}
                      placeholder="State"
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                        disabled={validatingPincode}
                      />
                      {pincodeValidation && pincodeValidation.isValid && !checkCityStateMatch() && (
                        <p className="text-xs text-red-600 mt-1">State doesn't match pincode</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="w-full btn-secondary"
                  >
                    Save Address
                  </button>
                </div>

                <div className="space-y-4 mb-6 bg-gradient-to-br from-gray-50/30 to-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-semibold text-dark-900">₹{getSubtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Shipping</span>
                    {getShippingCost() > 0 ? (
                      <span className="font-semibold text-dark-900">₹{getShippingCost().toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="font-semibold text-green-600">Free</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Tax (3%)</span>
                    <span className="font-semibold text-dark-900">₹{getTaxAmount().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-dark-900">Total</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">
                        ₹{getTotalWithTax().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

        <RazorpayPaymentGateway
          customer={customer}
          onSuccess={() => {
            toast.success('Payment successful! Order placed.')
            router.push('/orders')
          }}
          onError={() => {
            toast.error('Payment failed. Please try again.')
          }}
        />

                {!isCustomerValid() && (
                  <p className="text-xs text-red-600 mt-2">Please fill all required delivery details before paying.</p>
                )}

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
