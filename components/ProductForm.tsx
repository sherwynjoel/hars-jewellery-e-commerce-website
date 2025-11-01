'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
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
  stockCount: number
  goldWeightGrams?: number
}

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSubmit: () => void
}

export default function ProductForm({ product, onClose, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockCount: '',
    image: '',
    images: [] as string[],
    goldWeightGrams: ''
  })
  const [todayGoldPrice, setTodayGoldPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stockCount: product.stockCount.toString(),
        image: product.image,
        images: (product.images?.map(i => i.url) || (product.image ? [product.image] : [])) as string[],
        goldWeightGrams: (product.goldWeightGrams ?? '').toString()
      })
    }
  }, [product])

  useEffect(() => {
    fetch('/api/gold-price')
      .then(r => r.json())
      .then(d => setTodayGoldPrice(d?.pricePerGram ?? null))
      .catch(() => setTodayGoldPrice(null))
  }, [])

  useEffect(() => {
    if (todayGoldPrice && formData.goldWeightGrams) {
      const w = parseFloat(formData.goldWeightGrams)
      if (!isNaN(w) && w > 0) {
        const computed = Math.round(w * todayGoldPrice)
        setFormData(prev => ({ ...prev, price: computed.toString() }))
      }
    } else if (formData.goldWeightGrams && !todayGoldPrice) {
      toast.error('Today\'s gold price is not set. Please set it in admin panel first.')
    }
  }, [todayGoldPrice, formData.goldWeightGrams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      // Show preview immediately
      const previews = files.map(f => URL.createObjectURL(f))
      setFormData(prev => ({ ...prev, images: [...prev.images, ...previews], image: prev.image || previews[0] }))

      // Upload file to server
      try {
        const uploaded: string[] = []
        for (const file of files) {
          const fd = new FormData()
          fd.append('file', file)
          const response = await fetch('/api/upload', { method: 'POST', body: fd })
          if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            toast.error(error.error || 'Failed to upload image')
            continue
          }
          const result = await response.json()
          uploaded.push(result.imageUrl)
        }
        if (uploaded.length) {
          setFormData(prev => ({ ...prev, images: [...prev.images.filter(u => !u.startsWith('blob:')), ...uploaded], image: prev.image || uploaded[0] }))
          toast.success('Images uploaded successfully!')
        }
      } catch (error) {
        toast.error('Failed to upload image')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      // Calculate price from gold weight if provided
      let finalPrice = parseFloat(formData.price)
      const weight = formData.goldWeightGrams ? parseFloat(formData.goldWeightGrams) : null
      
      if (weight && !isNaN(weight) && weight > 0 && todayGoldPrice) {
        finalPrice = Math.round(weight * todayGoldPrice)
      } else if (weight && !todayGoldPrice) {
        toast.error('Today\'s gold price is not set. Please set it in admin panel first.')
        setLoading(false)
        return
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: finalPrice,
          stockCount: parseInt(formData.stockCount),
          images: formData.images,
          goldWeightGrams: weight
        })
      })

      if (response.ok) {
        toast.success(product ? 'Product updated successfully!' : 'Product created successfully!')
        onSubmit()
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = error.details || error.error || 'Something went wrong'
        toast.error(errorMsg)
        console.error('Product update/create error:', error)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Rings">Rings</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Watches">Watches</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={3}
                placeholder="Enter product description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gold weight (grams)</label>
                <input
                  type="number"
                  name="goldWeightGrams"
                  value={formData.goldWeightGrams}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 5.25"
                  step="0.01"
                  min="0"
                />
                {todayGoldPrice != null && formData.goldWeightGrams && (
                  <p className="text-xs text-gray-500 mt-1">Auto price = weight × today price (₹{todayGoldPrice.toLocaleString('en-IN')} per gram)</p>
                )}
                {!todayGoldPrice && (
                  <p className="text-xs text-yellow-600 mt-1">Set today's gold price in admin panel first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                  {formData.goldWeightGrams && todayGoldPrice && (
                    <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
                  )}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  step="1"
                  min="0"
                  required
                  readOnly={!!(formData.goldWeightGrams && todayGoldPrice)}
                  style={{ cursor: formData.goldWeightGrams && todayGoldPrice ? 'not-allowed' : 'text', backgroundColor: formData.goldWeightGrams && todayGoldPrice ? '#f9fafb' : undefined }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Count
                </label>
                <input
                  type="number"
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload images or drag and drop</span>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="Product" className="w-full h-24 object-cover rounded-lg" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx), image: prev.images[0] || '' }))} className="absolute top-1 right-1 bg-white/80 rounded p-1 shadow hidden group-hover:block">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
