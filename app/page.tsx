'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [goldPrice, setGoldPrice] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/gold-price').then(async (r) => {
      const d = await r.json()
      setGoldPrice(d?.pricePerGram ?? null)
    }).catch(() => {})
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {goldPrice != null && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-medium">Today's Gold Price</p>
                      <p className="text-white text-2xl font-bold">₹{goldPrice.toLocaleString('en-IN')} <span className="text-lg font-normal">per gram</span></p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                  <div className="hidden sm:block text-white/90 text-sm">
                    <p className="font-semibold">Live Price</p>
                    <p className="text-xs mt-1">Updated daily</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-gray-900 leading-tight"
                >
                  Timeless
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-700">
                    Elegance
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-lg sm:text-xl text-gray-600 max-w-lg"
                >
                  Discover our exquisite collection of handcrafted jewelry that celebrates life's most precious moments.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/collections"
                  className="btn-primary inline-flex items-center justify-center space-x-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="relative w-full h-96 bg-gradient-to-br from-gold-50 via-gold-100 to-gold-50 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-gold-200">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent)]"></div>
                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-xl animate-pulse-glow">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-8 right-8 w-20 h-20 bg-gold-400/30 rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-8 left-8 w-16 h-16 bg-gold-300/40 rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-200/20 rounded-full blur-3xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Why Choose Hars Jewellery?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine traditional craftsmanship with modern design to create pieces that last a lifetime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Handcrafted Excellence',
                description: 'Each piece is meticulously crafted by skilled artisans using traditional techniques.'
              },
              {
                icon: Shield,
                title: 'Authentic Quality',
                description: 'We guarantee the authenticity and quality of every piece in our collection.'
              },
              {
                icon: Truck,
                title: 'Secure Delivery',
                description: 'Your precious jewelry is delivered safely with insurance and tracking.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card text-center p-8 hover:scale-105"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:rotate-6 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular pieces, loved by customers worldwide.
            </p>
          </motion.div>

          <ProductGrid limit={6} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
