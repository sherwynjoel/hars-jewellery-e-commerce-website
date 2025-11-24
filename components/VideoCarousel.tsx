'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface VideoCarouselItem {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
  type?: string
}

export default function VideoCarousel() {
  const [items, setItems] = useState<VideoCarouselItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({})
  const [muted, setMuted] = useState<{ [key: string]: boolean }>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/video-carousel', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to fetch video carousel:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
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

  const toggleFullscreen = (itemId: string) => {
    const video = videoRefs.current[itemId]
    if (video) {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          video.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
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

  if (items.length === 0) {
    return null
  }

  const visibleItems = items.filter((item) => item.isActive)
  if (visibleItems.length === 0) return null

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
            Our Collection
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite range of handcrafted jewelry pieces.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative" ref={containerRef}>
          <div className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              {visibleItems.map((item, index) => {
                const isActive = index === currentIndex
                const isPrev = index === (currentIndex - 1 + visibleItems.length) % visibleItems.length
                const isNext = index === (currentIndex + 1) % visibleItems.length
                const isVisible = isActive || isPrev || isNext

                if (!isVisible) return null

                const offset = index - currentIndex
                const absOffset = Math.abs(offset)
                const isLeft = offset < 0
                const isRight = offset > 0

                // Calculate position and scale
                let translateX = 0
                let scale = 0.85
                let zIndex = 10
                let opacity = 0.6

                if (isActive) {
                  translateX = 0
                  scale = 1
                  zIndex = 30
                  opacity = 1
                } else if (isLeft) {
                  translateX = -30
                  scale = 0.75
                  zIndex = 20 - absOffset
                  opacity = 0.4
                } else if (isRight) {
                  translateX = 30
                  scale = 0.75
                  zIndex = 20 - absOffset
                  opacity = 0.4
                }

                return (
                  <motion.div
                    key={item.id}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                      x: `${translateX}%`,
                      scale,
                      opacity,
                      zIndex,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      width: '90%',
                      maxWidth: '800px',
                      height: '90%',
                    }}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
                      {item.type === 'image' ? (
                        <>
                          <Image
                            src={item.url}
                            alt={item.title || 'Carousel image'}
                            fill
                            className="object-cover"
                            quality={100}
                            unoptimized={false}
                            priority
                          />
                          {/* Title Overlay for Images */}
                          {item.title && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white text-center drop-shadow-2xl">
                                {item.title}
                              </h3>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <video
                            ref={(el) => {
                              videoRefs.current[item.id] = el
                            }}
                            src={item.url}
                            className="w-full h-full object-cover"
                            loop
                            muted={muted[item.id] ?? true}
                            playsInline
                            onPlay={() => handleVideoPlay(item.id)}
                            onPause={() => handleVideoPause(item.id)}
                          />
                          {/* Video Controls Overlay */}
                          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
                            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                              <button
                                onClick={() => togglePlay(item.id)}
                                className="text-white hover:text-gray-200 transition-colors"
                                aria-label={playing[item.id] ? 'Pause' : 'Play'}
                              >
                                {playing[item.id] ? (
                                  <Pause className="w-5 h-5" />
                                ) : (
                                  <Play className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => toggleMute(item.id)}
                                className="text-white hover:text-gray-200 transition-colors ml-2"
                                aria-label={muted[item.id] ? 'Unmute' : 'Mute'}
                              >
                                {muted[item.id] ? (
                                  <VolumeX className="w-5 h-5" />
                                ) : (
                                  <Volume2 className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => toggleFullscreen(item.id)}
                                className="text-white hover:text-gray-200 transition-colors ml-2"
                                aria-label="Fullscreen"
                              >
                                <Maximize className="w-5 h-5" />
                              </button>
                              <button className="text-white hover:text-gray-200 transition-colors ml-2">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                            {item.title && (
                              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-white text-sm font-medium">{item.title}</p>
                              </div>
                            )}
                          </div>

                          {/* Title Overlay */}
                          {item.title && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white text-center drop-shadow-2xl">
                                {item.title}
                              </h3>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

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
                      index === currentIndex
                        ? 'bg-white h-2 w-8'
                        : 'bg-white/60 hover:bg-white/80 h-2 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
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

