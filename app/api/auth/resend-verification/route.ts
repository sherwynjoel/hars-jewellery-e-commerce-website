import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body?.email?.toLowerCase()?.trim()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Email is already verified. You can sign in directly.' })
    }

    await sendVerificationEmail(user)

    return NextResponse.json({ message: 'Verification email sent. Please check your inbox.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email.' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyOtpHash: await bcrypt.hash(verificationToken, 10),
        verifyOtpExpiresAt: expiresAt,
      }
    })

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Log verification link for testing (remove in production)
    console.log('\n📧 ==========================================')
    console.log('📧 RESEND VERIFICATION LINK (FOR TESTING)')
    console.log('📧 ==========================================')
    console.log(`📧 Email: ${email}`)
    console.log(`📧 Verification Link: ${verificationLink}`)
    console.log('📧 ==========================================\n')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email - Hars Jewellery</h1>
            <p>Hello ${user.name || 'User'},</p>
            <p>Click the button below to verify your email address:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link expires in 24 hours.</p>
          </div>
        </body>
      </html>
    `

    // Send verification email
    const emailResult = await sendEmail(
      email,
      'Verify Your Email - Hars Jewellery',
      emailHtml
    )

    // Log email sending result
    if (!emailResult.success) {
      console.error('❌ Failed to resend verification email:', emailResult.error)
      console.log('📧 Verification link is available in console above')
      return NextResponse.json({ 
        success: false, 
        error: emailResult.error || 'Failed to send email',
        message: 'Verification link is available in server console'
      }, { status: 500 })
    } else {
      console.log('✅ Resend verification email sent successfully to:', email)
    }

    return NextResponse.json({ success: true, message: 'Verification email sent' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 })
  }
}

