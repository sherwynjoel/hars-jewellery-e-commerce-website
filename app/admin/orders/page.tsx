'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Shield, FileText, Download, AlertTriangle } from 'lucide-react'
import { useAdminInactivity } from '@/lib/hooks/useAdminInactivity'

interface AdminOrderItem {
  id: string
  quantity: number
  price: number
  product: { id: string; name: string; image: string; shippingCost?: number | null }
}

interface AdminOrder {
  id: string
  user: { id: string; email: string; name?: string }
  total: number
  status: string
  createdAt: string
  trackingNumber?: string | null
  trackingCarrier?: string | null
  trackingUrl?: string | null
  items: AdminOrderItem[]
  // Delivery/contact details
  customerName?: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string | null
  city?: string
  state?: string
  postalCode?: string
  // Address verification
  addressVerified?: boolean
  addressVerifiedAt?: string | null
  addressVerifiedBy?: string | null
  addressVerificationMethod?: string | null
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

const buildInvoiceSummary = (order: AdminOrder) => {
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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('PROCESSING')
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null)
  
  // Admin inactivity tracking
  const { shouldShowWarning, remainingMinutes, remainingSeconds } = useAdminInactivity()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchOrders()
  }, [session, status, filterStatus])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?${filterStatus ? `status=${filterStatus}` : ''}`)
      const data = await res.json()
      setOrders(data)
    } catch (e) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateShipment = async (orderId: string, payload: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success('Order updated')
        fetchOrders()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Update failed')
      }
    } catch {
      toast.error('Update failed')
    }
  }

  const toggleAddressVerification = async (orderId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressVerified: !currentStatus,
          addressVerificationMethod: 'ADMIN'
        })
      })
      if (res.ok) {
        toast.success(currentStatus ? 'Address marked as unverified' : 'Address verified successfully')
        fetchOrders()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update verification status')
      }
    } catch {
      toast.error('Failed to update verification status')
    }
  }

  if (status === 'loading') return null
  if (!session || session.user.role !== 'ADMIN') return null

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
                    For security, the admin session expires every 30 minutes. You will be logged out in{' '}
                    {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}. Please save your work and sign in again if needed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`pt-20 sm:pt-24 ${shouldShowWarning ? 'pt-32 sm:pt-36' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-bold">Orders Management</h1>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm shadow-sm"
            >
              <option value="">All</option>
              <option value="PROCESSING">Order Placed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-600">No orders found</div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                      <div className="text-sm text-gray-700 mt-1">Customer: {order.customerName || order.user?.name || order.user?.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">₹{order.total.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-600 mb-2">{order.status}</div>
                      <button
                        onClick={() => setOpenInvoiceId(prev => (prev === order.id ? null : order.id))}
                        className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> {openInvoiceId === order.id ? 'Hide Invoice' : 'View Invoice'}
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  {(order.addressLine1 || order.city || order.state || order.phone || order.email) && (
                    <div className={`mb-4 p-4 rounded-lg border-2 ${
                      order.addressVerified 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <span>📍</span> Delivery Address & Contact
                        </h3>
                        <button
                          onClick={() => toggleAddressVerification(order.id, order.addressVerified || false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            order.addressVerified
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          {order.addressVerified ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Verify Address
                            </>
                          )}
                        </button>
                      </div>
                      {order.addressVerified && (
                        <div className="mb-2 text-xs text-green-700 flex flex-col gap-1">
                          {order.addressVerifiedAt && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Verified on {new Date(order.addressVerifiedAt).toLocaleString()}
                            </div>
                          )}
                          {order.addressVerificationMethod && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {order.addressVerificationMethod === 'AUTO_PINCODE'
                                ? 'Automatically verified via pincode lookup'
                                : `Method: ${order.addressVerificationMethod}`}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-gray-700 space-y-1.5">
                        {order.customerName && (
                          <div><strong className="text-gray-900">Name:</strong> {order.customerName}</div>
                        )}
                        {order.phone && (
                          <div><strong className="text-gray-900">Phone:</strong> {order.phone}</div>
                        )}
                        {order.email && (
                          <div><strong className="text-gray-900">Email:</strong> {order.email}</div>
                        )}
                        {(order.addressLine1 || order.addressLine2 || order.city || order.state || order.postalCode) && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <strong className="text-gray-900">Address:</strong>
                            <div className="mt-1 pl-4">
                              {order.addressLine1 && <div>{order.addressLine1}</div>}
                              {order.addressLine2 && <div>{order.addressLine2}</div>}
                              {[order.city, order.state, order.postalCode].filter(Boolean).length > 0 && (
                                <div>{[order.city, order.state, order.postalCode].filter(Boolean).join(', ')}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={item.product.image || '/placeholder-jewelry.jpg'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice */}
                  {openInvoiceId === order.id && (
                    <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
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
                            className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700 mt-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
                            <p className="text-gray-500">{order.addressLine1 || ''}</p>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input
                        placeholder="Tracking Number"
                        defaultValue={order.trackingNumber ?? ''}
                        onBlur={(e) => updateShipment(order.id, { trackingNumber: e.target.value })}
                        className="input-field"
                      />
                      <input
                        placeholder="Carrier (e.g., Delhivery, Bluedart)"
                        defaultValue={order.trackingCarrier ?? ''}
                        onBlur={(e) => updateShipment(order.id, { trackingCarrier: e.target.value })}
                        className="input-field"
                      />
                      <input
                        placeholder="Tracking URL"
                        defaultValue={order.trackingUrl ?? ''}
                        onBlur={(e) => updateShipment(order.id, { trackingUrl: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <select
                        defaultValue={order.status}
                        onChange={(e) => updateShipment(order.id, { status: e.target.value })}
                        className="input-field"
                      >
                        <option value="PROCESSING">Order Placed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <div className="text-xs text-gray-500">Changes save automatically when you leave a field.</div>
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


