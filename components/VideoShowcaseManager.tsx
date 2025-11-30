'use client'

import { useEffect, useState } from 'react'
import { Upload, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Loader2, Play } from 'lucide-react'
import toast from 'react-hot-toast'

interface VideoShowcaseItem {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
  duration?: number | null
}

export default function VideoShowcaseManager() {
  const [items, setItems] = useState<VideoShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    url: ''
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/video-showcase')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load video showcase items')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file')
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file size must be less than 100MB')
      return
    }

    setVideoFile(file)

    // Get video duration
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = Math.floor(video.duration)
      if (duration > 50) {
        toast.error('Video duration must be less than 50 seconds')
        setVideoFile(null)
        return
      }
    }
    video.src = URL.createObjectURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoFile && !form.url) {
      toast.error('Please upload a video file or provide a video URL')
      return
    }

    setSubmitting(true)
    setUploading(true)

    try {
      let videoUrl = form.url

      // Upload video file if provided
      if (videoFile) {
        const fd = new FormData()
        fd.append('file', videoFile)
        
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadResponse.ok) throw new Error('Upload failed')
        
        const uploadData = await uploadResponse.json()
        videoUrl = uploadData.fileUrl || uploadData.imageUrl
        if (!videoUrl) throw new Error('Video URL missing')
      }

      // Get video duration if file was uploaded
      let duration: number | null = null
      if (videoFile) {
        const video = document.createElement('video')
        video.preload = 'metadata'
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            duration = Math.floor(video.duration)
            window.URL.revokeObjectURL(video.src)
            resolve(null)
          }
          video.onerror = reject
          video.src = URL.createObjectURL(videoFile)
        })
      }

      // Get max position
      const maxPosition = items.length > 0 
        ? Math.max(...items.map(i => i.position)) 
        : -1

      const response = await fetch('/api/admin/video-showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          title: form.title.trim() || null,
          subtitle: form.subtitle.trim() || null,
          position: maxPosition + 1,
          duration: duration
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save video')
      }

      toast.success('Video added successfully')
      setForm({ title: '', subtitle: '', url: '' })
      setVideoFile(null)
      const inputElement = document.getElementById('video-showcase-file') as HTMLInputElement | null
      if (inputElement) {
        inputElement.value = ''
      }
      fetchItems()
      
      // Force refresh the homepage to show new video
      // This will trigger a re-fetch on the homepage
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that the homepage can listen to
        window.dispatchEvent(new Event('video-showcase-updated'))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add video')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/admin/video-showcase?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error()
      toast.success('Video deleted')
      fetchItems()
    } catch (error) {
      toast.error('Failed to delete video')
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
      await Promise.all([
        fetch('/api/admin/video-showcase', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentItem.id,
            position: targetItem.position
          })
        }),
        fetch('/api/admin/video-showcase', {
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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/video-showcase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })

      if (!response.ok) throw new Error()
      toast.success(`Video ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchItems()
      
      // Trigger refresh on homepage
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('video-showcase-updated'))
      }
    } catch (error) {
      toast.error('Failed to update video status')
    }
  }

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
    )
  }

  const sortedItems = [...items].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Video Showcase (9:16)</h3>
          <p className="text-sm text-gray-500">Manage 9:16 ratio videos for homepage showcase (max 50 seconds)</p>
        </div>
      </div>

      {/* Add Video Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Video File (Max 50 seconds, 9:16 ratio recommended)
          </label>
          <input
            id="video-showcase-file"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            disabled={uploading || submitting}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 disabled:opacity-50"
          />
        </div>

        <div className="text-center text-sm text-gray-500">OR</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            name="url"
            value={form.url}
            onChange={handleInputChange}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            disabled={uploading || submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Video title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={uploading || submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (optional)
            </label>
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleInputChange}
              placeholder="Video subtitle"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={uploading || submitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || submitting || (!videoFile && !form.url)}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          ) : submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Add Video'
          )}
        </button>
      </form>

      {/* Videos List */}
      {sortedItems.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No videos added yet</p>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      Position {item.position + 1}
                    </span>
                    {item.duration && (
                      <span className="text-xs text-gray-500">
                        ({item.duration}s)
                      </span>
                    )}
                  </div>
                  
                  {item.title && (
                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                  )}
                  {item.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                  )}
                  
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 break-all">{item.url}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={item.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleMove(item.id, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleMove(item.id, 'down')}
                    disabled={index === sortedItems.length - 1}
                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
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
  )
}

