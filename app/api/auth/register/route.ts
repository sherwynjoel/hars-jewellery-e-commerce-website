import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateOtpCode, sendEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' }
    })

    // Generate and store email verification OTP
    const otp = generateOtpCode()
    const otpHash = await bcrypt.hash(otp, 12)
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: { verifyOtpHash: otpHash, verifyOtpExpiresAt: expires, lastOtpSentAt: new Date() }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Send verification email
    const emailResult = await sendEmail(
      email,
      'Verify your email - Hars Jewellery',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #B8860B;">Welcome to Hars Jewellery</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #B8860B; font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't create this account, please ignore this email.</p>
      </div>`
    )

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
      // Still return success but inform client email failed
      return NextResponse.json({ 
        ...userWithoutPassword, 
        verificationSent: false,
        error: 'Account created but email failed. Please check your email settings or contact support.'
      }, { status: 201 })
    }

    return NextResponse.json({ ...userWithoutPassword, verificationSent: true })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
