'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SlideshowImage {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
  type?: string
  createdAt: string
}

export default function SlideshowManager() {
  const [images, setImages] = useState<SlideshowImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/slideshow')
      const data = await response.json()
      setImages(data)
    } catch (error) {
      toast.error('Failed to load slideshow images')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadResponse.ok) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }
        
        const uploadData = await uploadResponse.json()
        const url = uploadData.fileUrl || uploadData.imageUrl // Fallback for backward compatibility
        const fileType = uploadData.fileType || (file.type.startsWith('video/') ? 'video' : 'image')
        
        // Create slideshow image/video entry
        const createResponse = await fetch('/api/admin/slideshow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            type: fileType,
            position: images.length,
            isActive: true
          })
        })
        
        if (!createResponse.ok) {
          toast.error(`Failed to add ${file.name} to slideshow`)
          continue
        }
      }
      
      toast.success('Files uploaded successfully!')
      fetchImages()
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/slideshow?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        toast.error('Failed to delete media')
        return
      }
      
      toast.success('Media deleted successfully')
      fetchImages()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/slideshow', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })
      
      if (!response.ok) {
        toast.error('Failed to update media status')
        return
      }
      
      toast.success(`Media ${!currentStatus ? 'shown' : 'hidden'} successfully`)
      fetchImages()
    } catch (error) {
      toast.error('Failed to update image status')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const currentImage = images[currentIndex]
    const targetImage = images[newIndex]

    try {
      // Update both positions
      await Promise.all([
        fetch('/api/admin/slideshow', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentImage.id,
            position: targetImage.position
          })
        }),
        fetch('/api/admin/slideshow', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: targetImage.id,
            position: currentImage.position
          })
        })
      ])
      
      toast.success('Position updated')
      fetchImages()
    } catch (error) {
      toast.error('Failed to update position')
    }
  }

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark-900">Slideshow Images & Videos</h3>
        <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No slideshow media yet. Upload some images or videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="relative aspect-video bg-gray-100">
                {image.type === 'video' ? (
                  <video
                    src={image.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt={image.title || 'Slideshow image'}
                    fill
                    className="object-cover"
                  />
                )}
                {!image.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">Hidden</span>
                  </div>
                )}
                {image.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    VIDEO
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Position: {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(image.id, image.isActive)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        image.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={image.isActive ? 'Hide' : 'Show'}
                    >
                      {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMove(image.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(image.id, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

