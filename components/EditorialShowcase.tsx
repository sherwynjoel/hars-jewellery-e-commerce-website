'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

interface EditorialFeature {
  id: string
  title?: string | null
  subtitle?: string | null
  imageUrl: string
  productId?: string | null
  linkUrl?: string | null
  layout?: string | null
  product?: {
    id: string
    name: string
  } | null
}

const layoutClassMap: Record<string, string> = {
  square: 'md:col-span-1 md:row-span-1',
  wide: 'md:col-span-2 md:row-span-1',
  tall: 'md:col-span-1 md:row-span-2',
  hero: 'md:col-span-2 md:row-span-2'
}

export default function EditorialShowcase() {
  const [items, setItems] = useState<EditorialFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/editorial-showcase', { cache: 'no-store' })
        const data = await response.json()
        if (Array.isArray(data)) {
          setItems(data)
        }
      } catch (error) {
        console.error('Failed to load editorial showcase', error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const gridItems = useMemo(() => items.slice(0, 12), [items])

  if (!loading && gridItems.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500 mb-4">
            Editorial
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
            Moments Styled by Icons
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Hars Jewellery pieces elevate every frame. Tap any look to explore the featured design.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[220px]">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="rounded-[28px] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[220px]">
            {gridItems.map((item, index) => {
              const href = item.productId ? `/products/${item.productId}` : item.linkUrl || '#'
              const layoutClass = layoutClassMap[item.layout || 'square'] || layoutClassMap.square
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`relative group rounded-[28px] overflow-hidden shadow-lg ${layoutClass}`}
                >
                  <Link href={href} className="block h-full w-full" prefetch={false}>
                    <div className="relative h-full w-full">
                      <Image
                        src={item.imageUrl || '/placeholder-jewelry.jpg'}
                        alt={item.title || item.product?.name || 'Editorial look'}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={item.imageUrl?.startsWith('/uploads/')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white pointer-events-none">
                        {item.subtitle && (
                          <p className="text-xs uppercase tracking-[0.35em] text-gray-200 mb-2">{item.subtitle}</p>
                        )}
                        <p className="text-lg sm:text-xl font-semibold leading-tight">
                          {item.title || item.product?.name}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

