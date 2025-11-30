'use client'

import { Component, ReactNode } from 'react'
import VideoShowcase from './VideoShowcase'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class SafeVideoShowcase extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VideoShowcase Error (caught):', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Silently fail - don't render anything if there's an error
      return null
    }

    return <VideoShowcase />
  }
}

export default SafeVideoShowcase

