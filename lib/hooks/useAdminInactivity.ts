import { useEffect, useRef, useCallback, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // Show warning 5 minutes before logout
const UPDATE_INTERVAL = 1000 // Update remaining time every second for countdown

export function useAdminInactivity() {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [remainingMinutes, setRemainingMinutes] = useState(30)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }, [])

  const updateRemainingTime = useCallback(() => {
    const timeSinceActivity = Date.now() - lastActivityRef.current
    const remaining = INACTIVITY_TIMEOUT - timeSinceActivity
    const totalSeconds = Math.max(0, Math.floor(remaining / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    setRemainingMinutes(minutes)
    setRemainingSeconds(seconds)

    // Show warning if we're in the warning period
    if (timeSinceActivity >= INACTIVITY_TIMEOUT - WARNING_TIME) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [])

  const resetTimer = useCallback(() => {
    clearTimeouts()
    lastActivityRef.current = Date.now()
    setShowWarning(false)
    setRemainingMinutes(30)
    setRemainingSeconds(0)

    // Set warning timeout (25 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true)
    }, INACTIVITY_TIMEOUT - WARNING_TIME)

    // Set logout timeout (30 minutes)
    timeoutRef.current = setTimeout(async () => {
      // Clear admin verification before signing out
      try {
        await fetch('/api/auth/clear-admin-verification', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error clearing admin verification:', error)
      }

      // Sign out and redirect
      await signOut({ redirect: false })
      router.push('/auth/signin?reason=inactivity')
    }, INACTIVITY_TIMEOUT)

    // Update remaining time periodically
    updateIntervalRef.current = setInterval(updateRemainingTime, UPDATE_INTERVAL)
  }, [clearTimeouts, router, updateRemainingTime])

  useEffect(() => {
    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetTimer()
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Initialize timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearTimeouts()
    }
  }, [resetTimer, clearTimeouts])

  return {
    shouldShowWarning: showWarning,
    remainingMinutes,
    remainingSeconds,
    resetTimer
  }
}

