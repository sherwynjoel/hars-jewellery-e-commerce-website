'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCartStore } from '@/lib/store'

interface ProductImage { url: string }
interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: ProductImage[]
  category: string
  inStock: boolean
  stockCount: number
}

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const { addItem } = useCartStore()

  useEffect(() => {
    const id = params?.id
    if (!id) return
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setProduct(data)
      } catch {
        toast.error('Product not found')
        router.push('/collections')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params?.id, router])

  const images: string[] = product
    ? (product.images && product.images.length > 0
        ? product.images.map(i => i.url)
        : (product.image ? [product.image] : ['/placeholder-jewelry.jpg']))
    : []

  const handleAddToCart = () => {
    if (!product) return
    addItem({ id: product.id, name: product.name, price: product.price, image: images[0] })
    toast.success('Added to cart!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 w-2/3 rounded" />
              <div className="h-4 bg-gray-200 w-1/2 rounded" />
              <div className="h-24 bg-gray-200 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/collections" className="inline-flex items-center text-gray-600 hover:text-black">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to collection
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <Image
                  key={activeIndex}
                  src={images[activeIndex] || '/placeholder-jewelry.jpg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-all duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
              </div>
              {images.length > 1 && (
                <div className="mt-4 sm:mt-6 grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                  {images.map((url, idx) => (
                    <motion.button
                      key={`${url}-${idx}`}
                      onClick={() => setActiveIndex(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        idx === activeIndex 
                          ? 'border-black shadow-lg ring-2 ring-gray-200' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Image src={url} alt="thumb" fill className="object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="inline-block bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                  {product.category}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-dark-900 mb-4 leading-tight">
                  {product.name}
                </h1>
              </div>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-xl sm:text-2xl text-gray-600">₹</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">{product.price.toLocaleString('en-IN')}</span>
              </div>

              <div className="card-elevated p-6">
                <h3 className="text-lg font-bold text-dark-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 text-lg flex-1 ${product.inStock ? '' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <ShoppingCart className="w-6 h-6" /> 
                  <span>Add to cart</span>
                </motion.button>
                {!product.inStock && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl font-semibold flex-1 text-center">
                    Out of stock
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky mobile add-to-cart bar */}
      {product.inStock && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-lg mb-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-gray-600">₹</span>
              <span className="text-2xl font-bold text-purple-500">{product.price.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="btn-primary flex-1 py-3"
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}




