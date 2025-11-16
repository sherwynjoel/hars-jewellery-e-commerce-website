import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess } from '@/lib/admin-security'

export const dynamic = 'force-dynamic'

// Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'VIEW_USERS', 'User', null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    // Get all users - Admin always first, then by creation date
    const allUsers = await prisma.user.findMany({
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
            cart: true
          }
        }
      }
    })

    // Sort: Admin users first, then by creation date (oldest first)
    const users = allUsers.sort((a, b) => {
      // Admin users always come first
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1
      // If both same role, sort by creation date (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'DELETE_USER', 'User', userId || null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === securityCheck.userId) {
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

