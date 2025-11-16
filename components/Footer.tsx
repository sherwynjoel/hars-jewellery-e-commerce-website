'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Crown, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
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
                <Image src="/hars%20logo.jpg" alt="Hars Jewellery" width={40} height={40} />
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
                Subscribe to our newsletter for exclusive offers and new collection updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
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
              © {currentYear} Hars Jewellery. All rights reserved.
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
