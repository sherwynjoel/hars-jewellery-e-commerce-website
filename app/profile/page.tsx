'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Crown, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="p-2 text-gray-600 hover:text-purple-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-dark-900">
                  My Profile
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage your account information
                </p>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card-elevated p-6 sm:p-8 mb-6"
          >
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-dark-900">
                    {session.user.name || 'User'}
                  </h2>
                  {session.user.role === 'ADMIN' && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      <Crown className="w-4 h-4" />
                      Admin
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{session.user.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Member since {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
          >
            <Link
              href="/orders"
              className="card-elevated p-6 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-dark-900 mb-2">My Orders</h3>
                  <p className="text-sm text-gray-600">View your order history</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
            </Link>

            {session.user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="card-elevated p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-dark-900 mb-2">Admin Panel</h3>
                    <p className="text-sm text-gray-600">Manage products & orders</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Link>
            )}
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="card-elevated p-6 sm:p-8"
          >
            <h3 className="text-2xl font-bold text-dark-900 mb-6">Account Information</h3>
            <div className="space-y-5">
              <div className="pb-4 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Name</label>
                <p className="text-lg font-semibold text-dark-900">{session.user.name || 'Not set'}</p>
              </div>
              <div className="pb-4 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Email</label>
                <p className="text-lg font-semibold text-dark-900">{session.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Role</label>
                <p className="text-lg font-semibold text-dark-900 capitalize">{session.user.role?.toLowerCase() || 'User'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

