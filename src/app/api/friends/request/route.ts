import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/friends/request
 * Send a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username } = body
    const requesterId = session.user.id

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    // Find user by username
    const receiver = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: username, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, name: true },
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 })
    }

    if (receiver.id === requesterId) {
      return NextResponse.json({ error: 'Nemůžeš si poslat žádost sám sobě' }, { status: 400 })
    }

    // Check if friendship already exists (any direction)
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: receiver.id },
          { requesterId: receiver.id, receiverId: requesterId },
        ],
      },
    })

    if (existingFriendship) {
      if (existingFriendship.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Už jste přátelé' }, { status: 400 })
      }
      if (existingFriendship.status === 'PENDING') {
        return NextResponse.json({ error: 'Žádost již existuje' }, { status: 400 })
      }
      if (existingFriendship.status === 'BLOCKED') {
        return NextResponse.json({ error: 'Nelze poslat žádost' }, { status: 400 })
      }
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        receiverId: receiver.id,
        status: 'PENDING',
      },
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiver.id,
        type: 'FRIEND_REQUEST',
        title: 'Nová žádost o přátelství',
        message: `${session.user.name ?? 'Někdo'} ti poslal žádost o přátelství`,
        data: { friendshipId: friendship.id, requesterId },
      },
    })

    return NextResponse.json({
      success: true,
      friendshipId: friendship.id,
      message: `Žádost odeslána uživateli ${receiver.username ?? receiver.name}`,
    })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
