import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess } from '@/lib/admin-security'

export const dynamic = 'force-dynamic'

/**
 * Get all database tables and their data
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const securityCheck = await verifyAdminAccess(request, 'VIEW_DATABASE', 'Database', null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const tables: any[] = []

    // Fetch Users
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          mobile: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
      tables.push({
        tableName: 'User',
        count: users.length,
        data: users
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    }

    // Fetch Products
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      })
      tables.push({
        tableName: 'Product',
        count: products.length,
        data: products
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    }

    // Fetch Orders
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      tables.push({
        tableName: 'Order',
        count: orders.length,
        data: orders.map(order => ({
          ...order,
          user: order.user.email,
          itemsCount: order.items.length
        }))
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
    }

    // Fetch OrderItems
    try {
      const orderItems = await prisma.orderItem.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          },
          order: {
            select: {
              id: true,
              userId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      tables.push({
        tableName: 'OrderItem',
        count: orderItems.length,
        data: orderItems.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          createdAt: item.createdAt
        }))
      })
    } catch (error) {
      console.error('Error fetching order items:', error)
    }

    // Fetch CartItems
    try {
      const cartItems = await prisma.cartItem.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          user: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      tables.push({
        tableName: 'CartItem',
        count: cartItems.length,
        data: cartItems.map(item => ({
          id: item.id,
          userId: item.userId,
          userEmail: item.user.email,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          createdAt: item.createdAt
        }))
      })
    } catch (error) {
      console.error('Error fetching cart items:', error)
    }

    // Fetch GoldPrice
    try {
      const goldPrices = await prisma.goldPrice.findMany({
        orderBy: { date: 'desc' }
      })
      tables.push({
        tableName: 'GoldPrice',
        count: goldPrices.length,
        data: goldPrices
      })
    } catch (error) {
      console.error('Error fetching gold prices:', error)
    }

    // Fetch SlideshowImage
    try {
      const slideshowImages = await prisma.slideshowImage.findMany({
        orderBy: { position: 'asc' }
      })
      tables.push({
        tableName: 'SlideshowImage',
        count: slideshowImages.length,
        data: slideshowImages
      })
    } catch (error) {
      console.error('Error fetching slideshow images:', error)
    }

    // Fetch VideoCarouselItem
    try {
      const videoCarouselItems = await prisma.videoCarouselItem.findMany({
        orderBy: { position: 'asc' }
      })
      tables.push({
        tableName: 'VideoCarouselItem',
        count: videoCarouselItems.length,
        data: videoCarouselItems
      })
    } catch (error) {
      console.error('Error fetching video carousel items:', error)
    }

    // Fetch AdminActivity
    try {
      const adminActivities = await prisma.adminActivity.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 activities
      })
      tables.push({
        tableName: 'AdminActivity',
        count: adminActivities.length,
        data: adminActivities.map(activity => ({
          id: activity.id,
          userId: activity.userId,
          userEmail: activity.user.email,
          action: activity.action,
          resource: activity.resource,
          resourceId: activity.resourceId,
          ipAddress: activity.ipAddress,
          createdAt: activity.createdAt
        }))
      })
    } catch (error) {
      console.error('Error fetching admin activities:', error)
    }

    // Fetch ServiceStatus
    try {
      const serviceStatus = await prisma.serviceStatus.findMany()
      tables.push({
        tableName: 'ServiceStatus',
        count: serviceStatus.length,
        data: serviceStatus
      })
    } catch (error) {
      console.error('Error fetching service status:', error)
    }

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching database data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database data' },
      { status: 500 }
    )
  }
}

