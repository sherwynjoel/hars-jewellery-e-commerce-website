import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours expiry

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        emailVerifiedAt: null, // Don't verify immediately
        verifyOtpHash: await bcrypt.hash(verificationToken, 10),
        verifyOtpExpiresAt: expiresAt,
      }
    })

    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Log verification link for testing (remove in production)
    console.log('\n📧 ==========================================')
    console.log('📧 EMAIL VERIFICATION LINK (FOR TESTING)')
    console.log('📧 ==========================================')
    console.log(`📧 Email: ${email}`)
    console.log(`📧 Verification Link: ${verificationLink}`)
    console.log('📧 ==========================================\n')

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Hars Jewellery!</h1>
            <p>Hello ${name},</p>
            <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br>Hars Jewellery Team</p>
          </div>
        </body>
      </html>
    `

    // Send verification email
    console.log('\n📧 ==========================================')
    console.log('📧 ATTEMPTING TO SEND VERIFICATION EMAIL')
    console.log('📧 ==========================================')
    console.log('📧 User Email:', email)
    console.log('📧 User Name:', name)
    console.log('📧 Verification Link:', verificationLink)
    console.log('📧 ==========================================\n')
    
    const emailResult = await sendEmail(
      email,
      'Verify Your Email - Hars Jewellery',
      emailHtml
    )

    // Log email sending result
    console.log('\n📧 ==========================================')
    console.log('📧 EMAIL SENDING RESULT')
    console.log('📧 ==========================================')
    if (!emailResult.success) {
      console.error('❌ FAILED to send verification email')
      console.error('❌ Error:', emailResult.error)
      console.log('📧 Verification link is available in console above')
      console.log('📧 ==========================================\n')
      // Still return success - user can use console link or resend email
    } else {
      console.log('✅ SUCCESS! Verification email sent!')
      console.log('✅ Email sent to:', email)
      console.log('📧 ==========================================\n')
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        message: emailResult.success 
          ? 'Account created. Please check your email to verify your account.'
          : 'Account created. Please check your email (or use the verification link shown in server console).'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

