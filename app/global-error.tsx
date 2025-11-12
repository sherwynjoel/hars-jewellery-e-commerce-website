'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
              <h1 className="text-3xl font-bold text-dark-900 mb-4">Critical Error</h1>
              <p className="text-gray-600 mb-6">
                A critical error occurred. Please refresh the page or try again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={reset}
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

