import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProgressToNextLevel } from '@/lib/gamification'
import { applyRateLimit } from '@/lib/api-middleware'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get user statistics and progress
 *     description: Returns comprehensive user statistics including XP, level, achievements, completed chapters, and progress. Requires authentication. Rate limited to 100 requests per hour per user.
 *     tags:
 *       - User
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     image:
 *                       type: string
 *                     xp:
 *                       type: integer
 *                       description: Total experience points
 *                     level:
 *                       type: integer
 *                       description: Current level
 *                     currentStreak:
 *                       type: integer
 *                       description: Current learning streak in days
 *                     longestStreak:
 *                       type: integer
 *                       description: Longest learning streak achieved
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 stats:
 *                   type: object
 *                   properties:
 *                     completedChapters:
 *                       type: integer
 *                     totalAchievements:
 *                       type: integer
 *                     currentStreak:
 *                       type: integer
 *                     longestStreak:
 *                       type: integer
 *                     levelProgress:
 *                       type: object
 *                       properties:
 *                         currentLevel:
 *                           type: integer
 *                         currentXP:
 *                           type: integer
 *                         xpForNextLevel:
 *                           type: integer
 *                         progressPercentage:
 *                           type: number
 *                 achievements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Achievement'
 *                 recentCompletions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       lessonTitle:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       xpEarned:
 *                         type: integer
 *                 progress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lessonId:
 *                         type: string
 *                       lessonTitle:
 *                         type: string
 *                       progress:
 *                         type: integer
 *                         description: Progress percentage (0-100)
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
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
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, apiLimiter, session.user.id)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        completedLessons: {
          include: {
            lesson: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: 'desc',
          },
        },
        lessonProgress: {
          include: {
            lesson: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate level progress
    const levelProgress = getProgressToNextLevel(user.xp)

    // Get recent completions
    const recentCompletions = user.completedLessons
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5)

    // Format response
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        createdAt: user.createdAt,
      },
      stats: {
        completedChapters: user.completedLessons.length,
        totalAchievements: user.achievements.length,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        levelProgress,
      },
      achievements: user.achievements.map(ua => ({
        id: ua.achievement.id,
        badgeId: ua.achievement.badgeId,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlockedAt,
      })),
      recentCompletions: recentCompletions.map(c => ({
        id: c.id,
        lessonTitle: c.lesson.title,
        completedAt: c.completedAt,
        xpEarned: c.xpEarned,
      })),
      progress: user.lessonProgress.map(p => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        progress: p.progress,
        lastUpdated: p.lastUpdated,
      })),
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
