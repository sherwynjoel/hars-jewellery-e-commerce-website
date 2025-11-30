import { useEffect, useRef, useState, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes
const WARNING_TIME = 5 * 60 * 1000 // warn 5 minutes before logout
const UPDATE_INTERVAL = 1000

export function useAdminInactivity() {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const deadlineRef = useRef<number>(Date.now() + SESSION_DURATION)

  // Reset timers when user activity is detected
  const resetTimers = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    deadlineRef.current = now + SESSION_DURATION
    setShowWarning(false)

    // Clear existing timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current)
    }

    // Set new warning timer (25 minutes from now)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, SESSION_DURATION - WARNING_TIME)

    // Set new logout timer (30 minutes from now)
    logoutTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/auth/clear-admin-verification', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error clearing admin verification:', error)
      }

      await signOut({ redirect: false })
      router.push('/auth/signin?reason=session_expired')
    }, SESSION_DURATION)
  }, [router])

  // Track user activity
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ]

    const handleActivity = () => {
      resetTimers()
    }

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initialize timers
    resetTimers()

    // Update remaining time every second
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now())
      setRemainingMs(remaining)

      // If time is up, the logout timer should have fired, but check anyway
      if (remaining === 0) {
        setShowWarning(false)
      }
    }, UPDATE_INTERVAL)

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resetTimers])

  const remainingMinutes = Math.floor(remainingMs / 60000)
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000)

  return {
    shouldShowWarning: showWarning,
    remainingMinutes,
    remainingSeconds,
  }
}

