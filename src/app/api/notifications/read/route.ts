import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serverError, unauthorized } from '@/lib/api-responses'
import { markNotificationsReadSchema, validateAPIRequest } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/read
 * Mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return unauthorized()
    }

    const validation = await validateAPIRequest(request, markNotificationsReadSchema)
    if (!validation.success) return validation.response

    const { ids } = validation.data
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
    return serverError()
  }
}
