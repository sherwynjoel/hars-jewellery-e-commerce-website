import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess, logAdminActivity } from '@/lib/admin-security'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * Verify admin panel access token
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    console.log('\n🔍 ==========================================')
    console.log('🔍 VERIFICATION ATTEMPT')
    console.log('🔍 ==========================================')
    console.log('📧 Email:', email)
    console.log('🔑 Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'MISSING')
    console.log('🔍 ==========================================\n')

    if (!token || !email) {
      console.error('❌ Missing token or email')
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    console.log('📧 Normalized email:', normalizedEmail)

    // Find user by email (use findFirst as fallback if findUnique fails)
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          role: true,
          adminPanelVerifyToken: true,
          adminPanelVerifyExpiresAt: true
        }
      })
    } catch (prismaError: any) {
      console.error('❌ Prisma findUnique error:', prismaError.message)
      // Fallback to findFirst
      console.log('🔄 Trying findFirst as fallback...')
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          role: true,
          adminPanelVerifyToken: true,
          adminPanelVerifyExpiresAt: true
        }
      })
    }

    if (!user) {
      console.error('❌ User not found for email:', normalizedEmail)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', user.email)
    console.log('👤 User role:', user.role)
    console.log('🔑 Has token in DB:', !!user.adminPanelVerifyToken)
    console.log('⏰ Token expires at:', user.adminPanelVerifyExpiresAt)

    // Check if user is authorized admin
    if (user.role !== 'ADMIN' || normalizedEmail !== 'harsjewellery2005@gmail.com') {
      console.error('❌ Unauthorized - Role:', user.role, 'Email match:', normalizedEmail === 'harsjewellery2005@gmail.com')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if token exists
    if (!user.adminPanelVerifyToken) {
      console.error('❌ No verification token found in database')
      console.error('💡 User needs to request a new verification link')
      return NextResponse.json(
        { error: 'No verification token found. Please request a new verification link.' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (!user.adminPanelVerifyExpiresAt || new Date() > user.adminPanelVerifyExpiresAt) {
      console.error('❌ Token expired')
      console.error('⏰ Expires at:', user.adminPanelVerifyExpiresAt)
      console.error('⏰ Current time:', new Date())
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification link.' },
        { status: 400 }
      )
    }

    // Verify token
    console.log('🔍 Comparing token...')
    const isValid = await bcrypt.compare(token, user.adminPanelVerifyToken)
    console.log('🔍 Token valid:', isValid)
    
    if (!isValid) {
      console.error('❌ Invalid token - token does not match database')
      // Log failed verification attempt (don't let this fail the request)
      try {
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-real-ip') || 'unknown'
        await logAdminActivity(user.id, 'FAILED_ADMIN_VERIFICATION', null, null, ipAddress, request.headers.get('user-agent'), {
          reason: 'Invalid token'
        })
      } catch (logError) {
        console.error('Failed to log activity (non-critical):', logError)
      }

      return NextResponse.json(
        { error: 'Invalid verification token. Please request a new verification link.' },
        { status: 400 }
      )
    }

    console.log('✅ Token is valid! Verifying access...')

    // Mark admin panel as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        adminPanelVerifiedAt: new Date(),
        adminPanelVerifyToken: null,
        adminPanelVerifyExpiresAt: null
      }
    })

    console.log('✅ Admin panel access verified successfully!')

    // Log successful verification (don't let this fail the request)
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 'unknown'
      await logAdminActivity(user.id, 'ADMIN_PANEL_VERIFIED', null, null, ipAddress, request.headers.get('user-agent'), null)
    } catch (logError) {
      console.error('Failed to log activity (non-critical):', logError)
    }

    console.log('🔍 ==========================================\n')

    return NextResponse.json({
      success: true,
      message: 'Admin panel access verified successfully. You can now access the admin panel.',
      verifiedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('\n❌ ==========================================')
    console.error('❌ VERIFICATION ERROR')
    console.error('❌ ==========================================')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('❌ ==========================================\n')
    return NextResponse.json(
      { 
        error: 'Failed to verify access',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

