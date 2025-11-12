import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Admin Users API: Checking authentication...')
    
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    console.log('🔐 Admin Users API: Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      role: session?.user?.role 
    })
    
    if (!session) {
      console.log('❌ Admin Users API: No session found')
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log('❌ Admin Users API: User is not admin, role:', session.user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin Users API: Fetching users from database...')
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            cart: true  // Changed from cartItems to cart (relation name in schema)
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Admin Users API: Successfully fetched ${users.length} users`)
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user (cascade will delete cart items and orders)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

