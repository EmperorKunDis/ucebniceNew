import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/leagues/leaderboard
 * Get the leaderboard for user's current league
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current week boundaries
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Find user's current league
    const membership = await prisma.leagueMembership.findFirst({
      where: {
        userId,
        league: {
          weekStart: { gte: weekStart },
          weekEnd: { lte: weekEnd },
        },
      },
      include: {
        league: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        {
          error: 'Nejsi v žádné lize',
          needsJoin: true,
        },
        { status: 404 }
      )
    }

    // Get all members with user info
    const members = await prisma.leagueMembership.findMany({
      where: { leagueId: membership.leagueId },
      orderBy: { weeklyXP: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            currentStreak: true,
          },
        },
      },
    })

    const totalMembers = members.length
    const promotionCutoff = Math.ceil(totalMembers * 0.33)
    const demotionCutoff = Math.floor(totalMembers * 0.83)

    // Format leaderboard
    const leaderboard = members.map((member, index) => {
      const rank = index + 1
      let zone: 'promotion' | 'safe' | 'demotion' = 'safe'
      if (rank <= promotionCutoff) zone = 'promotion'
      else if (rank > demotionCutoff) zone = 'demotion'

      return {
        rank,
        userId: member.user.id,
        username: member.user.username ?? member.user.name ?? 'Anonym',
        avatar: member.user.image,
        level: member.user.level,
        streak: member.user.currentStreak,
        weeklyXP: member.weeklyXP,
        isCurrentUser: member.user.id === userId,
        zone,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tier: membership.league.tier,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        members: leaderboard,
        promotionCutoff,
        demotionCutoff,
        totalMembers,
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
