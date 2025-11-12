'use client'

import { SessionProvider } from 'next-auth/react'
import WhatsAppButton from '@/components/WhatsAppButton'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <WhatsAppButton />
    </SessionProvider>
  )
}
