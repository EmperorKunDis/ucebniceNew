import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/notifications/read
 * Mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body // string[] | "all"
    const userId = session.user.id

    if (ids === 'all') {
      // Mark all as read
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
      })

      return NextResponse.json({
        success: true,
        markedRead: result.count,
      })
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })
    }

    // Mark specific notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId, // Ensure user owns these notifications
        read: false,
      },
      data: { read: true, readAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      markedRead: result.count,
    })
  } catch (error) {
    console.error('Error marking notifications read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
