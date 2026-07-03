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
import { updateQuestProgress } from '@/lib/quest-tracker'
import { QuestCategory } from '@prisma/client'
import { progressLimiter } from '@/lib/rate-limit'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { validateAPIRequest, completeChapterSchema } from '@/lib/validation-schemas'
import { CacheInvalidation } from '@/lib/cache'

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

    // Check if chapter exists
    const chapter = await prisma.chapter.findFirst({
      where: { chapterId },
    })

    if (!chapter) {
      // Chapter doesn't exist - return 404
      // Chapters should be pre-seeded in the database
      return NextResponse.json(
        { error: `Chapter ${chapterId} not found. Please contact support.` },
        { status: 404 }
      )
    }

    // Check if already completed (check both ChapterCompletion and old CompletedChapter)
    const existingChapterCompletion = await prisma.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
    })

    // Also check old completed chapter system
    const existingChapterCompletionOld = chapter
      ? await prisma.completedChapter.findUnique({
          where: {
            userId_chapterId: {
              userId: session.user.id,
              chapterId: chapter.id,
            },
          },
        })
      : null

    // BUG FIX: Only return "already completed" if Star 1 (completedChapter) is actually true
    // A ChapterCompletion record may exist just for answered questions or project submission
    if (existingChapterCompletion?.completedChapter || existingChapterCompletionOld) {
      return NextResponse.json({
        message: 'Chapter already completed',
        alreadyCompleted: true,
        completedChapter: existingChapterCompletion?.completedChapter || true,
        answeredQuestions: existingChapterCompletion?.answeredQuestions || false,
        submittedProject: existingChapterCompletion?.submittedProject || false,
      })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        completedChapters: true,
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
      user.completedChapters.length + 1, // +1 for the current completion
      newStreak,
      0, // TODO: track challenges
      0, // TODO: track perfect scores
      existingBadgeIds
    )

    // Create completion record and update user in a transaction
    const result = await prisma.$transaction(async tx => {
      // Mark chapter as completed (use upsert to avoid duplicate errors)
      const completion = await tx.completedChapter.upsert({
        where: {
          userId_chapterId: {
            userId: session.user.id,
            chapterId: chapter.id,
          },
        },
        create: {
          userId: session.user.id,
          chapterId: chapter.id,
          xpEarned: XP_PER_CHAPTER,
        },
        update: {}, // Don't update if already exists
      })

      // Create or update chapter completion - set completedChapter flag
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
          completedChapter: true,
          answeredQuestions: false,
          submittedProject: false,
        },
        update: {
          completedChapter: true,
          completedAt: new Date(),
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

      // Gem rewards
      const GEMS_FOR_CHAPTER_COMPLETION = 10

      // Update user (including gems)
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXP + achievementXP,
          dailyXP: { increment: XP_PER_CHAPTER + achievementXP },
          level: calculateLevel(newXP + achievementXP),
          gems: { increment: GEMS_FOR_CHAPTER_COMPLETION },
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

      return {
        completion,
        chapterCompletion,
        updatedUser,
        newBadges: newBadgeIds,
        gemsEarned: GEMS_FOR_CHAPTER_COMPLETION,
      }
    })

    // Check for additional achievements using the centralized checker
    const additionalAchievements = await checkAndAwardAchievements(session.user.id)

    const chapterQuestProgress = await updateQuestProgress(
      session.user.id,
      QuestCategory.CHAPTERS_COMPLETED,
      1
    )
    const xpQuestProgress = await updateQuestProgress(
      session.user.id,
      QuestCategory.XP_EARNED,
      XP_PER_CHAPTER
    )

    // Merge all new achievements (from old system + centralized checker)
    const allNewBadges = [...result.newBadges, ...additionalAchievements]

    // Advance quest progress for completing a chapter (daily/weekly quests)
    await updateQuestProgress(session.user.id, QuestCategory.CHAPTERS_COMPLETED, 1)

    // Invalidate caches (fire and forget - don't block response)
    Promise.all([
      CacheInvalidation.invalidateUser(session.user.id),
      CacheInvalidation.invalidateLeaderboard(),
      CacheInvalidation.invalidateChapterProgress(session.user.id, chapterId),
    ]).catch(err => console.error('Cache invalidation error:', err))

    return NextResponse.json({
      success: true,
      xpEarned: XP_PER_CHAPTER,
      gemsEarned: result.gemsEarned,
      totalXP: result.updatedUser.xp,
      totalGems: result.updatedUser.gems,
      level: result.updatedUser.level,
      leveledUp,
      newBadges: allNewBadges.map(key => BADGES[key]),
      streak: newStreak,
      streakIncreased: streakUpdate.shouldIncrement,
      completedChapter: true,
      answeredQuestions: result.chapterCompletion.answeredQuestions,
      submittedProject: result.chapterCompletion.submittedProject,
      questProgress: [...chapterQuestProgress, ...xpQuestProgress],
    })
  } catch (error) {
    console.error('Error completing chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
