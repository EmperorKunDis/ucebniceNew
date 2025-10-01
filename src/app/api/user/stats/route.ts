import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProgressToNextLevel } from '@/lib/gamification'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        completedLessons: {
          include: {
            lesson: true
          }
        },
        achievements: {
          include: {
            achievement: true
          },
          orderBy: {
            unlockedAt: 'desc'
          }
        },
        lessonProgress: {
          include: {
            lesson: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate level progress
    const levelProgress = getProgressToNextLevel(user.xp)

    // Get recent completions
    const recentCompletions = user.completedLessons
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5)

    // Format response
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        createdAt: user.createdAt
      },
      stats: {
        completedChapters: user.completedLessons.length,
        totalAchievements: user.achievements.length,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        levelProgress
      },
      achievements: user.achievements.map(ua => ({
        id: ua.achievement.id,
        badgeId: ua.achievement.badgeId,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlockedAt
      })),
      recentCompletions: recentCompletions.map(c => ({
        id: c.id,
        lessonTitle: c.lesson.title,
        completedAt: c.completedAt,
        xpEarned: c.xpEarned
      })),
      progress: user.lessonProgress.map(p => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        progress: p.progress,
        lastUpdated: p.lastUpdated
      }))
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
