'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import { Database, Users, Package, ShoppingBag, Image, Video, Activity, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface TableData {
  tableName: string
  count: number
  data: any[]
}

export default function DatabaseViewerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [checkingVerification, setCheckingVerification] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    
    const allowedEmail = 'harsjewellery2005@gmail.com'
    if (session.user.email?.toLowerCase().trim() !== allowedEmail.toLowerCase().trim()) {
      toast.error('Access denied - Admin access restricted to authorized email only')
      router.push('/')
      return
    }

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
        router.push('/admin/verify-access')
        return
      }
      
      setCheckingVerification(false)
      fetchDatabaseData()
    } catch (error) {
      console.error('Error checking verification:', error)
      router.push('/admin/verify-access')
    }
  }

  const fetchDatabaseData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database')
      const data = await response.json()
      
      if (response.ok) {
        setTables(data)
      } else {
        toast.error(data.error || 'Failed to fetch database data')
      }
    } catch (error) {
      console.error('Error fetching database data:', error)
      toast.error('Failed to fetch database data')
    } finally {
      setLoading(false)
    }
  }

  const getTableIcon = (tableName: string) => {
    switch (tableName.toLowerCase()) {
      case 'user':
        return <Users className="w-5 h-5" />
      case 'product':
        return <Package className="w-5 h-5" />
      case 'order':
        return <ShoppingBag className="w-5 h-5" />
      case 'slideshowimage':
        return <Image className="w-5 h-5" />
      case 'videocarouselitem':
        return <Video className="w-5 h-5" />
      case 'adminactivity':
        return <Activity className="w-5 h-5" />
      default:
        return <Database className="w-5 h-5" />
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (value instanceof Date) return new Date(value).toLocaleString()
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  if (status === 'loading' || checkingVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const selectedTableData = tables.find(t => t.tableName === selectedTable)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-dark-900 mb-2">
                Database Viewer
              </h1>
              <p className="text-gray-600">View and explore all database tables</p>
            </div>
            <button
              onClick={fetchDatabaseData}
              disabled={loading}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading database...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Tables List */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-4"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Tables</h2>
                  <div className="space-y-2">
                    {tables.map((table) => (
                      <button
                        key={table.tableName}
                        onClick={() => setSelectedTable(table.tableName)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                          selectedTable === table.tableName
                            ? 'bg-black text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getTableIcon(table.tableName)}
                          <span className="font-medium">{table.tableName}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedTable === table.tableName
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {table.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Table Data */}
              <div className="lg:col-span-3">
                {selectedTableData ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTableIcon(selectedTableData.tableName)}
                          <h2 className="text-2xl font-bold text-dark-900">
                            {selectedTableData.tableName}
                          </h2>
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedTableData.count} record{selectedTableData.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      {selectedTableData.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                          No records found in this table
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              {Object.keys(selectedTableData.data[0] || {}).map((key) => (
                                <th
                                  key={key}
                                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedTableData.data.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {Object.entries(row).map(([key, value]) => (
                                  <td
                                    key={key}
                                    className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                                    title={formatValue(value)}
                                  >
                                    <div className="truncate" title={formatValue(value)}>
                                      {formatValue(value)}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg p-12 text-center"
                  >
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a table from the left to view its data</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

