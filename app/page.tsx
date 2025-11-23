'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'
import HeroSlideshow from '@/components/HeroSlideshow'
import VideoCarousel from '@/components/VideoCarousel'
import Testimonials from '@/components/Testimonials'
import EditorialShowcase from '@/components/EditorialShowcase'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [goldPrice, setGoldPrice] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/gold-price').then(async (r) => {
      const d = await r.json()
      setGoldPrice(d?.pricePerGram ?? null)
    }).catch(() => {})
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100/20">
        <div className="max-w-7xl mx-auto">
          {mounted && goldPrice != null && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 relative z-10"
            >
              <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl border border-gray-400/20">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <div className="relative px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/30 overflow-hidden">
                      <Image 
                        src="/9ec02e5d7986f2a6ff4f4afcb7358cb3.jpg" 
                        alt="Gold Medallion" 
                        width={56} 
                        height={56} 
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-medium mb-1">Today's Gold Price</p>
                      <p className="text-white text-3xl sm:text-4xl font-bold">₹{goldPrice.toLocaleString('en-IN')} <span className="text-xl sm:text-2xl font-normal">per gram</span></p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-16 bg-white/30"></div>
                  <div className="hidden sm:block text-white/90 text-sm bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20">
                    <p className="font-bold text-white">Live Price</p>
                    <p className="text-xs mt-1 text-white/80">Updated daily</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-dark-900 leading-[1.1]">
                  <span className="block w-full">Timeless</span>
                  <span className="block w-full text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">
                    Elegance
                  </span>
                </h1>
                
                <p className="text-base sm:text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                  Discover our exquisite collection of handcrafted jewelry that celebrates life's most precious moments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/collections"
                  className="btn-primary inline-flex items-center justify-center space-x-3 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-dark-900 mb-4">
              Why Choose Hars Jewellery?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by families for generations. We bring you authentic jewelry with genuine quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Expert Craftsmanship
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our jewelry is made by experienced craftsmen who have been in the trade for generations.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quality Assured
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Every piece comes with a certificate of authenticity and quality guarantee.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Safe Shipping
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We pack everything carefully and provide full insurance coverage for your order.
                  </p>
                </div>
              </div>
            </div>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-dark-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular pieces, loved by customers worldwide.
            </p>
          </motion.div>

          <ProductGrid limit={6} />
        </div>
      </section>

      {/* Editorial Showcase */}
      <EditorialShowcase />

      {/* Video Carousel Section */}
      <VideoCarousel />

      {/* Testimonials Section */}
      <Testimonials />

      <Footer />
    </div>
  )
}
