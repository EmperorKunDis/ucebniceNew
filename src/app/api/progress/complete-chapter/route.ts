import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevel, XP_PER_CHAPTER, checkAchievements, BADGES, shouldUpdateStreak } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { chapterId } = await request.json()

    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      )
    }

    // Check if lesson exists for this chapter, if not create it
    let lesson = await prisma.lesson.findFirst({
      where: { chapterId }
    })

    if (!lesson) {
      // Create lesson for this chapter
      lesson = await prisma.lesson.create({
        data: {
          chapterId,
          title: `Chapter ${chapterId}`,
          description: `Chapter ${chapterId} content`,
          xpReward: XP_PER_CHAPTER,
          difficulty: 'beginner',
          order: 0
        }
      })
    }

    // Check if already completed
    const existingCompletion = await prisma.completedLesson.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.id
        }
      }
    })

    if (existingCompletion) {
      return NextResponse.json({
        message: 'Chapter already completed',
        alreadyCompleted: true
      })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        completedLessons: true,
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate streak update
    const streakUpdate = shouldUpdateStreak(user.updatedAt)
    let newStreak = user.currentStreak

    if (streakUpdate.shouldIncrement) {
      newStreak = user.currentStreak + 1
    } else if (streakUpdate.shouldReset) {
      newStreak = 1
    }

    // Calculate new XP and level
    const newXP = user.xp + XP_PER_CHAPTER
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > user.level

    // Check for new achievements
    const existingBadgeIds = user.achievements.map(a => a.achievement.badgeId)
    const newBadgeIds = checkAchievements(
      user.completedLessons.length + 1, // +1 for the current completion
      newStreak,
      0, // TODO: track challenges
      0, // TODO: track perfect scores
      existingBadgeIds
    )

    // Create completion record and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark lesson as completed
      const completion = await tx.completedLesson.create({
        data: {
          userId: session.user.id,
          lessonId: lesson.id,
          xpEarned: XP_PER_CHAPTER
        }
      })

      // Create achievements
      let achievementXP = 0
      for (const badgeKey of newBadgeIds) {
        const badge = BADGES[badgeKey]

        // Find or create achievement
        let achievement = await tx.achievement.findUnique({
          where: { badgeId: badge.id }
        })

        if (!achievement) {
          achievement = await tx.achievement.create({
            data: {
              badgeId: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              xpReward: badge.xpReward,
              rarity: badge.rarity
            }
          })
        }

        // Award achievement to user
        await tx.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: achievement.id
          }
        })

        achievementXP += badge.xpReward
      }

      // Update user
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXP + achievementXP,
          level: calculateLevel(newXP + achievementXP),
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          updatedAt: new Date()
        },
        include: {
          achievements: {
            include: {
              achievement: true
            }
          }
        }
      })

      return { completion, updatedUser, newBadges: newBadgeIds }
    })

    return NextResponse.json({
      success: true,
      xpEarned: XP_PER_CHAPTER,
      totalXP: result.updatedUser.xp,
      level: result.updatedUser.level,
      leveledUp,
      newBadges: result.newBadges.map(key => BADGES[key]),
      streak: newStreak,
      streakIncreased: streakUpdate.shouldIncrement
    })

  } catch (error) {
    console.error('Error completing chapter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
