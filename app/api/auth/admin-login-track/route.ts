import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { recordSuccessfulAdminLogin, recordFailedAdminLogin } from '@/lib/admin-security'

/**
 * Track admin login attempts
 * This endpoint should be called after login attempts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { success, ipAddress } = await request.json()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 403 })
    }
    
    const userAgent = request.headers.get('user-agent')
    const clientIp = ipAddress || request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown'
    
    if (success) {
      await recordSuccessfulAdminLogin(session.user.id, clientIp, userAgent)
    } else {
      await recordFailedAdminLogin(session.user.id, clientIp)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking admin login:', error)
    return NextResponse.json({ error: 'Failed to track login' }, { status: 500 })
  }
}

