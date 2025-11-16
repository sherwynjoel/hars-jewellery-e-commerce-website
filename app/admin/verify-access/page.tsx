'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'

function VerifyAdminAccessContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const token = searchParams?.get('token') || null
  const email = searchParams?.get('email') || null

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    // Check if email matches authorized admin
    if (session.user.email?.toLowerCase().trim() !== 'harsjewellery2005@gmail.com') {
      toast.error('Access denied')
      router.push('/')
      return
    }

    // Auto-verify if token is present
    if (token && email && !verifying && !verified) {
      verifyAccess()
    }
  }, [session, status, token, email])

  const verifyAccess = async () => {
    if (!token || !email) {
      setError('Missing verification token or email')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      })

      const data = await response.json()

      console.log('🔍 Verification response:', data)
      console.log('🔍 Response status:', response.status)

      if (!response.ok) {
        const errorMsg = data.error || 'Verification failed'
        console.error('❌ Verification failed:', errorMsg)
        console.error('❌ Full error data:', data)
        throw new Error(errorMsg)
      }

      console.log('✅ Verification successful!')
      setVerified(true)
      toast.success('Admin panel access verified!')
      
      // Redirect to admin panel after 2 seconds
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err: any) {
      console.error('❌ Verification error:', err)
      const errorMsg = err.message || 'Failed to verify access'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setVerifying(false)
    }
  }

  const requestVerification = async () => {
    try {
      setVerifying(true)
      setError(null)
      setEmailSent(false)
      
      const response = await fetch('/api/admin/request-access', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send verification email')
      }

      if (data.success && data.emailSent) {
        setEmailSent(true)
        setError(null)
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        throw new Error(data.message || 'Failed to send verification email')
      }
    } catch (err: any) {
      console.error('Verification request error:', err)
      // Only set error if we don't already have a verification link
      if (!verificationLink) {
        setError(err.message || 'Failed to send verification email')
        toast.error(err.message || 'Failed to send verification email')
      } else {
        // If we have a link, just show a warning
        toast.error('Email sending failed, but verification link is available below')
      }
    } finally {
      setVerifying(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12"
          >
            {verified ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Access Verified!
                </h1>
                <p className="text-gray-600 mb-8">
                  Your admin panel access has been verified. Redirecting you to the admin panel...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <XCircle className="w-12 h-12 text-red-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Verification Failed
                </h1>
                <p className="text-gray-600 mb-8">{error}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Please try requesting a new verification email.
                </p>
                <button
                  onClick={requestVerification}
                  disabled={verifying}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  {verifying ? 'Sending...' : 'Request New Verification Link'}
                </button>
              </div>
            ) : verifying ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Verifying Access...
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your admin panel access.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Mail className="w-12 h-12 text-blue-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Admin Panel Access Verification
                </h1>
                <p className="text-gray-600 mb-8">
                  To access the admin panel, you need to verify your access via email.
                  {token ? ' Verifying now...' : ' Click the button below to request a verification link.'}
                </p>
                
                {/* Show email sent confirmation */}
                {emailSent && !token && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-6 bg-green-50 rounded-lg border-2 border-green-400 shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-900">
                        ✅ Verification Email Sent!
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded border-2 border-green-300">
                      <p className="text-sm text-gray-700 mb-2">
                        Please check your inbox at <strong>harsjewellery2005@gmail.com</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        Click the verification link in the email to access the admin panel.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        ⏰ The link expires in 30 minutes
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {!token && !emailSent && (
                  <button
                    onClick={requestVerification}
                    disabled={verifying}
                    className="btn-primary px-8 py-3 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Verification Email
                      </>
                    )}
                  </button>
                )}
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                    <p className="text-xs text-red-500 mt-2">
                      Please try again. If the problem persists, check your email configuration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyAdminAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <VerifyAdminAccessContent />
    </Suspense>
  )
}

