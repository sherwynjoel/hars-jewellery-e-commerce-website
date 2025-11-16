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
  shippingCost?: number
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
    goldWeightGrams: '',
    makingCostAndWastage: '',
    shippingCost: ''
  })
  const [todayGoldPrice, setTodayGoldPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Track the original/base price when editing (before making cost is added)
  const [basePrice, setBasePrice] = useState<number | null>(null)
  // Track base price for new products (when price is manually entered)
  const [newProductBasePrice, setNewProductBasePrice] = useState<number | null>(null)

  useEffect(() => {
    if (product) {
      const productPrice = product.price
      setBasePrice(productPrice)
      setFormData({
        name: product.name,
        description: product.description,
        price: productPrice.toString(),
        category: product.category,
        stockCount: product.stockCount.toString(),
        image: product.image,
        images: (product.images?.map(i => i.url) || (product.image ? [product.image] : [])) as string[],
        goldWeightGrams: (product.goldWeightGrams ?? '').toString(),
        makingCostAndWastage: '',
        shippingCost: (product.shippingCost ?? '').toString()
      })
    } else {
      setBasePrice(null)
      setNewProductBasePrice(null)
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
        const basePrice = Math.round(w * todayGoldPrice)
        const makingCost = parseFloat(formData.makingCostAndWastage) || 0
        const finalPrice = basePrice + makingCost
        setFormData(prev => ({ ...prev, price: finalPrice.toString() }))
      }
    } else if (formData.goldWeightGrams && !todayGoldPrice) {
      toast.error('Today\'s gold price is not set. Please set it in admin panel first.')
    }
  }, [todayGoldPrice, formData.goldWeightGrams, formData.makingCostAndWastage])

  // Update price when making cost changes (for manual price entry, when not using gold weight)
  useEffect(() => {
    if (!formData.goldWeightGrams) {
      if (product && basePrice !== null) {
        // For editing: use tracked base price
        const makingCost = parseFloat(formData.makingCostAndWastage) || 0
        const finalPrice = basePrice + makingCost
        setFormData(prev => ({ ...prev, price: finalPrice.toString() }))
      } else if (!product) {
        // For new products: track base price when price is manually entered
        const currentPrice = parseFloat(formData.price) || 0
        const makingCost = parseFloat(formData.makingCostAndWastage) || 0
        
        // If price was just entered and base price not set, treat entered price as base
        if (currentPrice > 0 && newProductBasePrice === null) {
          setNewProductBasePrice(currentPrice - makingCost)
        }
        
        // Calculate final price: base + making cost
        const base = newProductBasePrice !== null ? newProductBasePrice : (currentPrice - makingCost)
        const finalPrice = Math.max(0, base) + makingCost
        
        if (finalPrice !== currentPrice && currentPrice > 0) {
          setFormData(prev => ({ ...prev, price: finalPrice.toString() }))
        }
      }
    }
  }, [formData.makingCostAndWastage, basePrice, product, formData.goldWeightGrams, newProductBasePrice])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If price is manually changed (not using gold weight), recalculate base price
    // by subtracting the current making cost
    if (name === 'price' && !formData.goldWeightGrams) {
      const newPrice = parseFloat(value) || 0
      const currentMakingCost = parseFloat(formData.makingCostAndWastage) || 0
      
      if (product && basePrice !== null) {
        // For editing: update base price
        const newBasePrice = newPrice - currentMakingCost
        setBasePrice(newBasePrice >= 0 ? newBasePrice : 0)
      } else if (!product) {
        // For new products: update tracked base price
        const newBasePrice = newPrice - currentMakingCost
        setNewProductBasePrice(newBasePrice >= 0 ? newBasePrice : 0)
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
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

      // Calculate price from gold weight if provided, then add making cost and wastage
      let calculatedBasePrice = 0
      const weight = formData.goldWeightGrams ? parseFloat(formData.goldWeightGrams) : null
      const makingCost = parseFloat(formData.makingCostAndWastage) || 0
      
      if (weight && !isNaN(weight) && weight > 0 && todayGoldPrice) {
        // If gold weight is provided, calculate base price from weight
        calculatedBasePrice = Math.round(weight * todayGoldPrice)
      } else if (weight && !todayGoldPrice) {
        toast.error('Today\'s gold price is not set. Please set it in admin panel first.')
        setLoading(false)
        return
      } else if (!weight) {
        // For manual price entry, use the base price we've been tracking
        // If we're editing and have a base price, use it; otherwise use the price field value
        if (product && basePrice !== null) {
          calculatedBasePrice = basePrice
        } else {
          // For new products or when basePrice is not set, use the price field value
          // and subtract making cost if it exists (to get the base)
          const priceFieldValue = parseFloat(formData.price) || 0
          calculatedBasePrice = priceFieldValue - makingCost
        }
      }

      // Add making cost and wastage to the base price
      const finalPrice = Math.round(calculatedBasePrice + makingCost)

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
          goldWeightGrams: weight,
          shippingCost: parseFloat(formData.shippingCost) || 0
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
                  <p className="text-xs text-gray-500 mt-1">Base price = weight × today price (₹{todayGoldPrice.toLocaleString('en-IN')} per gram)</p>
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
                {formData.makingCostAndWastage && parseFloat(formData.makingCostAndWastage) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {basePrice !== null ? (
                      <>Base: ₹{basePrice.toLocaleString('en-IN')} + Making Cost: ₹{parseFloat(formData.makingCostAndWastage).toLocaleString('en-IN')} = ₹{parseFloat(formData.price).toLocaleString('en-IN')}</>
                    ) : formData.price ? (
                      <>Price: ₹{parseFloat(formData.price).toLocaleString('en-IN')} (includes making cost of ₹{parseFloat(formData.makingCostAndWastage).toLocaleString('en-IN')})</>
                    ) : (
                      <>Final Price will include making cost of ₹{parseFloat(formData.makingCostAndWastage).toLocaleString('en-IN')}</>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Making Cost & Wastage (₹)
              </label>
              <input
                type="number"
                name="makingCostAndWastage"
                value={formData.makingCostAndWastage}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter making cost and wastage (e.g., 200)"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">This amount will be added to the product price</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost (₹)
              </label>
              <input
                type="number"
                name="shippingCost"
                value={formData.shippingCost}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter shipping cost (e.g., 50)"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">This amount will be added separately during billing (not included in product price)</p>
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
