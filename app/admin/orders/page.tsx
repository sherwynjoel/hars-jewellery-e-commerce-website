'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Shield } from 'lucide-react'

interface AdminOrderItem {
  id: string
  quantity: number
  price: number
  product: { id: string; name: string; image: string }
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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('PROCESSING')

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
      <div className="pt-20 sm:pt-24">
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
                      <div className="text-xs text-gray-600">{order.status}</div>
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
                      {order.addressVerified && order.addressVerifiedAt && (
                        <div className="mb-2 text-xs text-green-700 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Verified on {new Date(order.addressVerifiedAt).toLocaleString()}
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


