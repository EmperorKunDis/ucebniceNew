import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/notifications
 * Get user's notifications with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const userId = session.user.id

    // Build where clause
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    }

    // Get notifications
    const [notifications, unreadCount, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 50),
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          data: true,
          read: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
      prisma.notification.count({ where: { userId } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount,
        hasMore: offset + notifications.length < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
