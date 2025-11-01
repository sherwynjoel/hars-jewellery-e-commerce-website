import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pricePerGram } = await request.json()
    const value = parseFloat(pricePerGram)
    if (!value || value <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const today = new Date()
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Upsert for today's date
    const record = await prisma.goldPrice.upsert({
      where: { date: dateOnly },
      update: { pricePerGram: value },
      create: { date: dateOnly, pricePerGram: value }
    })

    // Recalculate prices for products with a gold weight specified
    try {
      // Fetch all products and filter those with gold weight
      const allProducts = await prisma.product.findMany({
        select: { id: true, goldWeightGrams: true, name: true }
      })

      const weightedProducts = allProducts.filter(p => p.goldWeightGrams !== null && p.goldWeightGrams > 0)

      if (weightedProducts.length === 0) {
        return NextResponse.json({ 
          success: true, 
          pricePerGram: record.pricePerGram, 
          date: record.date, 
          repriced: false, 
          message: 'Gold price saved. No products with gold weight found to rep price.' 
        })
      }

      // Update products one by one to avoid transaction issues
      let updatedCount = 0
      let errors: string[] = []

      for (const p of weightedProducts) {
        try {
          const weight = p.goldWeightGrams!
          const newPrice = Math.round(weight * value)
          await prisma.product.update({ 
            where: { id: p.id }, 
            data: { price: newPrice } 
          })
          updatedCount++
        } catch (err: any) {
          errors.push(`${p.name}: ${err.message || String(err)}`)
          console.error(`Failed to update product ${p.id}:`, err)
        }
      }

      if (errors.length > 0) {
        return NextResponse.json({ 
          success: true, 
          pricePerGram: record.pricePerGram, 
          date: record.date, 
          repriced: true, 
          updatedCount, 
          failedCount: errors.length,
          errors 
        }, { status: 207 })
      }

      return NextResponse.json({ 
        success: true, 
        pricePerGram: record.pricePerGram, 
        date: record.date, 
        repriced: true, 
        updatedCount 
      })
    } catch (e: any) {
      console.error('Repricing error:', e)
      return NextResponse.json({ 
        success: true, 
        pricePerGram: record.pricePerGram, 
        date: record.date, 
        warning: 'Gold price saved, but repricing failed.', 
        details: e?.message || String(e) 
      }, { status: 207 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set gold price' }, { status: 500 })
  }
}


