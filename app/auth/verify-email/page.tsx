'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      console.log('🔍 Frontend: Extracting verification data from URL')
      console.log('📧 Email from URL:', email)
      console.log('🔑 Token from URL:', token ? `${token.substring(0, 20)}...` : 'Missing')
      console.log('🔑 Token length:', token?.length)

      if (!token || !email) {
        console.log('❌ Frontend: Missing token or email')
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        console.log('📤 Frontend: Sending verification request...')
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()
        
        console.log('📥 Frontend: Received response')
        console.log('   Status:', response.status)
        console.log('   Success:', response.ok)
        console.log('   Data:', data)

        if (response.ok) {
          console.log('✅ Frontend: Verification successful!')
          setStatus('success')
          setMessage('Email verified successfully!')
          toast.success('Email verified! You can now sign in.')
          setTimeout(() => {
            router.push('/auth/signin')
          }, 2000)
        } else {
          console.log('❌ Frontend: Verification failed')
          console.log('   Error:', data.error)
          setStatus('error')
          setMessage(data.error || 'Verification failed')
          toast.error(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred. Please try again.')
        toast.error('An error occurred')
      }
    }

    verifyEmail()
  }, [searchParams, router])

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
                src="/logo%20hars.png" 
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
          className="card-elevated p-8 sm:p-10 text-center"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-gray-400" />
              <h1 className="text-2xl font-bold text-dark-900 mb-2">Verifying Email...</h1>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold text-dark-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold text-dark-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                href="/auth/signin"
                className="btn-primary inline-block px-6 py-3"
              >
                Go to Sign In
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

