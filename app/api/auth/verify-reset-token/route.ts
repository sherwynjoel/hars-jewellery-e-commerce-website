import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * Verify password reset token
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 })
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

    return NextResponse.json({
      success: true,
      message: 'Reset token is valid'
    })
  } catch (error: any) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { error: 'Failed to verify reset token' },
      { status: 500 }
    )
  }
}

