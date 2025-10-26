import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateLevel,
  XP_PER_CHAPTER,
  checkAchievements,
  BADGES,
  shouldUpdateStreak,
} from '@/lib/gamification'
import { applyRateLimit } from '@/lib/api-middleware'
import { progressLimiter } from '@/lib/rate-limit'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { validateAPIRequest, completeChapterSchema } from '@/lib/validation-schemas'

/**
 * @swagger
 * /api/progress/complete-chapter:
 *   post:
 *     summary: Mark a chapter as completed
 *     description: Marks a chapter as completed for the authenticated user, awards XP, updates level, manages streak, and checks for new achievements. Rate limited to 100 requests per hour per user.
 *     tags:
 *       - Progress
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapterId
 *             properties:
 *               chapterId:
 *                 type: string
 *                 description: ID of the chapter to mark as completed
 *                 example: "chapter-1-intro"
 *     responses:
 *       200:
 *         description: Chapter completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 xpEarned:
 *                   type: integer
 *                   description: XP earned from this chapter
 *                   example: 100
 *                 totalXP:
 *                   type: integer
 *                   description: User's total XP after completion
 *                   example: 450
 *                 level:
 *                   type: integer
 *                   description: User's current level
 *                   example: 3
 *                 leveledUp:
 *                   type: boolean
 *                   description: Whether user leveled up
 *                   example: false
 *                 newBadges:
 *                   type: array
 *                   description: Array of newly unlocked achievements
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       xpReward:
 *                         type: integer
 *                       rarity:
 *                         type: string
 *                         enum: [common, rare, epic, legendary]
 *                 streak:
 *                   type: integer
 *                   description: Current learning streak
 *                   example: 5
 *                 streakIncreased:
 *                   type: boolean
 *                   description: Whether streak was incremented
 *                   example: true
 *               examples:
 *                 alreadyCompleted:
 *                   value:
 *                     message: "Chapter already completed"
 *                     alreadyCompleted: true
 *       400:
 *         description: Missing or invalid chapterId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, progressLimiter, session.user.id)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate request body with Zod
    const validation = await validateAPIRequest(request, completeChapterSchema)
    if (!validation.success) {
      return validation.response
    }

    const { chapterId } = validation.data

    // Check if lesson exists for this chapter
    const lesson = await prisma.lesson.findFirst({
      where: { chapterId },
    })

    if (!lesson) {
      // Lesson doesn't exist - return 404
      // Lessons should be pre-seeded in the database
      return NextResponse.json(
        { error: `Chapter ${chapterId} not found. Please contact support.` },
        { status: 404 }
      )
    }

    // Check if already completed (check both ChapterCompletion and old CompletedLesson)
    const existingChapterCompletion = await prisma.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
    })

    // Also check old completed lesson system
    const existingLessonCompletion = lesson
      ? await prisma.completedLesson.findUnique({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: lesson.id,
            },
          },
        })
      : null

    if (existingChapterCompletion || existingLessonCompletion) {
      return NextResponse.json({
        message: 'Chapter already completed',
        alreadyCompleted: true,
        stars: existingChapterCompletion?.stars || 1,
      })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        completedLessons: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    const result = await prisma.$transaction(async tx => {
      // Mark lesson as completed (use upsert to avoid duplicate errors)
      const completion = await tx.completedLesson.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
        create: {
          userId: session.user.id,
          lessonId: lesson.id,
          xpEarned: XP_PER_CHAPTER,
        },
        update: {}, // Don't update if already exists
      })

      // Create or update chapter completion - preserve higher star count
      // First check if completion already exists
      const existingCompletion = await tx.chapterCompletion.findUnique({
        where: {
          userId_chapterId: {
            userId: session.user.id,
            chapterId,
          },
        },
      })

      const chapterCompletion = await tx.chapterCompletion.upsert({
        where: {
          userId_chapterId: {
            userId: session.user.id,
            chapterId,
          },
        },
        create: {
          userId: session.user.id,
          chapterId,
          stars: 1,
        },
        update: {
          // Keep the higher star count (don't downgrade from 2 or 3 stars to 1)
          stars: Math.max(existingCompletion?.stars || 0, 1),
        },
      })

      // Create achievements
      let achievementXP = 0
      for (const badgeKey of newBadgeIds) {
        const badge = BADGES[badgeKey]

        // Find or create achievement
        let achievement = await tx.achievement.findUnique({
          where: { badgeId: badge.id },
        })

        if (!achievement) {
          achievement = await tx.achievement.create({
            data: {
              badgeId: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              xpReward: badge.xpReward,
              rarity: badge.rarity,
            },
          })
        }

        // Award achievement to user
        await tx.userAchievement.create({
          data: {
            userId: session.user.id,
            achievementId: achievement.id,
          },
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
          updatedAt: new Date(),
        },
        include: {
          achievements: {
            include: {
              achievement: true,
            },
          },
        },
      })

      return { completion, chapterCompletion, updatedUser, newBadges: newBadgeIds }
    })

    // Check for additional achievements using the centralized checker
    const additionalAchievements = await checkAndAwardAchievements(session.user.id)

    // Merge all new achievements (from old system + centralized checker)
    const allNewBadges = [...result.newBadges, ...additionalAchievements]

    return NextResponse.json({
      success: true,
      xpEarned: XP_PER_CHAPTER,
      totalXP: result.updatedUser.xp,
      level: result.updatedUser.level,
      leveledUp,
      newBadges: allNewBadges.map(key => BADGES[key]),
      streak: newStreak,
      streakIncreased: streakUpdate.shouldIncrement,
      stars: 1,
    })
  } catch (error) {
    console.error('Error completing chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
