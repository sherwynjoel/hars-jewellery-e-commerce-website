'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Crown, Package, Users, DollarSign } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ProductForm from '@/components/ProductForm'
import DeployButton from '@/components/DeployButton'
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

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [goldPrice, setGoldPrice] = useState<string>('')
  const [savingGold, setSavingGold] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchProducts()
  }, [session, status, router])

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
  }, [])

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
                  Admin Panel
                </h1>
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

                <DeployButton />
              </div>
            </div>
          </motion.div>

          {/* Gold Price and Stats */}
          <div className="grid gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 shadow-xl border border-gold-400"
            >
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="relative p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-3xl">💎</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Today's Gold Price</h2>
                      <p className="text-white/90 text-sm">Set price per gram (₹)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="e.g., 6500"
                      className="w-40 px-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 font-semibold"
                    />
                    <motion.button
                      onClick={saveGoldPrice}
                      disabled={savingGold}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-gold-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingGold ? 'Saving...' : 'Save'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            {[
              { title: 'Total Products', value: products.length, icon: Package, color: 'blue', bgGradient: 'from-blue-400 to-blue-500' },
              { title: 'In Stock', value: products.filter(p => p.inStock).length, icon: Eye, color: 'green', bgGradient: 'from-green-400 to-green-500' },
              { title: 'Out of Stock', value: products.filter(p => !p.inStock).length, icon: Trash2, color: 'red', bgGradient: 'from-red-400 to-red-500' },
              { title: 'Total Value', value: `₹${products.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'gold', bgGradient: 'from-gold-400 to-gold-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated p-6 hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient} shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card-elevated overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.image || '/placeholder-jewelry.jpg'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stockCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-gold-600 hover:text-gold-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
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
