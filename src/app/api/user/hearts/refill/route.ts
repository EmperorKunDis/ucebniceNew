import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const HEART_REFILL_COST = 350 // gems

/**
 * POST /api/user/hearts/refill
 * Refill hearts using gems
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { method } = body // 'gems' or 'practice'

    if (method !== 'gems') {
      // Practice mode refill - free but requires completing review session
      // This will be implemented with spaced repetition
      return NextResponse.json(
        { error: 'Only gems refill is currently supported' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        gems: true,
        hearts: true,
        maxHearts: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already at max hearts
    if (user.hearts >= user.maxHearts) {
      return NextResponse.json({ error: 'Srdce jsou již plná' }, { status: 400 })
    }

    // Check if user has enough gems
    if (user.gems < HEART_REFILL_COST) {
      return NextResponse.json(
        { error: 'Nedostatek gemů', required: HEART_REFILL_COST, current: user.gems },
        { status: 400 }
      )
    }

    // Refill hearts and deduct gems
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: user.maxHearts,
        gems: { decrement: HEART_REFILL_COST },
        lastHeartRegenAt: new Date(),
      },
      select: {
        hearts: true,
        maxHearts: true,
        gems: true,
      },
    })

    // Record purchase
    const heartRefillItem = await prisma.shopItem.findUnique({
      where: { key: 'heart_refill' },
    })

    if (heartRefillItem) {
      await prisma.userPurchase.create({
        data: {
          userId: session.user.id,
          itemId: heartRefillItem.id,
          price: HEART_REFILL_COST,
          usedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      hearts: updatedUser.hearts,
      maxHearts: updatedUser.maxHearts,
      gems: updatedUser.gems,
      gemsSpent: HEART_REFILL_COST,
    })
  } catch (error) {
    console.error('Error refilling hearts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
