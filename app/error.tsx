'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-gray-200 bg-white flex-shrink-0 shadow-lg">
              <Image
                src="/hars%20logo.jpg"
                alt="Hars Jewellery"
                width={80}
                height={80}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-dark-900">
              Hars Jewellery
            </span>
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-dark-900 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Please try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="btn-primary px-6 py-3"
            >
              Try again
            </button>
            <Link
              href="/"
              className="btn-secondary px-6 py-3 text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

