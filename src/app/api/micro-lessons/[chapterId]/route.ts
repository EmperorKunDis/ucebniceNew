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
  params: Promise<{ chapterId: string }>
}

/** GET /api/micro-lessons/[chapterId] */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chapterId } = await params
    if (!isCanonicalChapterId(chapterId)) {
      return NextResponse.json({ error: 'Kapitola nenalezena' }, { status: 404 })
    }
    const userId = session.user.id
    const isPracticeMode = request.nextUrl.searchParams.get('practice') === 'true'
    const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? 10)
    const practiceLimit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
      : 10

    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
      select: {
        id: true,
        chapterId: true,
        title: true,
        description: true,
        difficulty: true,
        order: true,
        videoFile: true,
        notebookLmUrl: true,
        colabUrl: true,
        projectTitle: true,
        projectDescription: true,
        projectRequirements: true,
        microLessons: {
          where: {
            isPublished: true,
            sourceKey: canonicalLessonSourceKey(chapterId),
          },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            summary: true,
            xpReward: true,
            progress: {
              where: { userId },
              select: { completed: true, completedAt: true },
            },
            exercises: {
              where: { sourceKey: { in: canonicalExerciseSourceKeys(chapterId) } },
              orderBy: { order: 'asc' },
              select: {
                id: true,
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
        },
      },
    })
    if (!chapter) {
      return NextResponse.json({ error: 'Kapitola nenalezena' }, { status: 404 })
    }

    const previousChapterId = canonicalPreviousChapterId(chapter.chapterId)
    const [chapterProgress, previousChapter] = await Promise.all([
      prisma.chapterProgress.findUnique({
        where: { userId_chapterId: { userId, chapterId: chapter.id } },
        select: {
          lessonsCompleted: true,
          exercisesCorrect: true,
          exercisesTotal: true,
          contentCompleted: true,
          exercisesCompleted: true,
          projectApproved: true,
          stars: true,
        },
      }),
      previousChapterId
        ? prisma.chapter.findUnique({
            where: { chapterId: previousChapterId },
            select: { id: true },
          })
        : null,
    ])
    const previousProgress = previousChapter
      ? await prisma.chapterProgress.findUnique({
          where: { userId_chapterId: { userId, chapterId: previousChapter.id } },
          select: { contentCompleted: true },
        })
      : null
    const isUnlocked = !previousChapter || previousProgress?.contentCompleted === true
    if (!isUnlocked) {
      return NextResponse.json({ error: 'Kapitola je zamčená' }, { status: 403 })
    }

    const completedLessonIds = new Set(
      chapter.microLessons
        .filter(lesson => lesson.progress?.[0]?.completed)
        .map(lesson => lesson.id)
    )
    const firstIncompleteIndex = chapter.microLessons.findIndex(
      lesson => !completedLessonIds.has(lesson.id)
    )
    const lessons = chapter.microLessons.map((lesson, index) => {
      const completed = completedLessonIds.has(lesson.id)
      const active = !completed && (firstIncompleteIndex === -1 || index === firstIncompleteIndex)
      return {
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        summary: lesson.summary,
        completed,
        status: completed
          ? ('completed' as const)
          : active
            ? ('active' as const)
            : ('locked' as const),
        exerciseCount: lesson.exercises.length,
        xpReward: lesson.xpReward,
        estimatedMinutes: Math.max(2, Math.ceil(lesson.exercises.length * 0.5)),
      }
    })

    if (isPracticeMode) {
      if (!chapterProgress?.contentCompleted) {
        return NextResponse.json({ error: 'Nejprve dokonči obsah kapitoly' }, { status: 403 })
      }
      const exercises = chapter.microLessons
        .flatMap(lesson =>
          lesson.exercises.map(exercise => ({
            id: exercise.id,
            order: exercise.order,
            type: exercise.type,
            difficulty: exercise.difficulty,
            question: exercise.question,
            data: toPublicExerciseData(exercise.type, exercise.data as Record<string, unknown>),
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

    const exercisesTotal = chapterProgress?.exercisesTotal ?? 0
    const exercisesCorrect = chapterProgress?.exercisesCorrect ?? 0
    const bestScore = exercisesTotal > 0 ? Math.round((exercisesCorrect / exercisesTotal) * 100) : 0
    const lessonsCompleted = completedLessonIds.size
    const progressPercentage =
      chapter.microLessons.length > 0
        ? Math.round((lessonsCompleted / chapter.microLessons.length) * 100)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        chapterId: chapter.chapterId,
        title: chapter.title,
        chapterTitle: chapter.title,
        description: chapter.description,
        chapterDescription: chapter.description,
        difficulty: chapter.difficulty,
        videoFile: chapter.videoFile,
        notebookLmUrl: chapter.notebookLmUrl,
        colabUrl: chapter.colabUrl,
        projectTitle: chapter.projectTitle,
        projectDescription: chapter.projectDescription,
        projectRequirements: chapter.projectRequirements,
        lessons,
        isUnlocked,
        progress: {
          lessonsCompleted,
          totalLessons: chapter.microLessons.length,
          stars: chapterProgress?.stars ?? 0,
          bestScore,
          completed: lessonsCompleted,
          total: chapter.microLessons.length,
          percentage: progressPercentage,
          contentCompleted: chapterProgress?.contentCompleted ?? false,
          exercisesCompleted: chapterProgress?.exercisesCompleted ?? false,
          projectApproved: chapterProgress?.projectApproved ?? false,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching micro-lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
