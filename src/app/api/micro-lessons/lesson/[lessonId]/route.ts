import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ lessonId: string }>
}

/**
 * GET /api/micro-lessons/lesson/[lessonId]
 * Get a specific micro-lesson with its exercises
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId } = await params

    // Get the lesson with exercises
    const lesson = await prisma.microLesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        order: true,
        title: true,
        content: true,
        summary: true,
        xpReward: true,
        chapter: {
          select: {
            chapterId: true,
            title: true,
          },
        },
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
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    // Format exercises for frontend
    const exercises = lesson.exercises.map(ex => ({
      id: ex.id,
      order: ex.order,
      type: ex.type,
      difficulty: ex.difficulty,
      question: ex.question,
      data: ex.data,
      explanation: ex.explanation,
      hints: ex.hints,
      xpReward: ex.xpReward,
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        content: lesson.content,
        summary: lesson.summary,
        xpReward: lesson.xpReward,
        chapter: lesson.chapter,
        exercises,
        totalExercises: exercises.length,
        estimatedMinutes: Math.max(3, exercises.length + 2),
      },
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
