import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Hars Jewellery - Premium Jewelry Collection',
  description: 'Discover our exquisite collection of premium jewelry. Handcrafted pieces that celebrate elegance and luxury.',
  keywords: 'jewelry, gold, diamonds, luxury, premium, handcrafted',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/hars%20logo.jpg', sizes: 'any' },
      { url: '/hars%20logo.jpg', type: 'image/jpeg', sizes: '32x32' },
      { url: '/hars%20logo.jpg', type: 'image/jpeg', sizes: '16x16' },
    ],
    apple: [
      { url: '/hars%20logo.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/hars%20logo.jpg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#7B68EE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
