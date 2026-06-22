import { prisma } from './prisma'
import { StreakFreezeSource } from '@prisma/client'

/**
 * Update user's streak based on activity
 * Called when user completes XP-earning activity
 */
export async function updateStreak(userId: string, xpEarned: number = 0) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Get user's current streak data
  const user = await prisma.user.findUnique({
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
      await prisma.streakHistory.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          xpEarned,
          lessonsCompleted: 1,
        },
        update: {
          xpEarned: { increment: xpEarned },
          lessonsCompleted: { increment: 1 },
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
    const freezePurchase = await prisma.userPurchase.findFirst({
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

      await prisma.userPurchase.update({
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
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: new Date(),
    },
  })

  // Record in streak history
  await prisma.streakHistory.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    create: {
      userId,
      date: today,
      xpEarned,
      lessonsCompleted: 1,
      froze,
      freezeSource,
    },
    update: {
      xpEarned: { increment: xpEarned },
      lessonsCompleted: { increment: 1 },
    },
  })

  // Check for streak milestones
  const streakMilestones = [3, 7, 14, 30, 100, 365]
  const hitMilestone = streakMilestones.find(m => newStreak === m)

  if (hitMilestone) {
    // Award achievement if not already earned
    const badgeId = `streak_${hitMilestone}`
    const existingAchievement = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievement: { badgeId },
      },
    })

    if (!existingAchievement) {
      const achievement = await prisma.achievement.findUnique({
        where: { badgeId },
      })

      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        })

        // Award gems
        if (achievement.gemReward > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { gems: { increment: achievement.gemReward } },
          })
        }

        // Create notification
        await prisma.notification.create({
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
