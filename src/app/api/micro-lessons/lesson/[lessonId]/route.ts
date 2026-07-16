import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toPublicExerciseData } from '@/lib/exercise-contract'
import { prisma } from '@/lib/prisma'
import {
  canonicalExerciseSourceKeys,
  canonicalLessonSourceKey,
  canonicalPreviousChapterId,
  isCanonicalChapterId,
} from '@/lib/canonical-content-keys'

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
      where: { id: lessonId, isPublished: true },
      select: {
        id: true,
        sourceKey: true,
        order: true,
        title: true,
        content: true,
        summary: true,
        xpReward: true,
        progress: {
          where: { userId: session.user.id },
          select: { completed: true, completedAt: true },
        },
        chapter: {
          select: {
            id: true,
            chapterId: true,
            title: true,
            order: true,
            videoFile: true,
            notebookLmUrl: true,
            colabUrl: true,
            projectTitle: true,
            projectDescription: true,
            projectRequirements: true,
          },
        },
        exercises: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            sourceKey: true,
            order: true,
            type: true,
            difficulty: true,
            question: true,
            data: true,
            hints: true,
            xpReward: true,
          },
        },
      },
    })

    if (
      !lesson ||
      !isCanonicalChapterId(lesson.chapter.chapterId) ||
      lesson.sourceKey !== canonicalLessonSourceKey(lesson.chapter.chapterId)
    ) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    const exerciseKeys = new Set(canonicalExerciseSourceKeys(lesson.chapter.chapterId))
    const canonicalExercises = lesson.exercises.filter(
      exercise => exercise.sourceKey && exerciseKeys.has(exercise.sourceKey)
    )

    const previousChapterId = canonicalPreviousChapterId(lesson.chapter.chapterId)
    const previousChapter = previousChapterId
      ? await prisma.chapter.findUnique({
          where: { chapterId: previousChapterId },
          select: { id: true },
        })
      : null
    if (previousChapter) {
      const previousProgress = await prisma.chapterProgress.findUnique({
        where: {
          userId_chapterId: { userId: session.user.id, chapterId: previousChapter.id },
        },
        select: { contentCompleted: true },
      })
      if (!previousProgress?.contentCompleted) {
        return NextResponse.json({ error: 'Lekce je zamčená' }, { status: 403 })
      }
    }

    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: lesson.chapter.id,
        },
      },
      select: { exercisesCompleted: true, projectApproved: true },
    })

    // Format exercises for frontend
    const exercises = canonicalExercises.map(ex => ({
      id: ex.id,
      order: ex.order,
      type: ex.type,
      difficulty: ex.difficulty,
      question: ex.question,
      data: toPublicExerciseData(ex.type, ex.data as Record<string, unknown>),
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
        chapter: { chapterId: lesson.chapter.chapterId, title: lesson.chapter.title },
        chapterId: lesson.chapter.chapterId,
        chapterTitle: lesson.chapter.title,
        videoFile: lesson.chapter.videoFile,
        notebookLmUrl: lesson.chapter.notebookLmUrl,
        colabUrl: lesson.chapter.colabUrl,
        projectTitle: lesson.chapter.projectTitle,
        projectDescription: lesson.chapter.projectDescription,
        projectRequirements: lesson.chapter.projectRequirements,
        progress: {
          contentCompleted: lesson.progress[0]?.completed ?? false,
          completedAt: lesson.progress[0]?.completedAt ?? null,
          exercisesCompleted: chapterProgress?.exercisesCompleted ?? false,
          projectApproved: chapterProgress?.projectApproved ?? false,
        },
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
