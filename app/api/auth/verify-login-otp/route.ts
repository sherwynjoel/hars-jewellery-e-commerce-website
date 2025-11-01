import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.emailVerifiedAt || !user.loginOtpHash || !user.loginOtpExpiresAt) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (new Date(user.loginOtpExpiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    const ok = await bcrypt.compare(code, user.loginOtpHash)
    if (!ok) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await prisma.user.update({
      where: { id: user.id },
      data: { loginOtpHash: null, loginOtpExpiresAt: null, otpAttemptCount: 0 }
    })

    // Client should now call NextAuth signIn('credentials', { mode: 'otp', email, otp: code })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}


