import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/achievements
 * Get all achievements with unlock stats
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    return NextResponse.json({
      achievements: achievements.map(achievement => ({
        id: achievement.id,
        badgeId: achievement.badgeId,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        rarity: achievement.rarity,
        createdAt: achievement.createdAt,
        stats: {
          unlockedBy: achievement._count.users,
        },
      })),
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/achievements
 * Create a new achievement
 */
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { badgeId, name, description, icon, xpReward, rarity } = body

    if (!badgeId || !name || !description || !icon || !xpReward || !rarity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const achievement = await prisma.achievement.create({
      data: {
        badgeId,
        name,
        description,
        icon,
        xpReward,
        rarity,
      },
    })

    return NextResponse.json({ achievement }, { status: 201 })
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
