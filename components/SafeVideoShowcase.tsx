'use client'

import { Component, ReactNode } from 'react'
import VideoShowcase from './VideoShowcase'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class SafeVideoShowcase extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('SafeVideoShowcase: Error caught:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VideoShowcase Error (caught):', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI instead of returning null
      console.warn('SafeVideoShowcase: Rendering fallback due to error')
      return (
        <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
                Our Collection
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our exquisite range of handcrafted jewelry pieces.
              </p>
            </div>
            <div className="relative">
              <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">Video section loading...</p>
                    <p className="text-gray-400 text-sm">Please refresh the page</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    try {
      return <VideoShowcase />
    } catch (error) {
      console.error('SafeVideoShowcase: Error rendering VideoShowcase:', error)
      // Return fallback UI
      return (
        <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-4">
                Our Collection
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our exquisite range of handcrafted jewelry pieces.
              </p>
            </div>
            <div className="relative">
              <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">Video section unavailable</p>
                    <p className="text-gray-400 text-sm">Please check console for errors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }
}

export default SafeVideoShowcase

