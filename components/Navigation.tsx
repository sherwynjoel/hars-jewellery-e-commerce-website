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
    <nav className="fixed top-4 left-4 right-4 z-50" style={{ pointerEvents: 'auto' }}>
      <div className="max-w-7xl mx-auto">
        {/* Liquid Glass Background with Gradient Overlay */}
        <div className="bg-gradient-to-b from-white/40 via-white/30 to-white/20 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 rounded-xl shadow-lg">
          {/* Animated gradient overlay for liquid effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay rounded-xl" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />
          
          {/* Content */}
          <div className="relative px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-1 ring-gray-200 bg-white flex-shrink-0">
              <Image src="/hars%20logo.jpg" alt="Hars Jewellery" width={40} height={40} priority />
            </div>
            <div className="font-serif text-sm sm:text-xl lg:text-2xl font-bold text-dark-900 truncate max-w-[120px] sm:max-w-none">
              Hars Jewellery
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-dark-900 hover:text-black font-medium transition-all duration-300 text-sm lg:text-base px-3 py-1.5 rounded-lg hover:bg-white/20 backdrop-blur-sm"
              >
                {item.name}
                <motion.span 
                  className="absolute -bottom-1 left-1/2 h-0.5 bg-black rounded-full"
                  initial={{ width: 0, x: '-50%' }}
                  whileHover={{ width: '80%', x: '-50%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-1.5 sm:p-2 text-dark-900 hover:text-black transition-all duration-300 flex-shrink-0 rounded-lg hover:bg-white/20 backdrop-blur-sm touch-manipulation">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {/* Render a stable badge element to prevent hydration mismatch */}
              <motion.span
                className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-black text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium backdrop-blur-sm ${
                  mounted && getTotalItems() > 0 ? 'scale-100' : 'scale-0'
                }`}
                aria-hidden={!mounted || getTotalItems() === 0}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {mounted ? getTotalItems() : 0}
              </motion.span>
            </Link>

            {/* User Menu - Desktop Only */}
            {session ? (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                {session.user.role === 'ADMIN' && session.user.email?.toLowerCase().trim() === 'harsjewellery2005@gmail.com' && (
                  <Link
                    href="/admin"
                    className="p-2 text-dark-900 hover:text-black transition-all duration-300 rounded-lg hover:bg-white/20 backdrop-blur-sm"
                    title="Admin Panel"
                  >
                    <Crown className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="p-2 text-dark-900 hover:text-black transition-all duration-300 rounded-lg hover:bg-white/30 backdrop-blur-sm"
                >
                  <User className="w-5 h-5" />
                </Link>
                <Link
                  href="/orders"
                  className="text-sm text-dark-700 hover:text-dark-800 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={async () => {
                    // Clear admin verification before signing out
                    if (session?.user?.role === 'ADMIN') {
                      try {
                        await fetch('/api/auth/clear-admin-verification', {
                          method: 'POST',
                          credentials: 'include'
                        })
                      } catch (error) {
                        console.error('Error clearing admin verification:', error)
                        // Continue with sign out even if this fails
                      }
                    }
                    signOut()
                  }}
                  className="text-sm text-dark-700 hover:text-dark-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm lg:text-base text-dark-900 hover:text-black font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm lg:text-base px-4 lg:px-8 py-2 lg:py-3.5 backdrop-blur-sm bg-black/90 hover:bg-black border border-white/10"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="md:hidden p-1.5 sm:p-2 text-dark-900 hover:text-black transition-all duration-300 flex-shrink-0 rounded-lg hover:bg-white/20 backdrop-blur-sm touch-manipulation"
              aria-label="Toggle menu"
              type="button"
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
              className="md:hidden border-t border-white/10 bg-white/40 backdrop-blur-xl backdrop-saturate-150 rounded-b-xl relative z-50"
            >
              <div className="py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-dark-900 hover:text-black hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
                {session ? (
                  <>
                    {session.user.role === 'ADMIN' && session.user.email?.toLowerCase().trim() === 'harsjewellery2005@gmail.com' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-dark-900 hover:text-black hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsMenuOpen(false)
                        }}
                      >
                        <Crown className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-dark-900 hover:text-black hover:bg-white/40 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 text-dark-900 hover:text-black hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsMenuOpen(false)
                        
                        // Clear admin verification before signing out
                        if (session?.user?.role === 'ADMIN') {
                          try {
                            await fetch('/api/auth/clear-admin-verification', {
                              method: 'POST',
                              credentials: 'include'
                            })
                          } catch (error) {
                            console.error('Error clearing admin verification:', error)
                            // Continue with sign out even if this fails
                          }
                        }
                        
                        signOut()
                      }}
                      className="w-full text-left px-4 py-3 text-dark-900 hover:text-black hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                      type="button"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-3 text-dark-900 hover:text-black hover:bg-white/25 backdrop-blur-sm rounded-lg transition-all duration-300 text-base font-medium touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-3 bg-black/90 text-white hover:bg-black backdrop-blur-sm border border-white/10 rounded-lg transition-all duration-300 text-base font-medium text-center touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}
