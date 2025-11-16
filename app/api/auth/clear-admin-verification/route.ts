import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Clear admin panel verification on sign out
 * This ensures admin must verify again on next login
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ success: true }) // Already signed out
    }
    
    // Only clear if user is admin
    if (session.user.role === 'ADMIN') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          adminPanelVerifiedAt: null,
          adminPanelVerifyToken: null,
          adminPanelVerifyExpiresAt: null
        }
      })
      
      console.log(`✅ Cleared admin verification for: ${session.user.email}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing admin verification:', error)
    // Don't fail sign out if clearing verification fails
    return NextResponse.json({ success: true })
  }
}

