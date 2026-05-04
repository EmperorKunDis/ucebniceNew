import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeagueTier } from '@prisma/client'

// Tier order for promotion/demotion
const TIER_ORDER: LeagueTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'OBSIDIAN']

/**
 * GET /api/leagues/current
 * Get user's current league status
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
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Find user's current league membership
    let membership = await prisma.leagueMembership.findFirst({
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

    // If no membership, create one in Bronze league
    if (!membership) {
      // Find or create Bronze league for this week
      let league = await prisma.league.findFirst({
        where: {
          tier: 'BRONZE',
          weekStart,
        },
      })

      if (!league) {
        league = await prisma.league.create({
          data: {
            tier: 'BRONZE',
            weekStart,
            weekEnd,
          },
        })
      }

      // Create membership
      membership = await prisma.leagueMembership.create({
        data: {
          userId,
          leagueId: league.id,
          weeklyXP: 0,
        },
        include: {
          league: true,
        },
      })
    }

    // Get user's rank in the league
    const leagueMembers = await prisma.leagueMembership.findMany({
      where: { leagueId: membership.leagueId },
      orderBy: { weeklyXP: 'desc' },
      select: {
        userId: true,
        weeklyXP: true,
      },
    })

    const rank = leagueMembers.findIndex(m => m.userId === userId) + 1
    const totalMembers = leagueMembers.length

    // Promotion/demotion zones (top 10 promote, bottom 5 demote)
    const promotionZone = Math.ceil(totalMembers * 0.33) // Top 33%
    const demotionZone = Math.floor(totalMembers * 0.83) // Bottom 17%

    // Calculate days remaining
    const daysRemaining = Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Get tier indices for next/previous
    const currentTierIndex = TIER_ORDER.indexOf(membership.league.tier)
    const nextTier =
      currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null
    const previousTier = currentTierIndex > 0 ? TIER_ORDER[currentTierIndex - 1] : null

    return NextResponse.json({
      success: true,
      data: {
        currentTier: membership.league.tier,
        weeklyXP: membership.weeklyXP,
        rank,
        totalMembers,
        promotionZone,
        demotionZone,
        daysRemaining,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        nextTier,
        previousTier,
        zone: rank <= promotionZone ? 'promotion' : rank > demotionZone ? 'demotion' : 'safe',
      },
    })
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
