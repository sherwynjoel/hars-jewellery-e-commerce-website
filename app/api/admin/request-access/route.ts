import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import { verifyAdminAccess } from '@/lib/admin-security'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Request admin panel access verification
 * Sends verification email to admin
 */
export async function POST(request: NextRequest) {
  let verificationLink: string | null = null
  let userEmail: string | null = null
  
  try {
    // Simplified check for requesting verification - don't require verification to request verification
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }
    
    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Check if email matches the allowed admin email
    const userEmailCheck = session.user.email?.toLowerCase().trim()
    if (userEmailCheck !== 'harsjewellery2005@gmail.com') {
      return NextResponse.json(
        { error: 'Access denied - Admin access restricted to authorized email only' },
        { status: 403 }
      )
    }

    const userId = session.user.id
    userEmail = userEmailCheck
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, adminPanelVerifiedAt: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30) // 30 minutes expiry

    // Hash the token BEFORE storing (this must succeed)
    const hashedToken = await bcrypt.hash(verificationToken, 10)
    console.log('✅ Token hashed successfully')

    // Store verification token in database FIRST (this MUST succeed)
    console.log('💾 Storing verification token in database...')
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          adminPanelVerifyToken: hashedToken,
          adminPanelVerifyExpiresAt: expiresAt
        }
      })
      console.log('✅ Token stored in database successfully')
    } catch (dbError: any) {
      console.error('❌ Database update FAILED:', dbError)
      console.error('❌ Error details:', dbError.message)
      console.error('❌ This means the token was NOT saved. Verification will fail.')
      throw new Error(`Failed to store verification token: ${dbError.message || 'Database error'}`)
    }

    // Generate verification link AFTER successful database save
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
    verificationLink = `${baseUrl}/admin/verify-access?token=${verificationToken}&email=${encodeURIComponent(user.email)}`

    // Don't log the link - it should only be sent via email

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #333; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Admin Panel Access Verification</h1>
            <p>Hello ${user.name || 'Admin'},</p>
            <p>You have requested access to the Hars Jewellery Admin Panel.</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you did not request this access, please ignore this email and contact support immediately.
            </div>
            <p>Click the button below to verify and gain access to the admin panel:</p>
            <a href="${verificationLink}" class="button">Verify Admin Access</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #f5f5f5; padding: 10px; border-radius: 5px;">${verificationLink}</p>
            <p><strong>This link expires in 30 minutes.</strong></p>
            <p>For security reasons, you'll need to verify your access each time you want to use the admin panel.</p>
            <p>Best regards,<br>Hars Jewellery Security Team</p>
          </div>
        </body>
      </html>
    `

    // Send verification email (wrap in try-catch so it doesn't break the response)
    let emailSent = false
    let emailError: string | null = null
    
    try {
      const emailResult = await sendEmail(
        user.email,
        'Admin Panel Access Verification - Hars Jewellery',
        emailHtml
      )
      
      emailSent = emailResult.success
      if (!emailResult.success) {
        emailError = emailResult.error || 'Unknown email error'
        console.error('❌ Failed to send admin verification email:', emailError)
      }
    } catch (emailErr: any) {
      emailError = emailErr.message || 'Email sending exception'
      console.error('❌ Email sending exception:', emailError)
    }

    // Return success response - link is only sent via email, not returned in response
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent. Please check your inbox at ' + user.email + '.',
        expiresIn: '30 minutes',
        emailSent: true
      })
    } else {
      // If email fails, don't expose the link - ask user to try again
      return NextResponse.json({
        success: false,
        message: 'Failed to send verification email. Please try again or check your email configuration.',
        emailSent: false,
        emailError: emailError || undefined
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Admin access request error:', error)
    console.error('Error stack:', error.stack)
    
    // Don't expose verification link on error - only send via email
    console.error('❌ Failed to send verification email')
    if (userEmail) {
      console.error(`📧 User email was: ${userEmail}`)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send verification email',
        message: 'Please try again or check your email configuration.',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * Check if admin panel access is verified
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ verified: false }, { status: 401 })
    }

    // Check if email matches authorized admin
    const userEmail = session.user.email?.toLowerCase().trim()
    if (userEmail !== 'harsjewellery2005@gmail.com') {
      return NextResponse.json({ verified: false }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminPanelVerifiedAt: true }
    })

    if (!user) {
      return NextResponse.json({ verified: false }, { status: 404 })
    }

    // Check if verification exists (required on each login - no expiry)
    // Verification is cleared on sign out, so admin must verify again on each login
    const isVerified = !!user.adminPanelVerifiedAt

    return NextResponse.json({
      verified: isVerified,
      verifiedAt: user.adminPanelVerifiedAt
    })
  } catch (error) {
    console.error('Check admin access error:', error)
    return NextResponse.json({ verified: false }, { status: 500 })
  }
}

