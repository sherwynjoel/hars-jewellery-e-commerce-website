'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Calendar, DollarSign, Eye, ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
  trackingNumber?: string | null
  trackingCarrier?: string | null
  trackingUrl?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-gray-100 text-gray-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'Order Placed'
      default:
        return status
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-dark-900">
                  Your Orders
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Track your jewelry orders and their status
                </p>
              </div>
            </div>
          </motion.div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link
                href="/collections"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Start Shopping</span>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-dark-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center text-lg font-bold text-black">
                          <span className="text-lg mr-1">₹</span>
                          {order.total.toLocaleString('en-IN')}
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <button
                          onClick={() => setOpenInvoiceId(prev => (prev === order.id ? null : order.id))}
                          className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700"
                        >
                          <FileText className="w-4 h-4" /> {openInvoiceId === order.id ? 'Hide invoice' : 'View invoice'}
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-dark-900">Items:</h4>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <img
                              className="w-12 h-12 rounded-lg object-cover"
                              src={item.product.image || '/placeholder-jewelry.jpg'}
                              alt={item.product.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-dark-900 truncate">
                              {item.product.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-dark-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}

                      

                      {/* Invoice */}
                      {openInvoiceId === order.id && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">Invoice</h4>
                            <button
                              onClick={() => {
                                const printContents = document.getElementById(`invoice-${order.id}`)?.innerHTML || ''
                                const win = window.open('', '', 'width=800,height=900')
                                if (!win) return
                                win.document.open()
                                win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>
                                  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;color:#111827}
                                  h2{font-size:20px;margin:0 0 8px}
                                  .muted{color:#6B7280}
                                  table{width:100%;border-collapse:collapse;margin-top:12px}
                                  th,td{font-size:14px;text-align:left;padding:8px;border-bottom:1px solid #E5E7EB}
                                  .right{text-align:right}
                                </style></head><body>${printContents}</body></html>`)
                                win.document.close()
                                win.focus()
                                win.print()
                              }}
                              className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700"
                            >
                              <Download className="w-4 h-4" /> Download PDF
                            </button>
                          </div>
                          <div id={`invoice-${order.id}`}>
                            <div className="mb-3">
                              <h2 className="text-base font-semibold text-dark-900">Hars Jewellery</h2>
                              <div className="text-xs text-gray-600">Invoice for Order #{order.id.slice(-8).toUpperCase()}</div>
                              <div className="text-xs text-gray-600">Date: {new Date(order.createdAt).toLocaleString('en-IN')}</div>
                            </div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th className="right">Qty</th>
                                  <th className="right">Price</th>
                                  <th className="right">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={`inv-${item.id}`}>
                                    <td>{item.product.name}</td>
                                    <td className="right">{item.quantity}</td>
                                    <td className="right">₹{item.price.toLocaleString('en-IN')}</td>
                                    <td className="right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} className="right"><strong>Total</strong></td>
                                  <td className="right"><strong>₹{order.total.toLocaleString('en-IN')}</strong></td>
                                </tr>
                                <tr>
                                  <td colSpan={4} className="muted">Thank you for your purchase!</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}

                        {/* Shipment Info */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Shipment</h4>
                          {order.trackingNumber ? (
                            <div className="text-sm text-gray-700 space-y-1">
                              <div>
                                <span className="font-medium">Status: </span>
                                {order.status === 'SHIPPED' && 'Shipped'}
                                {order.status === 'DELIVERED' && 'Delivered'}
                                {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && 'Preparing' }
                              </div>
                              <div>
                                <span className="font-medium">Carrier: </span>
                                {order.trackingCarrier || '—'}
                              </div>
                              <div>
                                <span className="font-medium">Tracking No: </span>
                                {order.trackingNumber}
                              </div>
                              {order.trackingUrl && (
                                <div>
                                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-black hover:text-gray-700">Track shipment</a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Shipment details will appear here once available.</div>
                          )}
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
