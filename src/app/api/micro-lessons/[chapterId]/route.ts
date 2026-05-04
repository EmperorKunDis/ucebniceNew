import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ chapterId: string }>
}

/**
 * GET /api/micro-lessons/[chapterId]
 * Get all micro-lessons for a chapter with user progress
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chapterId } = await params
    const userId = session.user.id

    // Get chapter with micro-lessons
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
      select: {
        id: true,
        chapterId: true,
        title: true,
        description: true,
        microLessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            xpReward: true,
            exercises: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Kapitola nenalezena' }, { status: 404 })
    }

    // Get user's chapter progress
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: {
        userId_chapterId: { userId, chapterId: chapter.id },
      },
      select: {
        lessonsCompleted: true,
        exercisesCorrect: true,
        exercisesTotal: true,
      },
    })

    // Determine lesson status based on progress
    const completedLessons = chapterProgress?.lessonsCompleted ?? 0

    const lessons = chapter.microLessons.map((lesson, index) => {
      let status: 'completed' | 'active' | 'locked'
      if (index < completedLessons) {
        status = 'completed'
      } else if (index === completedLessons) {
        status = 'active'
      } else {
        status = 'locked'
      }

      return {
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        status,
        exerciseCount: lesson.exercises.length,
        xpReward: lesson.xpReward,
        estimatedMinutes: Math.max(2, Math.ceil(lesson.exercises.length * 0.5)),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        chapterId: chapter.chapterId,
        chapterTitle: chapter.title,
        chapterDescription: chapter.description,
        lessons,
        progress: {
          completed: completedLessons,
          total: chapter.microLessons.length,
          percentage:
            chapter.microLessons.length > 0
              ? Math.round((completedLessons / chapter.microLessons.length) * 100)
              : 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching micro-lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
