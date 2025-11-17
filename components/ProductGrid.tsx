'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: { url: string }[]
  category: string
  inStock: boolean
}

interface ProductGridProps {
  limit?: number
  category?: string
  sort?: string
}

export default function ProductGrid({ limit, category, sort }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        if (limit) params.set('limit', String(limit))
        if (sort) params.set('sort', sort)
        // Add cache-busting to ensure fresh data
        params.set('_t', String(Date.now()))
        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit, category, sort])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: limit || 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No products found</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
