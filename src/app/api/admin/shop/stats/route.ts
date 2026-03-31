import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
