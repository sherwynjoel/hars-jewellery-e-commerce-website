import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, token, code } = await request.json()
    
    console.log('\n🔍 Email Verification Request:')
    console.log('📧 Email:', email)
    console.log('🔑 Token provided:', token ? 'Yes' : 'No')
    console.log('🔑 Code provided:', code ? 'Yes' : 'No')
    
    // Support both token-based (from email link) and code-based (OTP) verification
    if (!email || (!token && !code)) {
      console.log('❌ Missing fields')
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (!user.verifyOtpHash || !user.verifyOtpExpiresAt) {
      console.log('❌ No verification pending')
      console.log('   verifyOtpHash exists:', !!user.verifyOtpHash)
      console.log('   verifyOtpExpiresAt exists:', !!user.verifyOtpExpiresAt)
      return NextResponse.json({ error: 'No verification pending. Please request a new verification link.' }, { status: 400 })
    }

    // Check if token expired
    const expiryTime = new Date(user.verifyOtpExpiresAt).getTime()
    const now = Date.now()
    if (expiryTime < now) {
      console.log('❌ Token expired')
      console.log('   Expires at:', user.verifyOtpExpiresAt)
      console.log('   Current time:', new Date(now))
      return NextResponse.json({ 
        error: token 
          ? 'Verification link expired. Please request a new one.' 
          : 'Code expired' 
      }, { status: 400 })
    }

    // Verify token or code
    const verificationValue = token || code
    console.log('🔍 Comparing token...')
    const isValid = await bcrypt.compare(verificationValue, user.verifyOtpHash)
    
    if (!isValid) {
      console.log('❌ Token comparison failed')
      console.log('   Token length:', verificationValue?.length)
      console.log('   Hash exists:', !!user.verifyOtpHash)
      return NextResponse.json({ 
        error: token 
          ? 'Invalid verification link' 
          : 'Invalid code' 
      }, { status: 400 })
    }
    
    console.log('✅ Token is valid!')

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        verifyOtpHash: null,
        verifyOtpExpiresAt: null
      }
    })

    return NextResponse.json({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}


