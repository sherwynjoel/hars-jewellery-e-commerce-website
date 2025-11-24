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
    shippingCost?: number | null
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
  customerName?: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string | null
  city?: string
  state?: string
  postalCode?: string
}

const COMPANY_INFO = {
  name: 'Hars Jewellery',
  address: '323 A3 Kumaran Ntr Complex 1st Floor, Raja Street, Coimbatore, Tamil Nadu - 641001, India',
  gst: '33AAGFH5102E1Z1',
  state: 'Tamil Nadu (Code: 33)',
  contact: '+91 98765 43210',
  email: 'harsjewellery2005@gmail.com',
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const buildInvoiceSummary = (order: Order) => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = order.items.reduce(
    (sum, item) => sum + ((item.product?.shippingCost || 0) * item.quantity),
    0
  )
  const tax = Math.round(subtotal * 0.03 * 100) / 100
  const makingCost = Math.max(0, Math.round((order.total - (subtotal + shippingCost + tax)) * 100) / 100)
  return {
    subtotal,
    shippingCost,
    tax,
    makingCost,
    total: order.total
  }
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
                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                <img src="/hars-logo.jpg" alt="Hars Jewellery Logo" className="w-full h-full object-contain p-1 bg-white" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.5em] text-gray-400">Invoice</p>
                                <h2 className="text-3xl font-serif font-bold text-dark-900">Hars Jewellery</h2>
                                <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                                  <div>{COMPANY_INFO.address}</div>
                                  <div>GSTIN/UIN: {COMPANY_INFO.gst}</div>
                                  <div>{COMPANY_INFO.state}</div>
                                  <div>{COMPANY_INFO.contact}</div>
                                  <div>{COMPANY_INFO.email}</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-2 md:text-right">
                              <div>
                                <span className="font-semibold text-gray-900 mr-2">Invoice ID:</span>
                                #{order.id.slice(-8).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 mr-2">Date:</span>
                                {new Date(order.createdAt).toLocaleString('en-IN')}
                              </div>
                              <button
                                onClick={() => {
                                  const printContents = document.getElementById(`invoice-${order.id}`)?.innerHTML || ''
                                  const win = window.open('', '', 'width=900,height=900')
                                  if (!win) return
                                  const baseUrl = window.location.origin
                                  const adjustedContents = printContents.replace(/src="\/(?!\/)/g, `src="${baseUrl}/`)
                                  win.document.open()
                                  win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>
                                    body{font-family:'Inter',ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:48px;color:#0f172a;background:#fff}
                                    h1,h2,h3,h4{margin:0}
                                    .invoice-card{max-width:720px;margin:0 auto;border:1px solid #e2e8f0;border-radius:24px;padding:40px}
                                    @page { margin: 32px }
                                    table{width:100%;border-collapse:collapse;margin-top:32px;font-size:14px}
                                    th{background:#111827;color:#fff;text-transform:uppercase;font-size:12px;letter-spacing:0.2em;padding:12px;text-align:left}
                                    td{padding:12px;border-bottom:1px solid #e2e8f0}
                                    .total{background:#111827;color:#fff;border-radius:12px;padding:12px 16px;font-weight:bold}
                                    .footer{margin-top:48px;font-size:13px;display:flex;justify-content:space-between;align-items:center}
                                  </style></head><body><div class="invoice-card">${adjustedContents}</div></body></html>`)
                                  win.document.close()
                                  win.focus()
                                  win.print()
                                }}
                                className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700"
                              >
                                <Download className="w-4 h-4" /> Download PDF
                              </button>
                            </div>
                          </div>
                          <div
                            id={`invoice-${order.id}`}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                              <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Invoice To</p>
                                <p className="text-lg font-semibold text-dark-900 mt-2">{order.customerName || 'Customer'}</p>
                                <p className="text-gray-600">{order.phone || ''}</p>
                                <p className="text-gray-500">{order.addressLine1}</p>
                                {order.addressLine2 && <p className="text-gray-500">{order.addressLine2}</p>}
                                <p className="text-gray-500">
                                  {[order.city, order.state, order.postalCode].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              <div className="text-sm text-gray-600 md:text-right">
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Billed By</p>
                                <p className="text-lg font-semibold text-dark-900 mt-2">Hars Jewellery</p>
                                <p>{COMPANY_INFO.email}</p>
                                <p>{COMPANY_INFO.contact}</p>
                                <p>Coimbatore, Tamil Nadu</p>
                              </div>
                            </div>
                            <div className="overflow-x-auto rounded-2xl border border-gray-200">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="bg-black text-white">
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.35em] uppercase whitespace-nowrap">Product</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.35em] uppercase whitespace-nowrap">Price</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.35em] uppercase whitespace-nowrap">Qty</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.35em] uppercase whitespace-nowrap">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item) => (
                                    <tr key={`inv-${item.id}`} className="border-b border-gray-200">
                                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 text-xs sm:text-sm">{item.product.name}</td>
                                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-gray-600 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(item.price)}</td>
                                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-gray-600 text-xs sm:text-sm whitespace-nowrap">{item.quantity}</td>
                                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                                        {formatCurrency(item.price * item.quantity)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {(() => {
                              const summary = buildInvoiceSummary(order)
                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                  <div className="space-y-2 text-gray-600">
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Payment Method</p>
                                    <p>Online Payment</p>
                                    <p>Invoice ID: #{order.id.slice(-8).toUpperCase()}</p>
                                    <p>Date: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                                    <div className="flex justify-between">
                                      <span>Sub-total</span>
                                      <span>{formatCurrency(summary.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Making Cost</span>
                                      <span>{formatCurrency(summary.makingCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Shipping Cost</span>
                                      <span>{formatCurrency(summary.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tax (3%)</span>
                                      <span>{formatCurrency(summary.tax)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-lg font-semibold text-gray-900">Total</span>
                                      <span className="text-lg font-bold text-gray-900">
                                        {formatCurrency(summary.total)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}
                            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
                              <p>Thank you for your purchase!</p>
                              <p className="font-semibold text-gray-700">Hars Jewellery</p>
                            </div>
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
