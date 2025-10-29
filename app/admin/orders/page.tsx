'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

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

  if (status === 'loading') return null
  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16">
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
                      <div className="text-sm text-gray-700 mt-1">Customer: {order.user?.name || order.user?.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gold-600">₹{order.total.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-600">{order.status}</div>
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


