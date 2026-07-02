import { prisma } from './prisma'
import { QuestCategory, QuestType } from '@prisma/client'

const ACTIVE_QUEST_DEFINITIONS = [
  {
    type: QuestType.DAILY,
    category: QuestCategory.CHAPTERS_COMPLETED,
    title: 'Denní kapitoly',
    description: 'Dokonči 3 kapitoly',
    targetValue: 3,
    xpReward: 20,
    gemReward: 5,
    icon: '🗺️',
  },
  {
    type: QuestType.DAILY,
    category: QuestCategory.XP_EARNED,
    title: 'XP Sběratel',
    description: 'Získej 100 XP',
    targetValue: 100,
    xpReward: 30,
    gemReward: 10,
    icon: '⭐',
  },
  {
    type: QuestType.WEEKLY,
    category: QuestCategory.LESSONS_COMPLETED,
    title: 'Týdenní maratón',
    description: 'Dokonči 15 lekcí',
    targetValue: 15,
    xpReward: 150,
    gemReward: 50,
    icon: '📖',
  },
  {
    type: QuestType.WEEKLY,
    category: QuestCategory.XP_EARNED,
    title: 'XP Master',
    description: 'Získej 500 XP',
    targetValue: 500,
    xpReward: 200,
    gemReward: 75,
    icon: '🏆',
  },
  {
    type: QuestType.WEEKLY,
    category: QuestCategory.REVIEW_SESSIONS,
    title: 'Opakování',
    description: 'Dokonči 5 opakování',
    targetValue: 5,
    xpReward: 75,
    gemReward: 25,
    icon: '🧠',
  },
  {
    type: QuestType.WEEKLY,
    category: QuestCategory.CHAPTERS_COMPLETED,
    title: 'Průzkumník',
    description: 'Dokonči 10 kapitol',
    targetValue: 10,
    xpReward: 250,
    gemReward: 100,
    icon: '🗺️',
  },
]

const DISABLED_QUEST_FILTERS = [
  { type: QuestType.DAILY, category: QuestCategory.LESSONS_COMPLETED },
  { category: QuestCategory.STREAK_MAINTAINED },
  { category: QuestCategory.FRIENDS_ENCOURAGED },
  { category: QuestCategory.EXERCISES_PERFECT },
  { category: QuestCategory.HEARTS_PRESERVED },
]

function getDailyPeriodStart(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return start
}

function getWeeklyPeriodStart(now = new Date()) {
  const start = getDailyPeriodStart(now)
  const day = start.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - daysSinceMonday)
  return start
}

async function upsertProgressFromSource(
  userId: string,
  questId: string,
  targetValue: number,
  sourceProgress: number
) {
  const cappedProgress = Math.min(sourceProgress, targetValue)
  const completed = cappedProgress >= targetValue
  const existing = await prisma.userQuest.findUnique({
    where: {
      userId_questId: { userId, questId },
    },
  })

  if (existing && existing.progress >= cappedProgress && existing.completed === completed) {
    return
  }

  await prisma.userQuest.upsert({
    where: {
      userId_questId: { userId, questId },
    },
    create: {
      userId,
      questId,
      progress: cappedProgress,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      progress: cappedProgress,
      completed,
      completedAt: completed ? (existing?.completedAt ?? new Date()) : null,
      claimed: completed ? (existing?.claimed ?? false) : false,
      claimedAt: completed ? (existing?.claimedAt ?? null) : null,
    },
  })
}

async function getCompletedChapterCountForPeriod(userId: string, periodStart: Date) {
  const [chapterCompletions, legacyCompletions] = await Promise.all([
    prisma.chapterCompletion.findMany({
      where: {
        userId,
        completedChapter: true,
        completedAt: { gte: periodStart },
      },
      select: { chapterId: true },
    }),
    prisma.completedChapter.findMany({
      where: {
        userId,
        completedAt: { gte: periodStart },
      },
      include: {
        chapter: {
          select: { chapterId: true },
        },
      },
    }),
  ])

  const completedChapterIds = new Set<string>()
  chapterCompletions.forEach(completion => completedChapterIds.add(completion.chapterId))
  legacyCompletions.forEach(completion => completedChapterIds.add(completion.chapter.chapterId))

  return completedChapterIds.size
}

/**
 * Ensure production has the quest definitions that runtime events expect.
 * This is intentionally idempotent so a missed seed does not leave quests impossible to update.
 */
export async function ensureDefaultQuests() {
  for (const quest of ACTIVE_QUEST_DEFINITIONS) {
    const existingQuests = await prisma.quest.findMany({
      where: {
        type: quest.type,
        category: quest.category,
      },
      orderBy: { createdAt: 'asc' },
    })

    const [existingQuest, ...duplicateQuests] = existingQuests

    if (existingQuest) {
      await prisma.quest.update({
        where: { id: existingQuest.id },
        data: { ...quest, isActive: true },
      })

      if (duplicateQuests.length > 0) {
        await prisma.quest.updateMany({
          where: { id: { in: duplicateQuests.map(q => q.id) } },
          data: { isActive: false },
        })
      }
    } else {
      await prisma.quest.create({ data: quest })
    }
  }

  await prisma.quest.updateMany({
    where: {
      OR: DISABLED_QUEST_FILTERS,
    },
    data: { isActive: false },
  })
}

/**
 * Reconcile derived quest progress before returning quests to the user.
 * Event-based increments remain the primary path, this fixes missed chapter events
 * and stale production quest definitions without requiring a manual backfill first.
 */
export async function syncUserQuestProgress(userId: string) {
  await ensureDefaultQuests()

  const now = new Date()
  const [dailyChapterCount, weeklyChapterCount, user] = await Promise.all([
    getCompletedChapterCountForPeriod(userId, getDailyPeriodStart(now)),
    getCompletedChapterCountForPeriod(userId, getWeeklyPeriodStart(now)),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyXP: true },
    }),
  ])

  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      OR: [
        { category: QuestCategory.CHAPTERS_COMPLETED },
        { type: QuestType.DAILY, category: QuestCategory.XP_EARNED },
      ],
    },
  })

  for (const quest of quests) {
    if (quest.category === QuestCategory.CHAPTERS_COMPLETED) {
      const progress = quest.type === QuestType.DAILY ? dailyChapterCount : weeklyChapterCount
      await upsertProgressFromSource(userId, quest.id, quest.targetValue, progress)
      continue
    }

    if (quest.type === QuestType.DAILY && quest.category === QuestCategory.XP_EARNED && user) {
      await upsertProgressFromSource(userId, quest.id, quest.targetValue, user.dailyXP)
    }
  }
}

/**
 * Update quest progress for a user
 * Called when user performs relevant actions
 */
export async function updateQuestProgress(
  userId: string,
  category: QuestCategory,
  increment: number = 1
): Promise<{ questId: string; newProgress: number; completed: boolean }[]> {
  await ensureDefaultQuests()

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
  return prisma.$transaction(async tx => {
    const userQuest = await tx.userQuest.findUnique({
      where: {
        userId_questId: { userId, questId },
      },
      include: { quest: true },
    })

    if (!userQuest || !userQuest.completed || userQuest.claimed) {
      return null
    }

    const claimed = await tx.userQuest.updateMany({
      where: {
        id: userQuest.id,
        claimed: false,
        completed: true,
      },
      data: {
        claimed: true,
        claimedAt: new Date(),
      },
    })

    if (claimed.count !== 1) {
      return null
    }

    const { xpReward, gemReward } = userQuest.quest
    await tx.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpReward },
        gems: { increment: gemReward },
      },
    })

    return { xp: xpReward, gems: gemReward }
  })
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
