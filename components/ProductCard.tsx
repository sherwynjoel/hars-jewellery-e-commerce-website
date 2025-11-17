'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: { url: string }[]
  category: string
  inStock: boolean
  shippingCost?: number
}

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const { addItem } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder-jewelry.jpg',
      shippingCost: product.shippingCost || 0
    })
    
    toast.success('Added to cart!')
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group relative card overflow-hidden flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="flex flex-col h-full block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/30 flex-shrink-0">
          {product.images && product.images.length > 1 ? (
            <>
              <Image
                src={product.images[0]?.url || product.image || '/placeholder-jewelry.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                priority={index < 4}
                quality={95}
                unoptimized={(product.images[0]?.url || product.image || '').startsWith('/uploads/')}
              />
              <Image
                src={product.images[1]?.url || product.image || '/placeholder-jewelry.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                priority={index < 4}
                quality={95}
                unoptimized={(product.images[1]?.url || product.image || '').startsWith('/uploads/')}
              />
            </>
          ) : (
            <Image
              src={product.image || '/placeholder-jewelry.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              quality={95}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority={index < 4}
              unoptimized={(product.image || '').startsWith('/uploads/')}
            />
          )}
          
          {/* Premium Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent flex items-center justify-center backdrop-blur-sm"
          >
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`p-3 rounded-full ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                } shadow-lg transition-colors duration-200`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white text-gray-700 rounded-full shadow-lg"
              >
                <Eye className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stock Status */}
          {!product.inStock && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border border-white/20">
              Out of Stock
            </motion.div>
          )}

          {/* Category Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border border-white/20">
            {product.category}
          </motion.div>
        </div>

        <div className="p-5 sm:p-7 bg-gradient-to-b from-white to-gray-50/50 flex flex-col h-full">
          <div className="flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-dark-900 mb-2 group-hover:text-black transition-all duration-300 line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {product.description}
            </p>
          </div>

          <div className="mt-auto w-full" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Price - Block element on its own line */}
            <div className="mb-3" style={{ display: 'block', width: '100%' }}>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm text-gray-500">₹</span>
                <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">
                  {product.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Button - Block element below price */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-2xl font-bold transition-all duration-500 text-sm sm:text-base w-full shadow-lg hover:shadow-xl ${
                product.inStock
                  ? 'bg-black hover:bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
              style={{ display: 'block', width: '100%', marginTop: '0' }}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
