import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTransport } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to test admin verification setup
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const diagnostics: any = {
      session: {
        exists: !!session,
        email: session.user.email,
        role: session.user.role,
        isAuthorizedEmail: session.user.email?.toLowerCase().trim() === 'harsjewellery2005@gmail.com'
      },
      smtp: {
        configured: false,
        host: !!process.env.SMTP_HOST,
        port: !!process.env.SMTP_PORT,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
        from: !!process.env.EMAIL_FROM
      },
      database: {
        userExists: false,
        hasVerificationToken: false,
        verificationExpired: false
      }
    }

    // Check SMTP configuration
    try {
      createTransport()
      diagnostics.smtp.configured = true
      diagnostics.smtp.test = 'SMTP transport created successfully'
    } catch (error: any) {
      diagnostics.smtp.configured = false
      diagnostics.smtp.error = error.message
    }

    // Check database
    if (session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          adminPanelVerifyToken: true,
          adminPanelVerifyExpiresAt: true,
          adminPanelVerifiedAt: true
        }
      })

      if (user) {
        diagnostics.database.userExists = true
        diagnostics.database.hasVerificationToken = !!user.adminPanelVerifyToken
        diagnostics.database.verificationExpired = user.adminPanelVerifyExpiresAt 
          ? new Date() > user.adminPanelVerifyExpiresAt 
          : false
        diagnostics.database.isVerified = !!user.adminPanelVerifiedAt
        diagnostics.database.verifiedAt = user.adminPanelVerifiedAt
      }
    }

    return NextResponse.json(diagnostics)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

