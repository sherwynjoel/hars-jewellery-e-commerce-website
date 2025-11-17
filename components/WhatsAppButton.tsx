'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  // Phone number: +91 98945 31805
  // WhatsApp format: country code + number without spaces or special characters
  const phoneNumber = '919894531805'
  const message = encodeURIComponent('Hello! I have a question about Hars Jewellery.')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <motion.div
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-black hover:bg-gray-900 active:bg-gray-800 text-white rounded-full p-2.5 sm:p-3 shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center touch-manipulation"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="ml-2 font-medium hidden lg:inline-block whitespace-nowrap text-xs tracking-wide">
          Ask Us
        </span>
        
        {/* Pulse animation ring */}
        <motion.span
          className="absolute inset-0 rounded-full bg-black -z-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </a>
    </motion.div>
  )
}

