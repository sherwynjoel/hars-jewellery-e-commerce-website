import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { position: 'asc' } } }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, image, images = [], category, stockCount, goldWeightGrams, shippingCost } = body

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedImages: string[] = Array.isArray(images) ? images.filter(Boolean) : []
    const primaryImage = image || normalizedImages[0] || ''
    
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const parsedStockCount = parseInt(stockCount) || 0
    
    let parsedGoldWeight: number | null = null
    if (goldWeightGrams !== null && goldWeightGrams !== undefined && goldWeightGrams !== '') {
      parsedGoldWeight = typeof goldWeightGrams === 'number' ? goldWeightGrams : parseFloat(goldWeightGrams)
      if (isNaN(parsedGoldWeight)) {
        parsedGoldWeight = null
      }
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const updateData: any = {
      name,
      description,
      price: parsedPrice,
      image: primaryImage,
      category,
      stockCount: parsedStockCount,
      inStock: parsedStockCount > 0,
      goldWeightGrams: parsedGoldWeight,
      shippingCost: shippingCost ? parseFloat(shippingCost) : 0
    }

    // Handle images update - always delete old images first
    updateData.images = {
      deleteMany: {},
      create: normalizedImages.map((url: string, index: number) => ({ url, position: index }))
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { images: true }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
