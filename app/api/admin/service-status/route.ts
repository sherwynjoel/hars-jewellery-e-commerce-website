import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess, logAdminActivity } from '@/lib/admin-security'

export const dynamic = 'force-dynamic'

/**
 * Get current service status
 */
export async function GET(request: NextRequest) {
  try {
    const status = await prisma.serviceStatus.findUnique({
      where: { id: 'service-status' }
    })

    // If no status exists, create default (services running)
    if (!status) {
      const defaultStatus = await prisma.serviceStatus.create({
        data: {
          id: 'service-status',
          isStopped: false,
          message: 'Our services are stopped today. Please check after 12 hours.'
        }
      })
      return NextResponse.json(defaultStatus)
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching service status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service status' },
      { status: 500 }
    )
  }
}

/**
 * Toggle service status (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const securityCheck = await verifyAdminAccess(request, 'TOGGLE_SERVICE_STATUS', 'ServiceStatus', null)

    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const body = await request.json()
    const { isStopped, message } = body

    if (typeof isStopped !== 'boolean') {
      return NextResponse.json(
        { error: 'isStopped must be a boolean' },
        { status: 400 }
      )
    }

    // Get or create service status
    let status = await prisma.serviceStatus.findUnique({
      where: { id: 'service-status' }
    })

    if (!status) {
      status = await prisma.serviceStatus.create({
        data: {
          id: 'service-status',
          isStopped: isStopped,
          stoppedAt: isStopped ? new Date() : null,
          message: message || 'Our services are stopped today. Please check after 12 hours.',
          updatedBy: securityCheck.userId!
        }
      })
    } else {
      status = await prisma.serviceStatus.update({
        where: { id: 'service-status' },
        data: {
          isStopped: isStopped,
          stoppedAt: isStopped ? (status.stoppedAt || new Date()) : null,
          message: message || status.message || 'Our services are stopped today. Please check after 12 hours.',
          updatedBy: securityCheck.userId!
        }
      })
    }

    // Log admin activity
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown'
    await logAdminActivity(
      securityCheck.userId!,
      isStopped ? 'SERVICES_STOPPED' : 'SERVICES_RESUMED',
      'ServiceStatus',
      status.id,
      ipAddress,
      request.headers.get('user-agent'),
      { isStopped, message: status.message }
    )

    return NextResponse.json({
      success: true,
      status: status,
      message: isStopped 
        ? 'Services have been stopped. Users cannot place orders.' 
        : 'Services have been resumed. Users can now place orders.'
    })
  } catch (error: any) {
    console.error('Error updating service status:', error)
    return NextResponse.json(
      { error: 'Failed to update service status', details: error.message },
      { status: 500 }
    )
  }
}

