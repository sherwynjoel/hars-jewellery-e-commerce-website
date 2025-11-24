'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Grid, List } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'

const categories = [
  { name: 'All', value: '' },
  { name: 'Rings', value: 'Rings' },
  { name: 'Necklaces', value: 'Necklaces' },
  { name: 'Earrings', value: 'Earrings' },
  { name: 'Bracelets', value: 'Bracelets' },
  { name: 'Watches', value: 'Watches' }
]

const sortOptions = [
  { name: 'Newest First', value: 'newest' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
  { name: 'Name A-Z', value: 'name-asc' }
]

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-40 sm:pt-44 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-10 text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-dark-900 mb-4 leading-tight pt-2">
              Our Collections
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed pt-2">
              Discover our exquisite collection of handcrafted jewelry, each piece telling a unique story of elegance and timeless beauty.
            </p>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card-elevated p-6 mb-8 relative z-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border-2 whitespace-nowrap ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-black to-gray-800 text-white border-black shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Sort (animated dropdown) */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(prev => !prev)}
                    aria-expanded={showFilters}
                    aria-haspopup="listbox"
                    className="inline-flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-dark-900 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {sortOptions.find(o => o.value === sortBy)?.name}
                    <motion.span animate={{ rotate: showFilters ? 180 : 0 }} className="text-gray-500">▾</motion.span>
                  </motion.button>
                  <motion.ul
                    initial={false}
                    animate={{ opacity: showFilters ? 1 : 0, y: showFilters ? 0 : -6, pointerEvents: showFilters ? 'auto' : 'none' }}
                    transition={{ duration: 0.15 }}
                    role="listbox"
                    className="absolute z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          role="option"
                          aria-selected={sortBy === option.value}
                          onClick={() => { setSortBy(option.value); setShowFilters(false) }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === option.value ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'
                          }`}
                        >
                          {option.name}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </div>

                {/* Segmented control for view mode */}
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                  <button
                    aria-label="Grid view"
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-black text-white shadow'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="List view"
                    onClick={() => setViewMode('list')}
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-black text-white shadow'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  aria-label="Toggle filters"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ProductGrid category={selectedCategory} sort={sortBy} />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
