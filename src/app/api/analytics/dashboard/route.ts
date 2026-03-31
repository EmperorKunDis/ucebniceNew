import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard data (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, role: true },
    })

    if (!user?.isAdmin && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      prisma.chapterCompletion.count({
        where: { updatedAt: { gte: startDate } },
      }),

      // Total exercises answered this period
      prisma.analyticsEvent.count({
        where: {
          type: 'EXERCISE_ANSWER',
          createdAt: { gte: startDate },
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
      prisma.chapterCompletion.groupBy({
        by: ['chapterId'],
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
      where: { chapterId: { in: chapterIds } },
      select: { chapterId: true, title: true },
    })
    const chapterMap = new Map(chapters.map(c => [c.chapterId, c.title]))

    const topChaptersFormatted = topChapters.map(c => ({
      chapterId: c.chapterId,
      title: chapterMap.get(c.chapterId) ?? c.chapterId,
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
