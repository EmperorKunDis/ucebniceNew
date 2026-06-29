import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { badRequest, forbidden, notFound, serverError, unauthorized } from '@/lib/api-responses'
import { respondFriendRequestSchema, validateAPIRequest } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

/**
 * POST /api/friends/respond
 * Accept or reject a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return unauthorized()
    }

    const validation = await validateAPIRequest(request, respondFriendRequestSchema)
    if (!validation.success) return validation.response

    const { friendshipId, action } = validation.data
    const userId = session.user.id

    // Find the friendship request
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: { id: true, username: true, name: true },
        },
      },
    })

    if (!friendship) {
      return notFound('Žádost nenalezena')
    }

    // Only the receiver can respond
    if (friendship.receiverId !== userId) {
      return forbidden('Nemáš oprávnění')
    }

    if (friendship.status !== 'PENDING') {
      return badRequest('Žádost již byla zpracována')
    }

    if (action === 'accept') {
      // Accept the request
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      })

      // Notify the requester
      await prisma.notification.create({
        data: {
          userId: friendship.requesterId,
          type: 'FRIEND_ACCEPTED',
          title: 'Žádost přijata!',
          message: `${session.user.name ?? 'Uživatel'} přijal tvou žádost o přátelství`,
          data: { friendshipId, newFriendId: userId },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Žádost přijata',
        friend: {
          id: friendship.requester.id,
          username: friendship.requester.username ?? friendship.requester.name,
        },
      })
    } else {
      // Reject the request
      await prisma.friendship.delete({
        where: { id: friendshipId },
      })

      return NextResponse.json({
        success: true,
        message: 'Žádost odmítnuta',
      })
    }
  } catch (error) {
    console.error('Error responding to friend request:', error)
    return serverError()
  }
}
