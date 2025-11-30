'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoShowcaseItem {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
  duration?: number | null
}

export default function VideoShowcase() {
  const [items, setItems] = useState<VideoShowcaseItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({})
  const [muted, setMuted] = useState<{ [key: string]: boolean }>({})
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/video-showcase', { cache: 'no-store' })
      if (!response.ok) {
        console.error('Video Showcase API error:', response.status, response.statusText)
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      const videoItems = Array.isArray(data) ? data : []
      console.log('Video Showcase: Fetched items:', videoItems.length, videoItems)
      setItems(videoItems)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to fetch video showcase:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const visibleItems = items.filter((item) => item.isActive)
      return (prev - 1 + visibleItems.length) % visibleItems.length
    })
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const visibleItems = items.filter((item) => item.isActive)
      return (prev + 1) % visibleItems.length
    })
  }

  const togglePlay = (itemId: string) => {
    const video = videoRefs.current[itemId]
    if (video) {
      if (playing[itemId]) {
        video.pause()
      } else {
        video.play()
      }
      setPlaying((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
    }
  }

  const toggleMute = (itemId: string) => {
    const video = videoRefs.current[itemId]
    if (video) {
      video.muted = !muted[itemId]
      setMuted((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
    }
  }

  const handleVideoPlay = (itemId: string) => {
    setPlaying((prev) => ({ ...prev, [itemId]: true }))
  }

  const handleVideoPause = (itemId: string) => {
    setPlaying((prev) => ({ ...prev, [itemId]: false }))
  }

  if (loading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  const visibleItems = items.filter((item) => item.isActive)
  
  // Debug logging
  useEffect(() => {
    const activeItems = items.filter((item) => item.isActive)
    console.log('Video Showcase: Items:', items.length, 'Visible:', activeItems.length)
    if (items.length > 0 && activeItems.length === 0) {
      console.warn('Video Showcase: All items are inactive')
    }
  }, [items])

  // Ensure currentIndex is valid when items change
  useEffect(() => {
    const activeItems = items.filter((item) => item.isActive)
    if (activeItems.length > 0 && currentIndex >= activeItems.length) {
      setCurrentIndex(0)
    }
  }, [items, currentIndex])

  if (visibleItems.length === 0) {
    console.log('Video Showcase: No active videos to display')
    return null
  }

  // Ensure currentIndex is valid
  const safeIndex = Math.min(currentIndex, visibleItems.length - 1)
  const currentItem = visibleItems[safeIndex]
  
  if (!currentItem) {
    console.error('Video Showcase: No current item found', { safeIndex, visibleItems })
    return null
  }

  return (
    <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
            Our Collection
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite range of handcrafted jewelry pieces.
          </p>
        </motion.div>

        {/* Video Carousel Container */}
        <div className="relative">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-black"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[currentItem.id] = el
                    // Auto-play when video loads
                    if (el && !playing[currentItem.id]) {
                      el.play().catch((err) => {
                        console.log('Auto-play prevented:', err)
                      })
                    }
                  }}
                  src={currentItem.url}
                  className="w-full h-full object-cover"
                  loop
                  muted={muted[currentItem.id] ?? true}
                  playsInline
                  autoPlay
                  onPlay={() => handleVideoPlay(currentItem.id)}
                  onPause={() => handleVideoPause(currentItem.id)}
                  onError={(e) => {
                    console.error('Video error:', e, currentItem.url)
                  }}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-40">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      <button
                        onClick={() => togglePlay(currentItem.id)}
                        className="text-white hover:text-gray-200 transition-colors"
                        aria-label={playing[currentItem.id] ? 'Pause' : 'Play'}
                      >
                        {playing[currentItem.id] ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleMute(currentItem.id)}
                        className="text-white hover:text-gray-200 transition-colors ml-2"
                        aria-label={muted[currentItem.id] ? 'Unmute' : 'Mute'}
                      >
                        {muted[currentItem.id] ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {(currentItem.title || currentItem.subtitle) && (
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                        {currentItem.title && (
                          <p className="text-white text-sm font-medium">{currentItem.title}</p>
                        )}
                        {currentItem.subtitle && (
                          <p className="text-white text-xs opacity-80">{currentItem.subtitle}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {visibleItems.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all z-50 active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all z-50 active:scale-95"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {visibleItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
                {visibleItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-full transition-all ${
                      index === safeIndex
                        ? 'bg-white h-2 w-8'
                        : 'bg-white/60 hover:bg-white/80 h-2 w-2'
                    }`}
                    aria-label={`Go to video ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

