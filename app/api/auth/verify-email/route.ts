import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.verifyOtpHash || !user.verifyOtpExpiresAt) {
      return NextResponse.json({ error: 'No verification pending' }, { status: 400 })
    }

    if (new Date(user.verifyOtpExpiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    const ok = await bcrypt.compare(code, user.verifyOtpHash)
    if (!ok) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), verifyOtpHash: null, verifyOtpExpiresAt: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}


