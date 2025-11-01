import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateOtpCode, sendEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!user.emailVerifiedAt) return NextResponse.json({ error: 'Email not verified' }, { status: 400 })

    const now = Date.now()
    if (user.lastOtpSentAt && new Date(user.lastOtpSentAt).getTime() > now - 30_000) {
      return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 })
    }

    const otp = generateOtpCode()
    const otpHash = await bcrypt.hash(otp, 12)
    const expires = new Date(now + 10 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { loginOtpHash: otpHash, loginOtpExpiresAt: expires, lastOtpSentAt: new Date(), otpAttemptCount: 0 }
    })

    const emailResult = await sendEmail(
      email,
      'Your login code - Hars Jewellery',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #B8860B;">Login Code</h2>
        <p>Your login code is:</p>
        <h1 style="color: #B8860B; font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
      </div>`
    )

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send email. Please check your email settings or contact support.',
        details: emailResult.error 
      }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}


