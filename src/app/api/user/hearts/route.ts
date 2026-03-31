import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const HEART_REGEN_MINUTES = parseInt(process.env.HEART_REGEN_MINUTES ?? '240')
// MAX_HEARTS default is 5, but we read from user.maxHearts for customization

/**
 * Calculate current hearts with regeneration
 */
function calculateHearts(user: {
  hearts: number
  maxHearts: number
  lastHeartRegenAt: Date | null
  unlimitedHeartsUntil: Date | null
}): {
  hearts: number
  nextRegenAt: Date | null
  heartsToRegen: number
} {
  // Check unlimited hearts
  if (user.unlimitedHeartsUntil && new Date() < user.unlimitedHeartsUntil) {
    return {
      hearts: user.maxHearts,
      nextRegenAt: null,
      heartsToRegen: 0,
    }
  }

  // Already at max
  if (user.hearts >= user.maxHearts) {
    return {
      hearts: user.maxHearts,
      nextRegenAt: null,
      heartsToRegen: 0,
    }
  }

  // Calculate regenerated hearts
  const lastRegen = user.lastHeartRegenAt ?? new Date()
  const minutesSinceRegen = (Date.now() - lastRegen.getTime()) / 60000
  const heartsToAdd = Math.floor(minutesSinceRegen / HEART_REGEN_MINUTES)
  const newHearts = Math.min(user.maxHearts, user.hearts + heartsToAdd)

  // Calculate next regen time
  const minutesUntilNext = HEART_REGEN_MINUTES - (minutesSinceRegen % HEART_REGEN_MINUTES)
  const nextRegenAt =
    newHearts < user.maxHearts ? new Date(Date.now() + minutesUntilNext * 60000) : null

  return {
    hearts: newHearts,
    nextRegenAt,
    heartsToRegen: heartsToAdd,
  }
}

/**
 * GET /api/user/hearts
 * Get current heart status with regeneration
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hearts: true,
        maxHearts: true,
        lastHeartRegenAt: true,
        unlimitedHeartsUntil: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { hearts, nextRegenAt, heartsToRegen } = calculateHearts(user)

    // Update hearts in DB if regeneration occurred
    if (heartsToRegen > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hearts,
          lastHeartRegenAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      hearts,
      maxHearts: user.maxHearts,
      nextRegenAt: nextRegenAt?.toISOString() ?? null,
      unlimitedUntil: user.unlimitedHeartsUntil?.toISOString() ?? null,
      regenRateMinutes: HEART_REGEN_MINUTES,
    })
  } catch (error) {
    console.error('Error fetching hearts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/user/hearts
 * Lose a heart (when answering incorrectly)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action !== 'lose') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hearts: true,
        maxHearts: true,
        lastHeartRegenAt: true,
        unlimitedHeartsUntil: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check unlimited hearts
    if (user.unlimitedHeartsUntil && new Date() < user.unlimitedHeartsUntil) {
      return NextResponse.json({
        hearts: user.maxHearts,
        heartLost: false,
        unlimited: true,
      })
    }

    // Calculate current hearts with regen
    const { hearts: currentHearts } = calculateHearts(user)

    if (currentHearts <= 0) {
      return NextResponse.json({
        hearts: 0,
        heartLost: false,
        outOfHearts: true,
      })
    }

    // Lose a heart
    const newHearts = currentHearts - 1
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: newHearts,
        lastHeartRegenAt: new Date(),
      },
    })

    return NextResponse.json({
      hearts: newHearts,
      maxHearts: user.maxHearts,
      heartLost: true,
      outOfHearts: newHearts <= 0,
    })
  } catch (error) {
    console.error('Error updating hearts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
