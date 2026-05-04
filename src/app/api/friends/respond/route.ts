import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/friends/respond
 * Accept or reject a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { friendshipId, action } = body // action: 'accept' | 'reject'
    const userId = session.user.id

    if (!friendshipId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 })
    }

    // Only the receiver can respond
    if (friendship.receiverId !== userId) {
      return NextResponse.json({ error: 'Nemáš oprávnění' }, { status: 403 })
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json({ error: 'Žádost již byla zpracována' }, { status: 400 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
