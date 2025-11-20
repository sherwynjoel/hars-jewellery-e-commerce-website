'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Crown, Package, Users, DollarSign, Loader2, Power, PowerOff, Database, Phone, AlertTriangle } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ProductForm from '@/components/ProductForm'
import SlideshowManager from '@/components/SlideshowManager'
import VideoCarouselManager from '@/components/VideoCarouselManager'
import TestimonialsManager from '@/components/TestimonialsManager'
import EditorialShowcaseManager from '@/components/EditorialShowcaseManager'
import { useAdminInactivity } from '@/lib/hooks/useAdminInactivity'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
  stockCount: number
  createdAt: string
}

interface Subscriber {
  id: string
  phone: string
  createdAt: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [goldPrice, setGoldPrice] = useState<string>('')
  const [savingGold, setSavingGold] = useState(false)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [checkingVerification, setCheckingVerification] = useState(true)
  const [serviceStatus, setServiceStatus] = useState<{ isStopped: boolean; message: string } | null>(null)
  const [togglingService, setTogglingService] = useState(false)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  
  // Admin inactivity tracking
  const { shouldShowWarning, remainingMinutes, remainingSeconds, resetTimer } = useAdminInactivity()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    
    // Check if email matches the allowed admin email
    const allowedEmail = 'harsjewellery2005@gmail.com'
    if (session.user.email?.toLowerCase().trim() !== allowedEmail.toLowerCase().trim()) {
      toast.error('Access denied - Admin access restricted to authorized email only')
      router.push('/')
      return
    }

    // Check admin panel verification status
    checkVerificationStatus()
  }, [session, status, router])

  const checkVerificationStatus = async () => {
    setCheckingVerification(true)
    try {
      const response = await fetch('/api/admin/request-access', {
        method: 'GET'
      })
      const data = await response.json()
      
      if (!data.verified) {
        // Redirect to verification page
        router.push('/admin/verify-access')
        return
      }
      
      // If verified, fetch products and service status
      setCheckingVerification(false)
      fetchProducts()
      fetchServiceStatus()
      fetchSubscribers()
    } catch (error) {
      console.error('Error checking verification:', error)
      // If check fails, redirect to verification page
      router.push('/admin/verify-access')
    }
  }

  const fetchSubscribers = async () => {
    try {
      setLoadingSubscribers(true)
      const response = await fetch('/api/subscribers')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setSubscribers(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscriber numbers:', error)
    } finally {
      setLoadingSubscribers(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/gold-price').then(r => r.json()).then(d => {
      if (d?.pricePerGram) setGoldPrice(String(d.pricePerGram))
    }).catch(() => {})
    
    // Fetch total users count
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(users => {
        if (Array.isArray(users)) {
          setTotalUsers(users.length)
        }
      })
      .catch(() => {})
  }, [])

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('/api/admin/service-status')
      const data = await response.json()
      setServiceStatus(data)
    } catch (error) {
      console.error('Error fetching service status:', error)
    }
  }

  const toggleServiceStatus = async () => {
    if (!serviceStatus) return
    
    setTogglingService(true)
    try {
      const response = await fetch('/api/admin/service-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isStopped: !serviceStatus.isStopped,
          message: serviceStatus.message || 'Our services are stopped today. Please check after 12 hours.'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setServiceStatus(data.status)
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Failed to update service status')
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
      toast.error('Failed to update service status')
    } finally {
      setTogglingService(false)
    }
  }

  const saveGoldPrice = async () => {
    if (!goldPrice) return
    setSavingGold(true)
    try {
      const res = await fetch('/api/admin/gold-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerGram: parseFloat(goldPrice) })
      })
      const data = await res.json()
      if (data.success) {
        if (data.repriced && data.updatedCount > 0) {
          toast.success(`Gold price updated! Repriced ${data.updatedCount} product(s).`)
          fetchProducts() // Refresh product list to show new prices
        } else if (data.message) {
          toast.success(data.message)
        } else {
          toast.success('Gold price updated')
        }
      } else {
        toast.error(data.error || data.warning || 'Failed to update')
        if (data.details) {
          console.error('Gold price update details:', data.details)
        }
      }
    } catch (error) {
      toast.error('Failed to update gold price')
    } finally {
      setSavingGold(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleFormSubmit = () => {
    fetchProducts()
    handleFormClose()
  }

  const formatPhoneNumber = (value: string) =>
    value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Inactivity Warning Banner */}
      <AnimatePresence>
        {shouldShowWarning && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Session Timeout Warning</p>
                  <p className="text-sm text-yellow-100">
                    You will be automatically logged out in {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''} due to inactivity.
                    Move your mouse or click anywhere to stay logged in.
                  </p>
                </div>
              </div>
              <button
                onClick={resetTimer}
                className="px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
              >
                Stay Logged In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`pt-20 sm:pt-24 ${shouldShowWarning ? 'pt-32 sm:pt-36' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-dark-900">
                    Admin Panel
                  </h1>
                  {/* Countdown Timer */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    shouldShowWarning 
                      ? 'bg-yellow-100 border-yellow-400' 
                      : 'bg-gray-100 border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      shouldShowWarning ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-xs sm:text-sm font-mono font-semibold ${
                      shouldShowWarning ? 'text-yellow-800' : 'text-gray-700'
                    }`}>
                      {remainingMinutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-xs hidden sm:inline ${
                      shouldShowWarning ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      left
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage your jewelry collection and inventory
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="btn-primary inline-flex items-center justify-center space-x-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </motion.button>
                
                <Link
                  href="/admin/orders"
                  className="btn-secondary inline-flex items-center justify-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  Manage Orders
                </Link>
                
                <Link
                  href="/admin/users"
                  className="btn-secondary inline-flex items-center justify-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">View Users</span>
                  <span className="sm:hidden">Users</span>
                </Link>

                <Link
                  href="/admin/database"
                  className="btn-secondary inline-flex items-center justify-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline-flex flex-col items-center">
                    <span>View</span>
                    <span>Database</span>
                  </span>
                  <span className="sm:hidden">DB</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Service Status Control */}
          {serviceStatus && (
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className={`rounded-lg p-5 shadow-md ${
                  serviceStatus.isStopped 
                    ? 'bg-red-900 border-2 border-red-700' 
                    : 'bg-green-900 border-2 border-green-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      {serviceStatus.isStopped ? (
                        <>
                          <PowerOff className="w-5 h-5" />
                          Services Stopped
                        </>
                      ) : (
                        <>
                          <Power className="w-5 h-5" />
                          Services Running
                        </>
                      )}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {serviceStatus.isStopped 
                        ? 'Users cannot place orders. Products are still visible.' 
                        : 'All services are operational. Users can place orders.'}
                    </p>
                  </div>
                  <button
                    onClick={toggleServiceStatus}
                    disabled={togglingService}
                    className={`font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                      serviceStatus.isStopped
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {togglingService ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : serviceStatus.isStopped ? (
                      <>
                        <Power className="w-4 h-4" />
                        Resume Services
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Stop Services
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Gold Price */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-5 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Gold Price per Gram</h3>
                  <p className="text-gray-300 text-sm">Update current gold rate</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    className="w-32 sm:w-40 px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <button
                    onClick={saveGoldPrice}
                    disabled={savingGold}
                    className="bg-white text-gray-900 font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingGold ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.inStock).length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{products.filter(p => !p.inStock).length}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{products.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {totalUsers}
                  </p>
                  <p className="text-xs text-purple-600 mt-1 font-medium">View All →</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border border-purple-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      View Users
                    </h4>
                    <p className="text-sm text-gray-500">Manage user accounts</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/orders"
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Manage Orders
                    </h4>
                    <p className="text-sm text-gray-500">View and update orders</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-green-300 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      Add Product
                    </h4>
                    <p className="text-sm text-gray-500">Create new product</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Interested Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-700" />
                  Interested Customers
                </h3>
                <p className="text-sm text-gray-500">
                  Phone numbers collected from the homepage subscription form
                </p>
              </div>
              <button
                onClick={fetchSubscribers}
                disabled={loadingSubscribers}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSubscribers ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {subscribers.length === 0 ? (
              <p className="text-sm text-gray-500 mt-6">
                No numbers saved yet. As soon as customers submit their phone numbers,
                they&apos;ll appear here.
              </p>
            ) : (
              <div className="mt-6 max-h-64 overflow-y-auto divide-y divide-gray-100">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="py-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900 font-mono tracking-wide">
                      {formatPhoneNumber(subscriber.phone)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(subscriber.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Slideshow Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="card-elevated p-6 mb-8"
          >
            <SlideshowManager />
          </motion.div>

          {/* Video Carousel Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="card-elevated p-6 mb-8"
          >
            <VideoCarouselManager />
          </motion.div>

          {/* Editorial Showcase Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38 }}
            className="card-elevated p-6 mb-8"
          >
            <EditorialShowcaseManager />
          </motion.div>

          {/* Testimonials Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card-elevated p-6 mb-8"
          >
            <TestimonialsManager />
          </motion.div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card-elevated overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-dark-900">Products</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                          src={product.image || '/placeholder-jewelry.jpg'}
                          alt={product.name}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-dark-900 mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                              {product.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-dark-900">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-gray-500">Stock: {product.stockCount}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 text-black hover:bg-gray-50 rounded-lg transition-colors"
                                aria-label="Edit product"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Delete product"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.image || '/placeholder-jewelry.jpg'}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-dark-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                            {product.category}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                            {product.stockCount}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 text-black hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                aria-label="Edit product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}
