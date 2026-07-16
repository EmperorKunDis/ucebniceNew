import { prisma } from './prisma'
import { Prisma, StreakFreezeSource } from '@prisma/client'

type PrismaClientLike = Prisma.TransactionClient | typeof prisma

/**
 * Update user's streak based on activity
 * Called when user completes XP-earning activity
 */
export async function updateStreak(
  userId: string,
  xpEarned: number = 0,
  client: PrismaClientLike = prisma,
  lessonIncrement: number = 1
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Get user's current streak data
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  })

  if (!user) return null

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null

  // Check if already active today
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0)
    if (lastActive.getTime() === today.getTime()) {
      // Already active today - just update streak history XP
      await client.streakHistory.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          xpEarned,
          lessonsCompleted: lessonIncrement,
        },
        update: {
          xpEarned: { increment: xpEarned },
          lessonsCompleted: { increment: lessonIncrement },
        },
      })
      return { streak: user.currentStreak, extended: false }
    }
  }

  // Determine new streak value
  let newStreak = user.currentStreak
  let froze = false
  let freezeSource: StreakFreezeSource | null = null

  if (!lastActive) {
    // First activity ever
    newStreak = 1
  } else if (lastActive.getTime() === yesterday.getTime()) {
    // Active yesterday - extend streak
    newStreak = user.currentStreak + 1
  } else {
    // Missed days - check for streak freeze
    const freezePurchase = await client.userPurchase.findFirst({
      where: {
        userId,
        usedAt: null,
        item: { key: 'streak_freeze' },
        expiresAt: null, // Streak freezes don't expire until used
      },
      orderBy: { createdAt: 'asc' },
    })

    if (freezePurchase) {
      // Use streak freeze
      newStreak = user.currentStreak + 1
      froze = true
      freezeSource = StreakFreezeSource.SHOP_PURCHASE

      await client.userPurchase.update({
        where: { id: freezePurchase.id },
        data: { usedAt: new Date() },
      })
    } else {
      // Streak broken
      newStreak = 1
    }
  }

  // Update longest streak if needed
  const newLongestStreak = Math.max(user.longestStreak, newStreak)

  // Update user
  await client.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: new Date(),
    },
  })

  // Record in streak history
  await client.streakHistory.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    create: {
      userId,
      date: today,
      xpEarned,
      lessonsCompleted: lessonIncrement,
      froze,
      freezeSource,
    },
    update: {
      xpEarned: { increment: xpEarned },
      lessonsCompleted: { increment: lessonIncrement },
    },
  })

  // Check for streak milestones
  const streakMilestones = [3, 7, 14, 30, 100, 365]
  const hitMilestone = streakMilestones.find(m => newStreak === m)

  if (hitMilestone) {
    const badgeId = `streak_${hitMilestone}`
    const achievement = await client.achievement.findUnique({ where: { badgeId } })

    if (achievement) {
      const insertedAchievement = await client.userAchievement.createMany({
        data: [{ userId, achievementId: achievement.id }],
        skipDuplicates: true,
      })

      if (insertedAchievement.count === 1) {
        if (achievement.gemReward > 0) {
          const insertedReward = await client.rewardLedger.createMany({
            data: [
              {
                userId,
                sourceType: 'STREAK_MILESTONE',
                sourceId: badgeId,
                dedupeKey: `STREAK_MILESTONE:${badgeId}`,
                xpAmount: 0,
                gemAmount: achievement.gemReward,
              },
            ],
            skipDuplicates: true,
          })
          if (insertedReward.count === 1) {
            await client.user.update({
              where: { id: userId },
              data: { gems: { increment: achievement.gemReward } },
            })
          }
        }

        await client.notification.create({
          data: {
            userId,
            type: 'STREAK_MILESTONE',
            title: `🔥 ${hitMilestone} denní streak!`,
            message: `Gratulujeme! Získal jsi badge "${achievement.name}"`,
            data: { streak: hitMilestone, badgeId },
          },
        })
      }
    }
  }

  return {
    streak: newStreak,
    longestStreak: newLongestStreak,
    extended: true,
    froze,
    milestone: hitMilestone ?? null,
  }
}

/**
 * Check if user's streak is endangered (no activity today, streak > 0)
 */
export async function checkStreakEndangered(userId: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      lastActiveDate: true,
    },
  })

  if (!user || user.currentStreak === 0) return false

  const lastActive = user.lastActiveDate
  if (!lastActive) return user.currentStreak > 0

  const lastActiveDate = new Date(lastActive)
  lastActiveDate.setHours(0, 0, 0, 0)

  return lastActiveDate.getTime() < today.getTime()
}
