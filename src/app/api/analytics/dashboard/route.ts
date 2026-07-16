import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import {
  canonicalChapterIdsThrough,
  canonicalExerciseSourceKeysForCourse,
} from '@/lib/canonical-content-keys'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard data (admin only)
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Parallel queries for dashboard stats
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalLessonsCompleted,
      totalExercisesAnswered,
      eventsByType,
      dailyActiveUsers,
      topChapters,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (last 7 days)
      prisma.user.count({
        where: { lastActiveDate: { gte: startDate } },
      }),

      // New users this period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Total lessons completed this period (use updatedAt)
      prisma.chapterProgress.count({
        where: {
          contentCompleted: true,
          contentCompletedAt: { gte: startDate },
          chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
        },
      }),

      // ExerciseAttempt is the canonical answer history.
      prisma.exerciseAttempt.count({
        where: {
          attemptedAt: { gte: startDate },
          exercise: { sourceKey: { in: canonicalExerciseSourceKeysForCourse() } },
        },
      }),

      // Events by type
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: true,
        orderBy: { _count: { type: 'desc' } },
      }),

      // Daily active users
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("lastActiveDate") as date, COUNT(DISTINCT id) as count
        FROM "User"
        WHERE "lastActiveDate" >= ${startDate}
        GROUP BY DATE("lastActiveDate")
        ORDER BY date ASC
      `,

      // Top chapters by completions
      prisma.chapterProgress.groupBy({
        by: ['chapterId'],
        where: {
          contentCompleted: true,
          chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
        },
        _count: true,
        orderBy: { _count: { chapterId: 'desc' } },
        take: 10,
      }),
    ])

    // Format daily active users
    const dauFormatted = dailyActiveUsers.map(d => ({
      date: d.date.toISOString().split('T')[0],
      count: Number(d.count),
    }))

    // Format events by type
    const eventsFormatted = eventsByType.map(e => ({
      type: e.type,
      count: e._count,
    }))

    // Get chapter titles for top chapters
    const chapterIds: string[] = topChapters.map(c => c.chapterId)
    const chapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: { id: true, chapterId: true, title: true },
    })
    const chapterMap = new Map(chapters.map(c => [c.id, c]))

    const topChaptersFormatted = topChapters.map(c => ({
      chapterId: chapterMap.get(c.chapterId)?.chapterId ?? c.chapterId,
      title: chapterMap.get(c.chapterId)?.title ?? c.chapterId,
      completions: c._count,
    }))

    return NextResponse.json({
      success: true,
      data: {
        period: { days, startDate: startDate.toISOString() },
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          lessonsCompleted: totalLessonsCompleted,
          exercisesAnswered: totalExercisesAnswered,
        },
        charts: {
          dailyActiveUsers: dauFormatted,
          eventsByType: eventsFormatted,
          topChapters: topChaptersFormatted,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
