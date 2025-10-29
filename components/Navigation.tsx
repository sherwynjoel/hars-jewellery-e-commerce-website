'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Menu, X, Crown, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { getTotalItems, getTotalWithTax } = useCartStore()
  // Avoid hydration mismatch by rendering cart count only after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/collections' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-200 bg-white">
              <Image src="/logo%20hars.png" alt="Hars Jewellery" width={40} height={40} priority />
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Hars Jewellery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gold-600 font-medium transition-colors duration-200 text-sm lg:text-base"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-gold-600 transition-colors">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {/* Render a stable badge element to prevent hydration mismatch */}
              <span
                className={`absolute -top-1 -right-1 bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium transition-transform duration-150 ${
                  mounted && getTotalItems() > 0 ? 'scale-100' : 'scale-0'
                }`}
                aria-hidden={!mounted || getTotalItems() === 0}
              >
                {mounted ? getTotalItems() : 0}
              </span>
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="flex items-center space-x-2">
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="p-2 text-gray-700 hover:text-gold-600 transition-colors"
                    title="Admin Panel"
                  >
                    <Crown className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="p-2 text-gray-700 hover:text-gold-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
                <Link
                  href="/orders"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-gold-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gold-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:text-gold-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {session && (
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-gray-700 hover:text-gold-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
