import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/shop/purchase
 * Purchase a shop item
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
    }

    // Get the item
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    })

    if (!item || !item.isActive) {
      return NextResponse.json({ error: 'Položka nenalezena' }, { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        gems: true,
        hearts: true,
        maxHearts: true,
        currentStreak: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check gems
    if (user.gems < item.price) {
      return NextResponse.json(
        { error: 'Nedostatek gemů', required: item.price, current: user.gems },
        { status: 400 }
      )
    }

    // Check weekly limit
    if (item.maxPerWeek !== null) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weeklyPurchases = await prisma.userPurchase.count({
        where: {
          userId: session.user.id,
          itemId: item.id,
          createdAt: { gte: weekStart },
        },
      })

      if (weeklyPurchases >= item.maxPerWeek) {
        return NextResponse.json({ error: `Maximálně ${item.maxPerWeek}× týdně` }, { status: 400 })
      }
    }

    // Parse effect data
    const effectData = item.effectData as {
      type: string
      durationMinutes?: number
      amount?: number
      multiplier?: number
    }

    // Calculate expiration if applicable
    let expiresAt: Date | null = null
    if (effectData.durationMinutes) {
      expiresAt = new Date(Date.now() + effectData.durationMinutes * 60 * 1000)
    }

    // Apply effect based on item type
    const updateData: Record<string, unknown> = {
      gems: { decrement: item.price },
    }

    let effectDescription = ''

    switch (effectData.type) {
      case 'heart_refill':
        updateData.hearts = user.maxHearts
        updateData.lastHeartRegenAt = new Date()
        effectDescription = `Srdce doplněna na ${user.maxHearts}`
        break

      case 'unlimited_hearts':
        updateData.unlimitedHeartsUntil = expiresAt
        effectDescription = `Neomezená srdce do ${expiresAt?.toLocaleTimeString('cs-CZ')}`
        break

      case 'streak_freeze':
        // Streak freeze is stored as a purchase and used when needed
        effectDescription = 'Streak Freeze připraven k použití'
        break

      case 'xp_multiplier':
        // XP multiplier will be checked when awarding XP
        effectDescription = `${effectData.multiplier}× XP do ${expiresAt?.toLocaleTimeString('cs-CZ')}`
        break

      default:
        effectDescription = 'Efekt aplikován'
    }

    // Update user and create purchase record
    const [updatedUser, purchase] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          gems: true,
          hearts: true,
          maxHearts: true,
          unlimitedHeartsUntil: true,
        },
      }),
      prisma.userPurchase.create({
        data: {
          userId: session.user.id,
          itemId: item.id,
          price: item.price,
          expiresAt,
          usedAt: effectData.type === 'streak_freeze' ? null : new Date(),
        },
      }),
    ])

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SHOP_PURCHASE',
        title: 'Nákup dokončen',
        message: `${item.icon} ${item.name} zakoupeno za ${item.price} 💎`,
        data: { itemId: item.id, itemKey: item.key },
      },
    })

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        item: item.name,
        price: item.price,
        expiresAt: expiresAt?.toISOString() ?? null,
      },
      newBalance: { gems: updatedUser.gems },
      effect: effectDescription,
      user: {
        hearts: updatedUser.hearts,
        maxHearts: updatedUser.maxHearts,
        unlimitedHeartsUntil: updatedUser.unlimitedHeartsUntil?.toISOString() ?? null,
      },
    })
  } catch (error) {
    console.error('Error purchasing item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
