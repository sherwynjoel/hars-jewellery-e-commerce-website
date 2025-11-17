import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAccess } from '@/lib/admin-security'
import { normalizeImageList, pickPrimaryImage, isValidImageUrl } from '@/lib/image'

const extractGallery = (images?: { url: string | null }[]) =>
  (images ?? []).map((img) => (img?.url ?? '').trim()).filter((url) => isValidImageUrl(url))

const sanitizeProduct = (product: any) => {
  const gallery = extractGallery(product?.images)
  return {
    ...product,
    image: pickPrimaryImage(product?.image, gallery)
  }
}

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

    return NextResponse.json(sanitizeProduct(product))
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
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'UPDATE_PRODUCT', 'Product', params.id)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    const body = await request.json()
    const { name, description, price, image, images = [], category, stockCount, goldWeightGrams, shippingCost } = body

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedImages = normalizeImageList(images)
    
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
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { position: 'asc' } } }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const existingGallery = extractGallery(existing.images)
    const galleryForPrimary = normalizedImages.length ? normalizedImages : existingGallery
    const primaryImageCandidate = pickPrimaryImage(image, galleryForPrimary.length ? galleryForPrimary : [existing.image])

    if (!primaryImageCandidate) {
      return NextResponse.json({ error: 'Please upload at least one valid product image.' }, { status: 400 })
    }

    const updateData: any = {
      name,
      description,
      price: parsedPrice,
      image: primaryImageCandidate,
      category,
      stockCount: parsedStockCount,
      inStock: parsedStockCount > 0,
      goldWeightGrams: parsedGoldWeight,
      shippingCost: shippingCost ? parseFloat(shippingCost) : 0
    }

    if (normalizedImages.length) {
      updateData.images = {
        deleteMany: {},
        create: normalizedImages.map((url: string, index: number) => ({ url, position: index }))
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { images: true }
    })

    return NextResponse.json(sanitizeProduct(product))
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
    // Enhanced admin security check
    const securityCheck = await verifyAdminAccess(request, 'DELETE_PRODUCT', 'Product', params.id)
    
    if (!securityCheck.authorized) {
      return securityCheck.response!
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
