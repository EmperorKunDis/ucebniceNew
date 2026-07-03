import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { QuestCategory } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { calculateLevel } from '@/lib/gamification'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quest-tracker'
import { updateStreak } from '@/lib/streak-manager'

interface RouteParams {
  params: Promise<{ lessonId: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId } = await params
    const userId = session.user.id

    const lesson = await prisma.microLesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          select: {
            id: true,
            chapterId: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    const existingProgress = await prisma.chapterProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: lesson.chapter.id,
        },
      },
      select: {
        lessonsCompleted: true,
      },
    })

    const previousLessonsCompleted = existingProgress?.lessonsCompleted ?? 0
    const nextLessonsCompleted = Math.max(previousLessonsCompleted, lesson.order)
    const newlyCompletedLessons = nextLessonsCompleted - previousLessonsCompleted

    if (newlyCompletedLessons <= 0) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        xpEarned: 0,
        lessonsCompleted: previousLessonsCompleted,
        questProgress: [],
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const xpEarned = lesson.xpReward
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        dailyXP: { increment: xpEarned },
        level: calculateLevel(user.xp + xpEarned),
      },
      select: {
        xp: true,
        level: true,
      },
    })

    const totalLessons = await prisma.microLesson.count({
      where: {
        chapterId: lesson.chapter.chapterId,
        isPublished: true,
      },
    })

    const progressPercent =
      totalLessons > 0 ? Math.round((nextLessonsCompleted / totalLessons) * 100) : 0

    await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: lesson.chapter.id,
        },
      },
      create: {
        userId,
        chapterId: lesson.chapter.id,
        lessonsCompleted: nextLessonsCompleted,
        totalSteps: totalLessons,
        progress: progressPercent,
      },
      update: {
        lessonsCompleted: nextLessonsCompleted,
        totalSteps: totalLessons,
        progress: progressPercent,
        lastAccessedAt: new Date(),
        lastUpdated: new Date(),
      },
    })

    await updateStreak(userId, xpEarned)

    const lessonQuestProgress = await updateQuestProgress(
      userId,
      QuestCategory.LESSONS_COMPLETED,
      newlyCompletedLessons
    )
    const xpQuestProgress = await updateQuestProgress(userId, QuestCategory.XP_EARNED, xpEarned)

    return NextResponse.json({
      success: true,
      xpEarned,
      totalXP: updatedUser.xp,
      level: updatedUser.level,
      leveledUp: updatedUser.level > user.level,
      lessonsCompleted: nextLessonsCompleted,
      progress: progressPercent,
      questProgress: [...lessonQuestProgress, ...xpQuestProgress],
    })
  } catch (error) {
    console.error('Error completing micro lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
