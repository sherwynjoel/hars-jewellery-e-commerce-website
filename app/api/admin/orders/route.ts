import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess } from '@/lib/admin-security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'VIEW_ORDERS', 'Order', null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status as any

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: true,
      }
    })

    return new NextResponse(JSON.stringify(orders), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}


