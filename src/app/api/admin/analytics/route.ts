import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import {
  canonicalChapterIdsThrough,
  canonicalExerciseSourceKeysForCourse,
} from '@/lib/canonical-content-keys'

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics and statistics
 */
export async function GET(_request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // ChapterProgress is the canonical chapter-level source of truth.
    const [
      totalUsers,
      totalChapters,
      totalAchievements,
      totalChapterCompletions,
      totalExerciseAttempts,
      totalProjectSubmissions,
      totalProjectApprovals,
      activeUsersCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chapter.count({ where: { chapterId: { in: canonicalChapterIdsThrough() } } }),
      prisma.achievement.count(),
      prisma.chapterProgress.count({
        where: {
          contentCompleted: true,
          chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
        },
      }),
      prisma.exerciseAttempt.count({
        where: { exercise: { sourceKey: { in: canonicalExerciseSourceKeysForCourse() } } },
      }),
      prisma.projectSubmission.count({
        where: { chapter: { chapterId: { in: canonicalChapterIdsThrough() } } },
      }),
      prisma.chapterProgress.count({
        where: {
          projectApproved: true,
          chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
        },
      }),
      // Active users (logged in within last 7 days)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Get average stats
    const avgStats = await prisma.user.aggregate({
      _avg: {
        xp: true,
        level: true,
        currentStreak: true,
      },
    })

    // Get top users by XP
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { xp: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        xp: true,
        level: true,
      },
    })

    // Get chapter completion rates from canonical progress.
    const chaptersWithCompletions = await prisma.chapter.findMany({
      where: { chapterId: { in: canonicalChapterIdsThrough() } },
      include: {
        _count: {
          select: {
            progress: {
              where: { contentCompleted: true },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    const chapterStats = chaptersWithCompletions.map(chapter => ({
      id: chapter.id,
      chapterId: chapter.chapterId,
      title: chapter.title,
      order: chapter.order,
      completions: chapter._count.progress,
      completionRate:
        totalUsers > 0 ? ((chapter._count.progress / totalUsers) * 100).toFixed(2) : '0.00',
    }))

    // Get recent canonical content completions (last 30 days).
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const recentCompletions = await prisma.chapterProgress.count({
      where: {
        contentCompleted: true,
        contentCompletedAt: {
          gte: thirtyDaysAgo,
        },
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
    })

    // Get achievement unlock stats
    const popularAchievements = await prisma.achievement.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    })

    // User growth (new users per day, last 30 days)
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers: activeUsersCount,
        totalChapters,
        totalAchievements,
        totalCompletedChapters: totalChapterCompletions, // Renamed for clarity
        totalChapterCompletions,
        // Keep the old response key during Release A, but source it from the
        // canonical exercise-attempt history.
        totalQuestionAnswers: totalExerciseAttempts,
        totalExerciseAttempts,
        totalProjectSubmissions,
        totalProjectApprovals,
      },
      averages: {
        xp: avgStats._avg.xp?.toFixed(0) || '0',
        level: avgStats._avg.level?.toFixed(1) || '0',
        streak: avgStats._avg.currentStreak?.toFixed(1) || '0',
      },
      topUsers,
      chapterStats,
      popularAchievements: popularAchievements.map(achievement => ({
        id: achievement.id,
        badgeId: achievement.badgeId,
        name: achievement.name,
        icon: achievement.icon,
        unlockedBy: achievement._count.users,
        unlockRate:
          totalUsers > 0 ? ((achievement._count.users / totalUsers) * 100).toFixed(2) : '0.00',
      })),
      activityTrends: {
        recentCompletions,
        newUsersCount,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
