'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function TestInvoicePage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    if (!email || !email.includes('@')) {
      setResult({ success: false, message: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setResult({ 
          success: true, 
          message: `✅ Test invoice email sent successfully to ${email}! Check your inbox.` 
        })
        setEmail('')
      } else {
        setResult({ 
          success: false, 
          message: `❌ Failed to send email: ${data.error || data.message}` 
        })
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `❌ Error: ${error.message || 'Unknown error'}` 
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to test invoice emails.</p>
          <a 
            href="/auth/signin" 
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-dark-900 mb-2">
              Test Invoice Email
            </h1>
            <p className="text-gray-600">
              Send a test invoice email to verify the email system is working
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
              {session?.user?.email && (
                <button
                  type="button"
                  onClick={() => setEmail(session.user.email || '')}
                  className="mt-2 text-sm text-gray-600 hover:text-black underline"
                  disabled={loading}
                >
                  Use my email ({session.user.email})
                </button>
              )}
            </div>

            <button
              onClick={handleTest}
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Test Invoice Email
                </>
              )}
            </button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This will send a test invoice email using a sample order. Check your inbox and spam folder.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

