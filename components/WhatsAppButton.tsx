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
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851] text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-[#25D366]/50 active:scale-95 transition-all duration-300 flex items-center justify-center group touch-manipulation"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="ml-2 font-medium hidden md:inline-block group-hover:block whitespace-nowrap text-sm sm:text-base">
          Ask Us
        </span>
        
        {/* Pulse animation ring */}
        <motion.span
          className="absolute inset-0 rounded-full bg-[#25D366] -z-10"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
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

