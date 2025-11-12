'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Mail, Phone, Calendar, Crown, User, ShoppingBag, Search } from 'lucide-react'
import Navigation from '@/components/Navigation'
import toast from 'react-hot-toast'

interface UserAccount {
  id: string
  name: string | null
  email: string
  mobile: string | null
  role: string
  emailVerifiedAt: Date | null
  createdAt: Date
  _count: {
    orders: number
    cart: number  // Changed from cartItems to cart
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 401) {
          toast.error('Please sign in to view users')
          router.push('/auth/signin')
          return
        }
        if (res.status === 403) {
          toast.error('Admin access required')
          router.push('/')
          return
        }
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      
      const data = await res.json()
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error(error.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.mobile?.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    )
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">User Accounts</h1>
              <p className="text-gray-600">View and manage all registered users</p>
            </div>
            <div className="text-sm text-gray-500">
              Total Users: <span className="font-bold text-gray-900">{users.length}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, mobile, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.mobile ? (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {user.mobile}
                              </div>
                            ) : (
                              <span className="text-gray-400">No mobile</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'ADMIN' && <Crown className="w-3 h-3 mr-1" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="w-4 h-4" />
                              {user._count.orders} orders
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">•</span>
                              {user._count.cart} cart items
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.emailVerifiedAt ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unverified
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.name || 'No name'}
                          </h3>
                          {user.role === 'ADMIN' && (
                            <Crown className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.mobile && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4" />
                            {user.mobile}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Role</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        {user.emailVerifiedAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Orders</div>
                        <div className="text-sm font-medium text-gray-900">
                          {user._count.orders}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Joined</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

