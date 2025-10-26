import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/api-middleware'
import { apiLimiter } from '@/lib/rate-limit'
import { cache, CacheKeys } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, apiLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all-time'

    // Use cache for leaderboard data (5 minute TTL)
    const leaderboardData = await cache.get(
      CacheKeys.leaderboard(period),
      async () => await fetchLeaderboardData(period),
      { ttl: 300 } // 5 minutes
    )

    return NextResponse.json(leaderboardData)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Fetch leaderboard data from database
 */
async function fetchLeaderboardData(period: string) {
  // Calculate date range based on period
  let dateFilter: Date | undefined
  const now = new Date()

  switch (period) {
    case 'daily':
      dateFilter = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'weekly':
      dateFilter = new Date(now.setDate(now.getDate() - 7))
      break
    case 'monthly':
      dateFilter = new Date(now.setMonth(now.getMonth() - 1))
      break
    case 'all-time':
    default:
      dateFilter = undefined
  }

  // Fetch users with their stats
  const users = await prisma.user.findMany({
    where: dateFilter
      ? {
          updatedAt: {
            gte: dateFilter,
          },
        }
      : undefined,
    select: {
      id: true,
      username: true,
      xp: true,
      level: true,
      currentStreak: true,
      achievements: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      xp: 'desc',
    },
    take: 100,
  })

  // Format leaderboard data
  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username || 'Anonymous',
    xp: user.xp,
    level: user.level,
    badges: user.achievements.length,
    streak: user.currentStreak,
    change: 'same' as const, // TODO: Track rank changes over time
    changeValue: undefined,
  }))

  return {
    period,
    leaderboard,
    total: users.length,
  }
}
