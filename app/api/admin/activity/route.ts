import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess, getAdminActivityLogs } from '@/lib/admin-security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'VIEW_ACTIVITY_LOGS', 'AdminActivity', null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await getAdminActivityLogs(userId, limit, offset)

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error('Error fetching admin activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

