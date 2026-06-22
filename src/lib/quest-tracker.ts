import { prisma } from './prisma'
import { QuestCategory } from '@prisma/client'

/**
 * Update quest progress for a user
 * Called when user performs relevant actions
 */
export async function updateQuestProgress(
  userId: string,
  category: QuestCategory,
  increment: number = 1
): Promise<{ questId: string; newProgress: number; completed: boolean }[]> {
  // Get active quests for this category that user hasn't completed
  const activeQuests = await prisma.quest.findMany({
    where: {
      category,
      isActive: true,
    },
  })

  if (activeQuests.length === 0) return []

  const results: { questId: string; newProgress: number; completed: boolean }[] = []

  for (const quest of activeQuests) {
    // Get or create user quest
    let userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: { userId, questId: quest.id },
      },
    })

    if (!userQuest) {
      userQuest = await prisma.userQuest.create({
        data: {
          userId,
          questId: quest.id,
          progress: 0,
        },
      })
    }

    // Skip if already completed
    if (userQuest.completed) continue

    // Update progress
    const newProgress = Math.min(userQuest.progress + increment, quest.targetValue)
    const completed = newProgress >= quest.targetValue

    await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : null,
      },
    })

    results.push({
      questId: quest.id,
      newProgress,
      completed,
    })

    // Create notification if quest completed
    if (completed) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'QUEST_COMPLETED',
          title: '🎯 Quest dokončen!',
          message: `Splnil jsi úkol "${quest.title}"`,
          data: {
            questId: quest.id,
            rewards: { xp: quest.xpReward, gems: quest.gemReward },
          },
        },
      })
    }
  }

  return results
}

/**
 * Claim quest rewards
 */
export async function claimQuestReward(
  userId: string,
  questId: string
): Promise<{ xp: number; gems: number } | null> {
  const userQuest = await prisma.userQuest.findUnique({
    where: {
      userId_questId: { userId, questId },
    },
    include: { quest: true },
  })

  if (!userQuest || !userQuest.completed || userQuest.claimed) {
    return null
  }

  // Update user quest as claimed
  await prisma.userQuest.update({
    where: { id: userQuest.id },
    data: {
      claimed: true,
      claimedAt: new Date(),
    },
  })

  // Award rewards
  const { xpReward, gemReward } = userQuest.quest
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpReward },
      gems: { increment: gemReward },
    },
  })

  return { xp: xpReward, gems: gemReward }
}

/**
 * Reset daily quests at midnight
 * Should be called by a cron job
 */
export async function resetDailyQuests() {
  const dailyQuests = await prisma.quest.findMany({
    where: { type: 'DAILY', isActive: true },
  })

  const questIds = dailyQuests.map(q => q.id)

  // Delete all user progress for daily quests
  await prisma.userQuest.deleteMany({
    where: { questId: { in: questIds } },
  })
}

/**
 * Reset weekly quests on Monday
 * Should be called by a cron job
 */
export async function resetWeeklyQuests() {
  const weeklyQuests = await prisma.quest.findMany({
    where: { type: 'WEEKLY', isActive: true },
  })

  const questIds = weeklyQuests.map(q => q.id)

  // Delete all user progress for weekly quests
  await prisma.userQuest.deleteMany({
    where: { questId: { in: questIds } },
  })
}
