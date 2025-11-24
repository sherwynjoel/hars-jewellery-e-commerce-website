'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/share/1A1ZKbKNQm/?mibextid=wwXIfr' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/hars.jewellery?igsh=Y3Fva2R3NGZzd25o' },
    { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/channel/UCJyC6XsurT9Ux4bZ1UUyIrQ' }
  ]

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    const digits = phone.replace(/\D/g, '')

    if (digits.length !== 10) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit phone number.' })
      return
    }

    try {
      setSubmitting(true)
      setStatus(null)
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits })
      })
      const data = await response.json()
      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Thank you! We will reach out soon.' })
        setPhone('')
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to save phone number.' })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-700 bg-white">
                <Image src="/hars-logo.jpg" alt="Hars Jewellery" width={40} height={40} />
              </div>
              <span className="font-serif text-2xl font-bold">
                Hars Jewellery
              </span>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed text-center md:text-left">
              Crafting timeless elegance with every piece. Our jewelry celebrates life's most precious moments.
            </p>

            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300">
                <Mail className="w-5 h-5" />
                <span>harsjewellery2005@gmail.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300">
                <Phone className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>323 A3 Kumaran Ntr Complex 1st Floor, Raja Street, Coimbatore, Tamil Nadu - 641001, India</span>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300 mb-6">
                Share your phone number and we&apos;ll send exclusive offers and collection updates.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="Enter your 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed px-6 min-w-[120px]"
                >
                  {submitting ? 'Saving...' : 'Notify Me'}
                </button>
              </form>
              {status && (
                <p
                  className={`mt-3 text-sm ${
                    status.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {status.message}
                </p>
              )}
              <div className="mt-8">
                <h4 className="text-base font-semibold text-gray-100 mb-3">Policies &amp; Support</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/refund-policy" className="hover:text-white transition-colors">
                    Refund &amp; Cancellation
                  </Link>
                  <Link href="/shipping-policy" className="hover:text-white transition-colors">
                    Shipping Policy
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear || new Date().getFullYear()} Hars Jewellery. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Powered by section */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm text-center">
              Powered by <a href="https://thearktech.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">thearktech.in</a>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
