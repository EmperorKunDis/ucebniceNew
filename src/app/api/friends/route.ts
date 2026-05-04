import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/friends
 * Get user's friends list with activity status
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get accepted friendships (both directions)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            currentStreak: true,
            lastActiveDate: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            currentStreak: true,
            lastActiveDate: true,
          },
        },
      },
    })

    // Get pending received requests
    const pendingReceived = await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
          },
        },
      },
    })

    // Get pending sent requests
    const pendingSent = await prisma.friendship.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
          },
        },
      },
    })

    // Helper to determine activity status
    const getActivityStatus = (lastActive: Date | null): string => {
      if (!lastActive) return 'inactive'
      const now = Date.now()
      const diff = now - lastActive.getTime()
      const hours = diff / (1000 * 60 * 60)

      if (hours < 1) return 'online'
      if (hours < 24) return 'today'
      if (hours < 168) return 'this_week' // 7 days
      return 'inactive'
    }

    // Get weekly XP for friends (for leaderboard)
    const friendIds = friendships.map(f =>
      f.requesterId === userId ? f.receiverId : f.requesterId
    )

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weeklyXPMap = new Map<string, number>()
    if (friendIds.length > 0) {
      const memberships = await prisma.leagueMembership.findMany({
        where: {
          userId: { in: friendIds },
          league: { weekStart: { gte: weekStart } },
        },
        select: { userId: true, weeklyXP: true },
      })
      memberships.forEach(m => weeklyXPMap.set(m.userId, m.weeklyXP))
    }

    // Format friends list
    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.receiver : f.requester
      return {
        friendshipId: f.id,
        id: friend.id,
        username: friend.username ?? friend.name ?? 'Anonym',
        avatar: friend.image,
        level: friend.level,
        streak: friend.currentStreak,
        weeklyXP: weeklyXPMap.get(friend.id) ?? 0,
        lastActiveAt: friend.lastActiveDate?.toISOString() ?? null,
        status: getActivityStatus(friend.lastActiveDate),
      }
    })

    // Sort by weeklyXP for leaderboard feel
    friends.sort((a, b) => b.weeklyXP - a.weeklyXP)

    return NextResponse.json({
      success: true,
      data: {
        friends,
        pendingReceived: pendingReceived.map(p => ({
          friendshipId: p.id,
          user: {
            id: p.requester.id,
            username: p.requester.username ?? p.requester.name ?? 'Anonym',
            avatar: p.requester.image,
            level: p.requester.level,
          },
          createdAt: p.createdAt.toISOString(),
        })),
        pendingSent: pendingSent.map(p => ({
          friendshipId: p.id,
          user: {
            id: p.receiver.id,
            username: p.receiver.username ?? p.receiver.name ?? 'Anonym',
            avatar: p.receiver.image,
            level: p.receiver.level,
          },
          createdAt: p.createdAt.toISOString(),
        })),
        totalFriends: friends.length,
      },
    })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
