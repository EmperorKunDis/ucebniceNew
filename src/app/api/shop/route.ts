import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/shop
 * Get all shop items and user's purchase history
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's gems balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gems: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all active shop items
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    })

    // Get user's purchases this week for max per week check
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weeklyPurchases = await prisma.userPurchase.groupBy({
      by: ['itemId'],
      where: {
        userId: session.user.id,
        createdAt: { gte: weekStart },
      },
      _count: true,
    })

    const purchaseCountMap = new Map(weeklyPurchases.map(p => [p.itemId, p._count]))

    // Group items by category
    const categories = new Map<string, typeof items>()
    items.forEach(item => {
      const cat = categories.get(item.category) ?? []
      cat.push(item)
      categories.set(item.category, cat)
    })

    // Format response
    const formattedCategories = Array.from(categories.entries()).map(
      ([category, categoryItems]) => ({
        name: getCategoryName(category),
        items: categoryItems.map(item => {
          const purchasedThisWeek = purchaseCountMap.get(item.id) ?? 0
          const canPurchase =
            user.gems >= item.price &&
            (item.maxPerWeek === null || purchasedThisWeek < item.maxPerWeek)

          return {
            id: item.id,
            key: item.key,
            name: item.name,
            description: item.description,
            price: item.price,
            icon: item.icon,
            category: item.category,
            purchasedThisWeek,
            maxPerWeek: item.maxPerWeek,
            canPurchase,
          }
        }),
      })
    )

    return NextResponse.json({
      balance: { gems: user.gems },
      categories: formattedCategories,
    })
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    STREAK: '🔥 Streak',
    HEART: '❤️ Srdce',
    XP_BOOST: '⚡ XP Boost',
    POWER_UP: '🚀 Power-ups',
    COSMETIC: '✨ Kosmetika',
  }
  return names[category] ?? category
}
