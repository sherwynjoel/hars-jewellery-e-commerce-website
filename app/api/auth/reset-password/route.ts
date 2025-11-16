import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        resetPasswordToken: true,
        resetPasswordExpiresAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid reset link' }, { status: 404 })
    }

    // Check if token exists
    if (!user.resetPasswordToken) {
      return NextResponse.json(
        { error: 'No password reset request found. Please request a new reset link.' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (!user.resetPasswordExpiresAt || new Date() > user.resetPasswordExpiresAt) {
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.resetPasswordToken)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

