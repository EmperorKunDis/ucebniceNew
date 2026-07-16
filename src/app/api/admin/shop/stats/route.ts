import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const [totalItems, purchases] = await Promise.all([
      prisma.shopItem.count(),
      prisma.userPurchase.findMany({
        include: { item: { select: { price: true } } },
      }),
    ])

    const totalPurchases = purchases.length
    const totalRevenue = purchases.reduce((sum, p) => sum + p.item.price, 0)

    return NextResponse.json({
      totalItems,
      totalPurchases,
      totalRevenue,
    })
  } catch (error) {
    console.error('Error fetching shop stats:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
