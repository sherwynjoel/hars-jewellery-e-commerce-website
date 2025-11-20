'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  Edit2,
  RefreshCcw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductOption {
  id: string
  name: string
}

interface EditorialFeature {
  id: string
  title?: string | null
  subtitle?: string | null
  imageUrl: string
  productId?: string | null
  layout: string
  linkUrl?: string | null
  isActive: boolean
  position: number
  product?: {
    id: string
    name: string
  } | null
}

const layoutOptions = [
  { value: 'square', label: 'Square' },
  { value: 'wide', label: 'Wide (2 columns)' },
  { value: 'tall', label: 'Tall (2 rows)' },
  { value: 'hero', label: 'Hero (2x2)' }
]

export default function EditorialShowcaseManager() {
  const [features, setFeatures] = useState<EditorialFeature[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    productId: '',
    linkUrl: '',
    layout: 'square',
    imageUrl: ''
  })

  useEffect(() => {
    fetchFeatures()
    fetchProducts()
  }, [])

  const sortedFeatures = useMemo(
    () => features.slice().sort((a, b) => a.position - b.position),
    [features]
  )

  const fetchFeatures = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/editorial-showcase')
      if (!response.ok) throw new Error('Failed to load showcase items')
      const data = await response.json()
      if (Array.isArray(data)) {
        setFeatures(data)
      }
    } catch (error) {
      console.error(error)
      toast.error('Could not load showcase items')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) return
      const data = await response.json()
      if (Array.isArray(data)) {
        setProducts(
          data.map((product: any) => ({
            id: product.id,
            name: product.name
          }))
        )
      }
    } catch (error) {
      console.error('Failed to load products for showcase manager', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      productId: '',
      linkUrl: '',
      layout: 'square',
      imageUrl: ''
    })
    setImageFile(null)
    setEditingId(null)
    const fileInput = document.getElementById('editorial-image') as HTMLInputElement | null
    if (fileInput) fileInput.value = ''
  }

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return form.imageUrl
    const fd = new FormData()
    fd.append('file', imageFile)
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!uploadRes.ok) throw new Error('Image upload failed')
    const uploadData = await uploadRes.json()
    return uploadData.fileUrl || uploadData.imageUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId && !form.linkUrl) {
      toast.error('Select a product or provide a custom link')
      return
    }
    if (!form.imageUrl && !imageFile) {
      toast.error('Please upload an image')
      return
    }

    setSubmitting(true)

    try {
      const imageUrl = await uploadImageIfNeeded()
      if (!imageUrl) throw new Error('Image URL missing')

      const payload = {
        title: form.title.trim() || null,
        subtitle: form.subtitle.trim() || null,
        productId: form.productId || null,
        linkUrl: form.linkUrl.trim() || null,
        layout: form.layout,
        imageUrl
      }

      const url = '/api/admin/editorial-showcase'
      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload)
      })

      if (!response.ok) throw new Error('Failed to save showcase item')

      toast.success(editingId ? 'Showcase item updated' : 'Showcase item added')
      resetForm()
      fetchFeatures()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to save item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (feature: EditorialFeature) => {
    setEditingId(feature.id)
    setForm({
      title: feature.title || '',
      subtitle: feature.subtitle || '',
      productId: feature.productId || '',
      linkUrl: feature.linkUrl || '',
      layout: feature.layout || 'square',
      imageUrl: feature.imageUrl
    })
    setImageFile(null)
    const fileInput = document.getElementById('editorial-image') as HTMLInputElement | null
    if (fileInput) fileInput.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this showcase item?')) return
    try {
      const response = await fetch(`/api/admin/editorial-showcase?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error()
      toast.success('Item deleted')
      fetchFeatures()
      if (editingId === id) resetForm()
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const handleToggle = async (feature: EditorialFeature) => {
    try {
      const response = await fetch('/api/admin/editorial-showcase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feature.id, isActive: !feature.isActive })
      })
      if (!response.ok) throw new Error()
      toast.success(feature.isActive ? 'Hidden from site' : 'Visible on site')
      fetchFeatures()
    } catch (error) {
      toast.error('Failed to update visibility')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = sortedFeatures.findIndex((item) => item.id === id)
    if (index === -1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= sortedFeatures.length) return

    const current = sortedFeatures[index]
    const target = sortedFeatures[swapIndex]

    try {
      await Promise.all([
        fetch('/api/admin/editorial-showcase', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, position: target.position })
        }),
        fetch('/api/admin/editorial-showcase', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, position: current.position })
        })
      ])
      toast.success('Order updated')
      fetchFeatures()
    } catch (error) {
      toast.error('Failed to reorder items')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-dark-900 mb-2">Editorial Showcase</h3>
        <p className="text-sm text-gray-500">
          Curate the fashion editorial grid shown below the featured collection. Each tile links to a product page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Vogue Cover"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Tag</label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Editorial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product to link</label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Or provide a custom link below.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom link (optional)</label>
              <input
                type="text"
                name="linkUrl"
                value={form.linkUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tile layout</label>
              <select
                name="layout"
                value={form.layout}
                onChange={handleInputChange}
                className="input-field"
              >
                {layoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-2xl py-4 cursor-pointer hover:border-black">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {imageFile ? imageFile.name : editingId ? 'Replace image (optional)' : 'Upload image'}
                </span>
                <input
                  id="editorial-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
              {form.imageUrl && !imageFile && (
                <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={form.imageUrl} alt="current" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{editingId ? 'Update Item' : 'Add to Showcase'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : sortedFeatures.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-500">
            No showcase items yet. Add one using the form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sortedFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex gap-4"
              >
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={feature.imageUrl || '/placeholder-jewelry.jpg'}
                    alt={feature.title || feature.product?.name || 'Showcase image'}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {feature.title || feature.product?.name || 'Untitled'}
                      </p>
                      {feature.subtitle && <p className="text-sm text-gray-500">{feature.subtitle}</p>}
                      {feature.product && (
                        <p className="text-xs text-gray-400 mt-1">Product: {feature.product.name}</p>
                      )}
                    </div>
                    <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {feature.layout}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleMove(feature.id, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(feature.id, 'down')}
                      disabled={index === sortedFeatures.length - 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(feature)}
                      className={`p-2 rounded-lg border ${feature.isActive ? 'text-green-600 border-green-100' : 'text-gray-400 border-gray-200'}`}
                      title={feature.isActive ? 'Hide' : 'Show'}
                    >
                      {feature.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(feature)}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

