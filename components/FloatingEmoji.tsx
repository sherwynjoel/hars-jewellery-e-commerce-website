'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function FloatingEmoji() {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => setReduceMotion(media.matches)
      setReduceMotion(media.matches)
      media.addEventListener?.('change', onChange)
      return () => media.removeEventListener?.('change', onChange)
    }
  }, [])

  return (
    <div
      className="fixed bottom-6 left-6 z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div className="relative">
        {/* Soft glow ring */}
        <div 
          className="absolute inset-0 -z-10 rounded-full blur-2xl animate-pulse-glow"
          style={{ 
            boxShadow: '0 0 50px 15px rgba(123,104,238,0.3)',
            width: '80px',
            height: '80px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }} 
        />

        {/* Emoji bubble */}
        <motion.div
          className="glass-effect shadow-premium rounded-full w-16 h-16 flex items-center justify-center border-2 border-purple-300/50 select-none bg-gradient-to-br from-white/95 to-purple-50/80 backdrop-blur-xl pointer-events-auto"
          title="Hello! 👋"
          animate={reduceMotion ? {} : {
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.15,
            rotate: 10
          }}
        >
          <span className="text-3xl" role="img" aria-label="cool-emoji">😎</span>
        </motion.div>
      </div>
    </div>
  )
}


