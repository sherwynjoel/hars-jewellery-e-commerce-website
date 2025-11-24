'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { shouldUnoptimizeImage } from '@/lib/image-utils'

interface SlideshowImage {
  id: string
  url: string
  title?: string | null
  subtitle?: string | null
  position: number
  isActive: boolean
}

export default function HeroSlideshow() {
  const [images, setImages] = useState<SlideshowImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (images.length > 1) {
      // Longer interval on mobile for better UX, pause on touch
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
      const intervalTime = isMobile ? 7000 : 5000 // 7 seconds on mobile, 5 on desktop
      
      // Pause auto-play when user is interacting
      let pauseTimer: NodeJS.Timeout | null = null
      const handleInteraction = () => {
        if (pauseTimer) clearTimeout(pauseTimer)
        pauseTimer = setTimeout(() => {
          pauseTimer = null
        }, 10000) // Resume after 10 seconds of no interaction
      }
      
      const interval = setInterval(() => {
        if (!pauseTimer) {
          setCurrentIndex((prev) => {
            if (images.length === 0) return 0
            return (prev + 1) % images.length
          })
        }
      }, intervalTime)
      
      // Add event listeners for user interaction
      const container = containerRef.current
      if (container) {
        container.addEventListener('touchstart', handleInteraction)
        container.addEventListener('touchmove', handleInteraction)
      }
      
      return () => {
        clearInterval(interval)
        if (pauseTimer) clearTimeout(pauseTimer)
        if (container) {
          container.removeEventListener('touchstart', handleInteraction)
          container.removeEventListener('touchmove', handleInteraction)
        }
      }
    }
  }, [images.length])

  // Reset currentIndex if it's out of bounds
  useEffect(() => {
    if (images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0)
    }
  }, [images.length, currentIndex])

  const fetchImages = async () => {
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/slideshow', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      // Ensure data is an array
      setImages(Array.isArray(data) ? data : [])
      setCurrentIndex(0)
    } catch (error: any) {
      console.error('Failed to fetch slideshow images:', error)
      setImages([]) // Set empty array on error
    } finally {
      setLoading(false) // Always set loading to false
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Swipe gesture handlers for mobile - optimized
  const minSwipeDistance = 30 // Reduced for easier mobile swiping

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    
    // Prevent scroll if user is swiping horizontally
    const distance = Math.abs(touchStart - currentTouch)
    if (distance > 10) {
      e.preventDefault() // Prevent vertical scroll during horizontal swipe
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && images.length > 1) {
      goToNext()
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious()
    }
  }

  if (loading) {
    return (
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-gray-100/80 to-white rounded-2xl sm:rounded-[3rem] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-black"></div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-gray-100/80 to-white rounded-2xl sm:rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl border-2 border-gray-200/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-xs sm:text-base md:text-lg font-medium">No slideshow images yet</p>
          <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 px-2">Upload images in the admin panel to display them here</p>
        </div>
      </div>
    )
  }

  const currentImage = images[currentIndex]
  if (!currentImage) {
    return (
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-gray-100/80 to-white rounded-2xl sm:rounded-[3rem] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xs sm:text-base md:text-lg">Loading slideshow...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl sm:rounded-2xl md:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-2xl border border-gray-200 sm:border-2 sm:border-gray-200/50"
      style={{ touchAction: 'pan-y pinch-zoom' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full"
        >
          <Image
            src={currentImage.url}
            alt={currentImage.title || 'Slideshow image'}
            fill
            className="object-cover object-center"
            priority={currentIndex === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            quality={85}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            unoptimized={shouldUnoptimizeImage(currentImage.url)}
          />
          
          {/* Overlay for text readability - Stronger on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent sm:from-black/60 sm:via-black/20"></div>
          
          {/* Text overlay - Optimized for mobile */}
          {(currentImage.title || currentImage.subtitle) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 text-white pb-safe">
              {currentImage.title && (
                <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-1.5 sm:mb-2 leading-tight drop-shadow-lg">
                  {currentImage.title}
                </h2>
              )}
              {currentImage.subtitle && (
                <p className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 leading-relaxed mt-1 sm:mt-1.5 drop-shadow-md">
                  {currentImage.subtitle}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Hidden on mobile, visible on larger screens */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 md:p-2.5 rounded-full shadow-lg transition-all z-10 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 md:p-2.5 rounded-full shadow-lg transition-all z-10 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Optimized for mobile touch */}
      {images.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 z-10 px-3 py-2 sm:px-4 sm:py-2.5 bg-black/40 sm:bg-black/30 md:bg-black/20 backdrop-blur-md rounded-full">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all touch-manipulation ${
                index === currentIndex
                  ? 'bg-white h-2.5 w-6 sm:h-2 sm:w-6 md:w-8'
                  : 'bg-white/70 active:bg-white/90 h-2.5 w-2.5 sm:h-2 sm:w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              style={{ 
                minWidth: index === currentIndex ? '24px' : '10px', 
                minHeight: '10px',
                touchAction: 'manipulation'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

