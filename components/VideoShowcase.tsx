'use client'

import React, { useState, useEffect, useRef } from 'react'
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
    try {
      console.log('VideoShowcase: Component mounted, starting to fetch videos...')
      fetchVideos()
    } catch (error) {
      console.error('VideoShowcase: Error in useEffect:', error)
      setLoading(false)
      setItems([])
    }
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/video-showcase', { cache: 'no-store' })
      if (!response.ok) {
        // If 500 error, likely database table doesn't exist - fail silently
        if (response.status === 500) {
          console.warn('Video Showcase API error (likely table missing):', response.status)
          setItems([])
          setLoading(false)
          return
        }
        console.error('Video Showcase API error:', response.status, response.statusText)
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      const videoItems = Array.isArray(data) ? data : []
      console.log('Video Showcase: Fetched items:', videoItems.length, {
        items: videoItems.map(item => ({
          id: item.id,
          url: item.url,
          isActive: item.isActive,
          title: item.title
        }))
      })
      setItems(videoItems)
      setCurrentIndex(0)
      
      // Log if videos are inactive
      if (videoItems.length > 0) {
        const activeCount = videoItems.filter(item => item.isActive).length
        if (activeCount === 0) {
          console.warn('Video Showcase: All videos are inactive! Activate them in admin panel.')
        }
      }
    } catch (error) {
      console.error('Failed to fetch video showcase:', error)
      // Fail silently - don't crash the page
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

  const visibleItems = items.filter((item) => item.isActive)
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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

  // Now we can do conditional returns after all hooks
  if (loading) {
    return (
      <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
              Our Collection
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our exquisite range of handcrafted jewelry pieces.
            </p>
          </div>
          <div className="w-full flex items-center justify-center px-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]" style={{ aspectRatio: '9/16' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Always show the section, even if no videos
  if (visibleItems.length === 0) {
    // Show helpful message in development or if there are items but they're inactive
    if (items.length > 0) {
      console.warn('Video Showcase: Videos exist but are inactive. Activate them in admin panel.', {
        totalItems: items.length,
        activeItems: items.filter(i => i.isActive).length,
        allItems: items.map(i => ({ id: i.id, isActive: i.isActive, url: i.url }))
      })
    } else {
      console.log('Video Showcase: No videos found. Add videos in admin panel.')
    }
    
    // Show empty state instead of returning null
    return (
      <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          
          <div className="relative flex justify-center px-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] bg-gray-100 rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-gray-500 text-base sm:text-lg mb-2">No videos available</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Add videos in the admin panel to display them here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Ensure currentIndex is valid
  const safeIndex = Math.min(currentIndex, visibleItems.length - 1)
  const currentItem = visibleItems[safeIndex]
  
  if (!currentItem) {
    console.error('Video Showcase: No current item found', { 
      safeIndex, 
      visibleItemsLength: visibleItems.length,
      visibleItems: visibleItems.map(i => ({ id: i.id, url: i.url }))
    })
    return null
  }

  console.log('Video Showcase: Rendering video', {
    currentItemId: currentItem.id,
    currentItemUrl: currentItem.url,
    totalVisible: visibleItems.length
  })

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
        <div className="relative flex justify-center px-4">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]" style={{ aspectRatio: '9/16' }}>
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
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between z-40">
                    <div className="flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
                      <button
                        onClick={() => togglePlay(currentItem.id)}
                        className="text-white hover:text-gray-200 transition-colors"
                        aria-label={playing[currentItem.id] ? 'Pause' : 'Play'}
                      >
                        {playing[currentItem.id] ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleMute(currentItem.id)}
                        className="text-white hover:text-gray-200 transition-colors ml-1 sm:ml-2"
                        aria-label={muted[currentItem.id] ? 'Unmute' : 'Mute'}
                      >
                        {muted[currentItem.id] ? (
                          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                    {(currentItem.title || currentItem.subtitle) && (
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 hidden xs:block">
                        {currentItem.title && (
                          <p className="text-white text-xs sm:text-sm font-medium">{currentItem.title}</p>
                        )}
                        {currentItem.subtitle && (
                          <p className="text-white text-[10px] sm:text-xs opacity-80">{currentItem.subtitle}</p>
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 sm:p-3 rounded-full shadow-lg transition-all z-50 active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 sm:p-3 rounded-full shadow-lg transition-all z-50 active:scale-95"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {visibleItems.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-50">
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

