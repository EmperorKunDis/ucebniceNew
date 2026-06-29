import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/streak-history
 * Get user's streak history for calendar visualization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get days parameter (default 365)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '365')
    const limitedDays = Math.min(days, 365) // Max 1 year

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - limitedDays)
    startDate.setHours(0, 0, 0, 0)

    // Get user's streak data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get streak history
    const history = await prisma.streakHistory.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        xpEarned: true,
        lessonsCompleted: true,
        froze: true,
        freezeSource: true,
      },
    })

    // Get unused streak freezes count
    const freezesRemaining = await prisma.userPurchase.count({
      where: {
        userId: session.user.id,
        usedAt: null,
        item: { key: 'streak_freeze' },
      },
    })

    // Count total freezes used
    const freezesUsed = history.filter(h => h.froze).length

    // Count total active days
    const totalActiveDays = history.filter(h => h.xpEarned > 0 || h.froze).length

    // Format history for calendar
    const formattedHistory = history.map(h => ({
      date: h.date.toISOString().split('T')[0],
      xpEarned: h.xpEarned,
      lessonsCompleted: h.lessonsCompleted,
      froze: h.froze,
      active: h.xpEarned > 0 || h.froze,
    }))

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalActiveDays,
        freezesUsed,
        freezesRemaining,
        history: formattedHistory,
      },
    })
  } catch (error) {
    console.error('Error fetching streak history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
