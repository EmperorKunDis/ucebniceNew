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
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chapterId } = await params
    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const isPracticeMode = searchParams.get('practice') === 'true'
    const requestedLimit = Number(searchParams.get('limit') ?? 10)
    const practiceLimit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
      : 10

    // Get chapter with micro-lessons
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
      select: {
        id: true,
        chapterId: true,
        title: true,
        description: true,
        difficulty: true,
        microLessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            xpReward: true,
            exercises: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                order: true,
                type: true,
                difficulty: true,
                question: true,
                data: true,
                explanation: true,
                hints: true,
                xpReward: true,
              },
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
        completed: status === 'completed',
        status,
        exerciseCount: lesson.exercises.length,
        xpReward: lesson.xpReward,
        estimatedMinutes: Math.max(2, Math.ceil(lesson.exercises.length * 0.5)),
      }
    })

    const exercisesTotal = chapterProgress?.exercisesTotal ?? 0
    const exercisesCorrect = chapterProgress?.exercisesCorrect ?? 0
    const bestScore = exercisesTotal > 0 ? Math.round((exercisesCorrect / exercisesTotal) * 100) : 0
    const progressPercentage =
      chapter.microLessons.length > 0
        ? Math.round((completedLessons / chapter.microLessons.length) * 100)
        : 0
    const stars =
      progressPercentage >= 100 ? 3 : progressPercentage >= 67 ? 2 : progressPercentage > 0 ? 1 : 0

    if (isPracticeMode) {
      const exercises = chapter.microLessons
        .flatMap(lesson =>
          lesson.exercises.map(exercise => ({
            id: exercise.id,
            order: exercise.order,
            type: exercise.type,
            difficulty: exercise.difficulty,
            question: exercise.question,
            data: exercise.data,
            explanation: exercise.explanation,
            hints: exercise.hints,
            xpReward: exercise.xpReward,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
          }))
        )
        .slice(0, practiceLimit)

      return NextResponse.json({
        success: true,
        data: {
          chapterId: chapter.chapterId,
          title: chapter.title,
          chapterTitle: chapter.title,
          exercises,
          totalExercises: exercises.length,
          limit: practiceLimit,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        chapterId: chapter.chapterId,
        title: chapter.title,
        chapterTitle: chapter.title,
        description: chapter.description,
        chapterDescription: chapter.description,
        difficulty: chapter.difficulty,
        lessons,
        isUnlocked: true,
        progress: {
          lessonsCompleted: completedLessons,
          totalLessons: chapter.microLessons.length,
          stars,
          bestScore,
          completed: completedLessons,
          total: chapter.microLessons.length,
          percentage: progressPercentage,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching micro-lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
