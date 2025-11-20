'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  customerName: string
  title?: string | null
  content: string
  imageUrl: string
  position: number
  isActive: boolean
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    title: '',
    content: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/testimonials')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName.trim() || !form.content.trim()) {
      toast.error('Name and testimonial are required')
      return
    }
    if (!imageFile) {
      toast.error('Please select an image')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('file', imageFile)
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!uploadResponse.ok) throw new Error('Upload failed')
      const uploadData = await uploadResponse.json()
      const imageUrl = uploadData.fileUrl || uploadData.imageUrl
      if (!imageUrl) throw new Error('Image URL missing')

      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          title: form.title.trim() || null,
          content: form.content.trim(),
          imageUrl
        })
      })

      if (!response.ok) throw new Error('Failed to save testimonial')

      toast.success('Testimonial added')
      setForm({ customerName: '', title: '', content: '' })
      setImageFile(null)
      const inputElement = document.getElementById('testimonial-image') as HTMLInputElement | null
      if (inputElement) {
        inputElement.value = ''
      }
      fetchTestimonials()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add testimonial')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current })
      })
      if (!response.ok) throw new Error()
      toast.success(`Testimonial ${!current ? 'shown' : 'hidden'}`)
      fetchTestimonials()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      toast.success('Testimonial deleted')
      fetchTestimonials()
    } catch (error) {
      toast.error('Failed to delete testimonial')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = testimonials.findIndex((item) => item.id === id)
    if (index === -1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= testimonials.length) return

    const current = testimonials[index]
    const target = testimonials[swapIndex]

    try {
      await Promise.all([
        fetch('/api/admin/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, position: target.position })
        }),
        fetch('/api/admin/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: target.id, position: current.position })
        })
      ])
      toast.success('Order updated')
      fetchTestimonials()
    } catch (error) {
      toast.error('Failed to reorder')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-dark-900 mb-4">Customer Testimonials</h3>
        <p className="text-sm text-gray-500">Upload a customer photo and their testimonial quote.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Priya Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title / Occasion (optional)</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Bridal Jewellery"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleInputChange}
              className="input-field min-h-[120px]"
              placeholder="Share their experience in a few lines..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Image</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-2xl py-4 cursor-pointer hover:border-black">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {imageFile ? imageFile.name : 'Upload portrait (JPG, PNG)'}
              </span>
              <input
                id="testimonial-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary inline-flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Add Testimonial</span>
          </button>
        </div>
      </form>

      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-500">
            No testimonials yet. Add one using the form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials
              .sort((a, b) => a.position - b.position)
              .map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={testimonial.imageUrl || '/placeholder-jewelry.jpg'}
                        alt={testimonial.customerName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.customerName}</p>
                      {testimonial.title && (
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMove(testimonial.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(testimonial.id, 'down')}
                        disabled={index === testimonials.length - 1}
                        className="p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(testimonial.id, testimonial.isActive)}
                        className={`p-1.5 rounded-lg ${
                          testimonial.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {testimonial.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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

