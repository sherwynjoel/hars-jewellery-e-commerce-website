import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Admin security configuration
const ADMIN_SECURITY_CONFIG = {
  // Rate limiting: max requests per window
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // Max 100 requests per 15 minutes
  
  // Login attempt limits
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  
  // Session timeout for admin (shorter than regular users)
  ADMIN_SESSION_TIMEOUT_MS: 2 * 60 * 60 * 1000, // 2 hours (vs 30 days for regular users)
  
  // IP whitelist (optional, set in env)
  ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS?.split(',') || [],
  
  // Admin email restriction - ONLY this email can access admin panel
  ALLOWED_ADMIN_EMAIL: 'harsjewellery2005@gmail.com',
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (remoteAddr) {
    return remoteAddr
  }
  return 'unknown'
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    // Create new rate limit record
    const resetTime = now + ADMIN_SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(identifier, { count: 1, resetTime })
    
    // Clean up old entries periodically
    if (rateLimitStore.size > 1000) {
      for (const [key, value] of Array.from(rateLimitStore.entries())) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key)
        }
      }
    }
    
    return { allowed: true, remaining: ADMIN_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - 1, resetTime }
  }
  
  if (record.count >= ADMIN_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: ADMIN_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - record.count, resetTime: record.resetTime }
}

/**
 * Check if admin account is locked
 */
async function isAdminLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adminLoginLockedUntil: true }
  })
  
  if (!user || !user.adminLoginLockedUntil) {
    return false
  }
  
  if (new Date() > user.adminLoginLockedUntil) {
    // Lock expired, reset
    await prisma.user.update({
      where: { id: userId },
      data: {
        adminLoginLockedUntil: null,
        adminLoginAttempts: 0
      }
    })
    return false
  }
  
  return true
}

/**
 * Record failed admin login attempt
 */
export async function recordFailedAdminLogin(userId: string, ipAddress: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { adminLoginAttempts: true }
  })
  
  if (!user) return
  
  const attempts = (user.adminLoginAttempts || 0) + 1
  const lockUntil = attempts >= ADMIN_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS
    ? new Date(Date.now() + ADMIN_SECURITY_CONFIG.LOCKOUT_DURATION_MS)
    : null
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      adminLoginAttempts: attempts,
      adminLoginLockedUntil: lockUntil,
      lastAdminLoginIp: ipAddress
    }
  })
  
  // Log the failed attempt
  await logAdminActivity(userId, 'FAILED_LOGIN_ATTEMPT', null, null, ipAddress, null, {
    attempts,
    locked: !!lockUntil
  })
}

/**
 * Record successful admin login
 */
export async function recordSuccessfulAdminLogin(userId: string, ipAddress: string, userAgent: string | null) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      adminLoginAttempts: 0,
      adminLoginLockedUntil: null,
      lastAdminLoginAt: new Date(),
      lastAdminLoginIp: ipAddress
    }
  })
  
  await logAdminActivity(userId, 'LOGIN_SUCCESS', null, null, ipAddress, userAgent, null)
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  userId: string,
  action: string,
  resource: string | null,
  resourceId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  details: any
) {
  try {
    await prisma.adminActivity.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        details: details ? JSON.stringify(details) : null
      }
    })
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log admin activity:', error)
  }
}

/**
 * Main admin security middleware
 */
export async function verifyAdminAccess(
  request: NextRequest,
  action: string = 'ACCESS',
  resource: string | null = null,
  resourceId: string | null = null
): Promise<{ authorized: boolean; response?: NextResponse; userId?: string }> {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Please sign in' },
          { status: 401 }
        )
      }
    }
    
    // 2. Check admin role
    if (session.user.role !== 'ADMIN') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        )
      }
    }
    
    // 2.5. Check if email matches the allowed admin email (STRICT RESTRICTION)
    const userEmail = session.user.email?.toLowerCase().trim()
    const allowedEmail = ADMIN_SECURITY_CONFIG.ALLOWED_ADMIN_EMAIL.toLowerCase().trim()
    
    if (userEmail !== allowedEmail) {
      const userId = session.user.id
      const ipAddress = getClientIp(request)
      const userAgent = request.headers.get('user-agent')
      
      // Log unauthorized admin access attempt
      await logAdminActivity(userId, 'UNAUTHORIZED_ADMIN_ACCESS', null, null, ipAddress, userAgent, {
        reason: 'Email not in allowed admin list',
        attemptedEmail: userEmail,
        allowedEmail: allowedEmail
      })
      
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Access denied - Admin access restricted to authorized email only' },
          { status: 403 }
        )
      }
    }
    
    const userId = session.user.id
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent')
    
    // 3. Check if account is locked
    if (await isAdminLocked(userId)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Account temporarily locked due to too many failed login attempts. Please try again later.' },
          { status: 423 } // 423 Locked
        )
      }
    }
    
    // 4. IP whitelist check (if configured)
    if (ADMIN_SECURITY_CONFIG.ALLOWED_IPS.length > 0 && !ADMIN_SECURITY_CONFIG.ALLOWED_IPS.includes(ipAddress)) {
      await logAdminActivity(userId, 'BLOCKED_IP_ACCESS', null, null, ipAddress, userAgent, {
        reason: 'IP not in whitelist',
        attemptedIp: ipAddress
      })
      
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Access denied from this IP address' },
          { status: 403 }
        )
      }
    }
    
    // 5. Check admin panel verification (always check for admin panel access)
    // Skip verification check only for REQUEST_ADMIN_ACCESS action
    if (action !== 'REQUEST_ADMIN_ACCESS') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { adminPanelVerifiedAt: true }
      })

      if (!user) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
      }

      // Check if verification exists (required on each login - no expiry)
      // Verification is cleared on sign out, so admin must verify again on each login
      const isVerified = !!user.adminPanelVerifiedAt

      if (!isVerified) {
        return {
          authorized: false,
          response: NextResponse.json(
            { 
              error: 'Admin panel access not verified',
              requiresVerification: true,
              message: 'Please verify your admin panel access via email. Visit /admin/verify-access to request verification.'
            },
            { status: 403 }
          )
        }
      }
    }
    
    // 6. Rate limiting check
    const rateLimitKey = `admin:${userId}:${ipAddress}`
    const rateLimit = checkRateLimit(rateLimitKey)
    
    if (!rateLimit.allowed) {
      await logAdminActivity(userId, 'RATE_LIMIT_EXCEEDED', null, null, ipAddress, userAgent, {
        resetTime: new Date(rateLimit.resetTime).toISOString()
      })
      
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': ADMIN_SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetTime.toString()
            }
          }
        )
      }
    }
    
    // 7. Log the activity
    await logAdminActivity(userId, action, resource, resourceId, ipAddress, userAgent, null)
    
    return {
      authorized: true,
      userId
    }
  } catch (error) {
    console.error('Admin security check error:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Get admin activity logs
 */
export async function getAdminActivityLogs(
  userId?: string,
  limit: number = 100,
  offset: number = 0
) {
  const where = userId ? { userId } : {}
  
  const [activities, total] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.adminActivity.count({ where })
  ])
  
  return { activities, total, limit, offset }
}

/**
 * Check if admin session is still valid (shorter timeout)
 */
export async function isAdminSessionValid(session: any): Promise<boolean> {
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return false
  }
  
  // Check if user still exists and is still admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, adminLoginLockedUntil: true }
  })
  
  if (!user || user.role !== 'ADMIN') {
    return false
  }
  
  // Check if account is locked
  if (user.adminLoginLockedUntil && new Date() < user.adminLoginLockedUntil) {
    return false
  }
  
  return true
}

