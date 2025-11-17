'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false
      })

      if (result?.error) {
        // Show specific error message if it's about email verification
        if (result.error.includes('verify your email')) {
          toast.error(result.error)
        } else {
          toast.error('Invalid email or password')
        }
      } else if (result?.ok) {
        toast.success('Welcome back!')
        router.push('/')
        router.refresh()
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      toast.error('Enter a valid email to resend verification.')
      return
    }

    try {
      setResending(true)
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || 'Verification email sent. Please check your inbox.')
      } else {
        toast.error(data.error || 'Could not resend verification email.')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card-elevated p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dark-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to your account to continue shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full btn-secondary py-3 text-sm gap-2 flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-black hover:text-gray-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

