'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'

interface Testimonial {
  id: string
  customerName: string
  title?: string | null
  content: string
  imageUrl: string
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
    layoutEffect: false
  })
  const slowTrack = useSpring(
    useTransform(scrollYProgress, [0, 1], ['8%', '-12%']),
    { stiffness: 80, damping: 20, mass: 0.8 }
  )
  const fastTrack = useSpring(
    useTransform(scrollYProgress, [0, 1], ['-12%', '16%']),
    { stiffness: 80, damping: 20, mass: 0.8 }
  )

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to load testimonials')
        const data = await response.json()
        setTestimonials(Array.isArray(data) ? data : [])
      } catch (error) {
        console.warn(error)
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const parallaxRows = useMemo(() => {
    const firstRow = testimonials.filter((_, index) => index % 2 === 0)
    const secondRow = testimonials.filter((_, index) => index % 2 === 1)
    return { firstRow, secondRow }
  }, [testimonials])

  if (!loading && testimonials.length === 0) {
    return null
  }

  const Card = ({
    testimonial,
    index,
    variant = 'parallax'
  }: {
    testimonial: Testimonial
    index: number
    variant?: 'parallax' | 'grid'
  }) => (
    <motion.div
      key={`${variant}-${testimonial.id}-${index}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`relative p-8 rounded-[32px] bg-white shadow-premium border border-gray-100 overflow-hidden ${
        variant === 'parallax'
          ? 'min-w-[320px] max-w-[360px] flex-shrink-0'
          : ''
      }`}
    >
      <div className="absolute top-6 right-6 text-5xl text-gray-200 font-serif select-none">
        “
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          <Image
            src={testimonial.imageUrl || '/placeholder-jewelry.jpg'}
            alt={testimonial.customerName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <p className="mt-6 text-lg sm:text-xl text-gray-700 leading-relaxed italic">
          “{testimonial.content}”
        </p>
        <div className="mt-6">
          <p className="text-lg font-semibold text-gray-900">
            {testimonial.customerName}
          </p>
          {testimonial.title && (
            <p className="text-sm text-gray-500">{testimonial.title}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <section ref={sectionRef} className="pt-12 pb-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500 mb-4">
              Customers Speak
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
              Loved by Jewellery Connoisseurs
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from families who chose Hars Jewellery to celebrate their milestone moments.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100 animate-pulse h-80"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:flex flex-col gap-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {parallaxRows.firstRow.length > 0 && (
                <motion.div style={{ x: slowTrack }} className="flex gap-8">
                  {parallaxRows.firstRow.map((testimonial, index) => (
                    <Card
                      key={`first-${testimonial.id}`}
                      testimonial={testimonial}
                      index={index}
                      variant="parallax"
                    />
                  ))}
                </motion.div>
              )}

              {parallaxRows.secondRow.length > 0 && (
                <motion.div style={{ x: fastTrack }} className="flex gap-8 justify-end">
                  {parallaxRows.secondRow.map((testimonial, index) => (
                    <Card
                      key={`second-${testimonial.id}`}
                      testimonial={testimonial}
                      index={index}
                      variant="parallax"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={`mobile-${testimonial.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative p-6 rounded-[28px] bg-white shadow-premium border border-gray-100 overflow-hidden ${
                      index % 4 === 1 || index % 4 === 2 ? 'mt-4' : ''
                    }`}
                  >
                    <div className="absolute top-4 right-4 text-4xl text-gray-200 font-serif select-none">
                      "
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-100">
                        <Image
                          src={testimonial.imageUrl || '/placeholder-jewelry.jpg'}
                          alt={testimonial.customerName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-4 text-sm text-gray-700 leading-relaxed italic line-clamp-3">
                        "{testimonial.content}"
                      </p>
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {testimonial.customerName}
                        </p>
                        {testimonial.title && (
                          <p className="text-xs text-gray-500 mt-1">{testimonial.title}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

