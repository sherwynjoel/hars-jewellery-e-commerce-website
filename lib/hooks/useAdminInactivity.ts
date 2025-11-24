import { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    const startTime = Date.now()
    const deadline = startTime + SESSION_DURATION

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, SESSION_DURATION - WARNING_TIME)

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

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now())
      setRemainingMs(remaining)
    }, UPDATE_INTERVAL)

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [router])

  const remainingMinutes = Math.floor(remainingMs / 60000)
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000)

  return {
    shouldShowWarning: showWarning,
    remainingMinutes,
    remainingSeconds,
  }
}

