'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Video, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface VideoCarouselItem {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
  type?: string
  createdAt: string
}

export default function VideoCarouselManager() {
  const [items, setItems] = useState<VideoCarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/video-carousel')
      if (!response.ok) {
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      // Ensure data is an array
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load video carousel items:', error)
      setItems([]) // Set empty array on error
      toast.error('Failed to load video carousel items')
    } finally {
      setLoading(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      for (const file of files) {
        // Validate it's an image or video file
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not an image or video file`)
          continue
        }

        const fd = new FormData()
        fd.append('file', file)
        
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadResponse.ok) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }
        
        const uploadData = await uploadResponse.json()
        const url = uploadData.fileUrl || uploadData.videoUrl || uploadData.imageUrl
        const fileType = uploadData.fileType || (isVideo ? 'video' : 'image')
        
        // Create carousel item entry
        const createResponse = await fetch('/api/admin/video-carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            type: fileType,
            position: items.length,
            isActive: true
          })
        })
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}))
          const errorMsg = errorData.details || errorData.error || 'Unknown error'
          console.error(`Failed to add ${file.name}:`, errorMsg, errorData)
          toast.error(`Failed to add ${file.name}: ${errorMsg}`)
          continue
        }
      }
      
      toast.success('Media uploaded successfully!')
      fetchItems()
    } catch (error) {
      toast.error('Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/video-carousel?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        toast.error('Failed to delete item')
        return
      }
      
      toast.success('Item deleted successfully')
      fetchItems()
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/video-carousel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })
      
      if (!response.ok) {
        toast.error('Failed to update item status')
        return
      }
      
      toast.success(`Item ${!currentStatus ? 'shown' : 'hidden'} successfully`)
      fetchItems()
    } catch (error) {
      toast.error('Failed to update item status')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const currentItem = items[currentIndex]
    const targetItem = items[newIndex]

    try {
      // Update both positions
      await Promise.all([
        fetch('/api/admin/video-carousel', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentItem.id,
            position: targetItem.position
          })
        }),
        fetch('/api/admin/video-carousel', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: targetItem.id,
            position: currentItem.position
          })
        })
      ])
      
      toast.success('Position updated')
      fetchItems()
    } catch (error) {
      toast.error('Failed to update position')
    }
  }

  const handleUpdateTitle = async (id: string, title: string) => {
    try {
      const response = await fetch('/api/admin/video-carousel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: title || null
        })
      })
      
      if (!response.ok) {
        toast.error('Failed to update title')
        return
      }
      
      toast.success('Title updated')
      fetchItems()
    } catch (error) {
      toast.error('Failed to update title')
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
        <h3 className="text-xl font-bold text-dark-900">Video Carousel</h3>
        <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No media in carousel yet. Upload some images or videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="relative aspect-video bg-gray-900">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.title || 'Carousel image'}
                    fill
                    className="object-cover"
                    quality={100}
                    unoptimized={false}
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                )}
                {!item.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">Hidden</span>
                  </div>
                )}
                <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${
                  item.type === 'image' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {item.type === 'image' ? 'IMAGE' : 'VIDEO'}
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Title (e.g., TO Night)"
                    defaultValue={item.title || ''}
                    onBlur={(e) => {
                      if (e.target.value !== item.title) {
                        handleUpdateTitle(item.id, e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Position: {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.isActive ? 'Hide' : 'Show'}
                    >
                      {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMove(item.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(item.id, 'down')}
                    disabled={index === items.length - 1}
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

