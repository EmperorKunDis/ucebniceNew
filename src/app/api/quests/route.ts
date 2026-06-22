import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestType } from '@prisma/client'

/**
 * GET /api/quests
 * Get user's daily and weekly quests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as QuestType | null

    // Calculate reset times
    const now = new Date()

    // Daily reset at midnight
    const dailyResetAt = new Date(now)
    dailyResetAt.setDate(dailyResetAt.getDate() + 1)
    dailyResetAt.setHours(0, 0, 0, 0)

    // Weekly reset on Monday
    const weeklyResetAt = new Date(now)
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7
    weeklyResetAt.setDate(weeklyResetAt.getDate() + daysUntilMonday)
    weeklyResetAt.setHours(0, 0, 0, 0)

    // Get quests based on type filter
    const questFilter = type ? { type, isActive: true } : { isActive: true }

    const quests = await prisma.quest.findMany({
      where: questFilter,
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    })

    // Get user's quest progress
    const questIds = quests.map(q => q.id)
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId: session.user.id,
        questId: { in: questIds },
      },
    })

    const userQuestMap = new Map(userQuests.map(uq => [uq.questId, uq]))

    // Format quests with progress
    const formattedQuests = quests.map(quest => {
      const userQuest = userQuestMap.get(quest.id)
      const progress = userQuest?.progress ?? 0
      const percentage = Math.min(100, Math.round((progress / quest.targetValue) * 100))

      return {
        id: quest.id,
        type: quest.type,
        category: quest.category,
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        targetValue: quest.targetValue,
        currentProgress: progress,
        percentage,
        completed: userQuest?.completed ?? false,
        completedAt: userQuest?.completedAt?.toISOString() ?? null,
        claimed: userQuest?.claimed ?? false,
        claimedAt: userQuest?.claimedAt?.toISOString() ?? null,
        rewards: {
          xp: quest.xpReward,
          gems: quest.gemReward,
        },
      }
    })

    // Group by type
    const dailyQuests = formattedQuests.filter(q => q.type === 'DAILY')
    const weeklyQuests = formattedQuests.filter(q => q.type === 'WEEKLY')

    // Check if all daily quests are completed for bonus
    const allDailyCompleted = dailyQuests.every(q => q.completed)
    const dailyBonusClaimed = dailyQuests.every(q => q.claimed)

    return NextResponse.json({
      success: true,
      data: {
        daily: {
          resetAt: dailyResetAt.toISOString(),
          quests: dailyQuests,
          bonusQuest: {
            allCompleted: allDailyCompleted,
            claimed: dailyBonusClaimed,
            rewards: { xp: 100, gems: 25 },
          },
        },
        weekly: {
          resetAt: weeklyResetAt.toISOString(),
          quests: weeklyQuests,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
