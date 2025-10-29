import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to trigger deployment
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    
    if (action === 'deploy') {
      // In development, short-circuit to avoid webhook/network/OS script issues
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ 
          message: 'Deployment simulated in development mode', 
          status: 'success' 
        })
      }
      // Trigger deployment webhook (prefer same-origin during dev)
      const origin = request.nextUrl.origin
      const defaultUrl = new URL('/api/webhook/deploy', origin).toString()
      const webhookUrl = process.env.DEPLOY_WEBHOOK_URL || defaultUrl

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.WEBHOOK_SECRET || 'your-secret-key'
        }
      })

      if (response.ok) {
        return NextResponse.json({ 
          message: 'Deployment triggered successfully',
          status: 'success'
        })
      } else {
        const text = await response.text().catch(() => '')
        return NextResponse.json({ 
          error: 'Failed to trigger deployment',
          details: text || response.statusText,
          status: 'error'
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auto-deploy error:', error)
    return NextResponse.json({ 
      error: 'Failed to trigger deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
