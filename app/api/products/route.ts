import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess } from '@/lib/admin-security'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')

    const where = {
      inStock: true, // Only show in-stock products to customers
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    else if (sort === 'price-desc') orderBy = { price: 'desc' }
    else if (sort === 'name-asc') orderBy = { name: 'asc' }
    else if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy,
      include: { images: { orderBy: { position: 'asc' } } }
    })

    return new NextResponse(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'CREATE_PRODUCT', 'Product', null)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const body = await request.json()
    const { name, description, price, image, images = [], category, stockCount, goldWeightGrams, shippingCost } = body

    const normalizedImages: string[] = Array.isArray(images) ? images.filter(Boolean) : []
    const primaryImage = image || normalizedImages[0] || ''

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: primaryImage,
        category,
        stockCount: parseInt(stockCount) || 0,
        inStock: parseInt(stockCount) > 0,
        goldWeightGrams: typeof goldWeightGrams === 'number' ? goldWeightGrams : goldWeightGrams ? parseFloat(goldWeightGrams) : null,
        shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
        images: {
          create: normalizedImages.map((url: string, index: number) => ({ url, position: index }))
        }
      },
      include: { images: true }
    })

    // Ensure pages show updated data immediately after mutations
    try {
      revalidatePath('/')
      revalidatePath('/collections')
    } catch (e) {
      // no-op if revalidation is not available in this context
    }

    return new NextResponse(JSON.stringify(product), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
