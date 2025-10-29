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
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Collections
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl">
              Discover our exquisite collection of handcrafted jewelry, each piece telling a unique story of elegance and timeless beauty.
            </p>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === category.value
                        ? 'bg-gold-500 text-white border-gold-500 shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
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
                    className="inline-flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
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
                            sortBy === option.value ? 'bg-gold-50 text-gold-700' : 'hover:bg-gray-50'
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
                        ? 'bg-gold-500 text-white shadow'
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
                        ? 'bg-gold-500 text-white shadow'
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

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 lg:hidden"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field w-full"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
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
