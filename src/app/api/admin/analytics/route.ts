import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics and statistics
 */
export async function GET(_request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // Get counts - use ChapterCompletion as primary source
    const [
      totalUsers,
      totalChapters,
      totalAchievements,
      totalChapterCompletions,
      totalQuestionAnswers,
      totalProjectSubmissions,
      activeUsersCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chapter.count(),
      prisma.achievement.count(),
      prisma.chapterCompletion.count({
        where: { completedChapter: true },
      }),
      prisma.questionAnswer.count(),
      prisma.projectSubmission.count(),
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

    // Get chapter completion rates using ChapterCompletion model
    const chaptersWithCompletions = await prisma.chapter.findMany({
      include: {
        _count: {
          select: {
            completions: {
              where: { completedChapter: true },
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
      completions: chapter._count.completions,
      completionRate:
        totalUsers > 0 ? ((chapter._count.completions / totalUsers) * 100).toFixed(2) : '0.00',
    }))

    // Get recent activity (last 30 days) using ChapterCompletion
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const recentCompletions = await prisma.chapterCompletion.count({
      where: {
        completedChapter: true,
        completedAt: {
          gte: thirtyDaysAgo,
        },
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
        totalQuestionAnswers,
        totalProjectSubmissions,
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
