import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateQueryParams, chapterProgressQuerySchema } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(searchParams, chapterProgressQuerySchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const { chapterId } = validation.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
      select: { id: true },
    })
    const chapterProgress = chapter
      ? await prisma.chapterProgress.findUnique({
          where: {
            userId_chapterId: {
              userId: user.id,
              chapterId: chapter.id,
            },
          },
        })
      : null

    // Get all question answers for this chapter
    const questionAnswers = await prisma.questionAnswer.findMany({
      where: {
        userId: user.id,
        chapterId,
      },
    })

    // Get project submission
    const projectSubmission = await prisma.projectSubmission.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    })

    return NextResponse.json({
      completedChapter: chapterProgress?.contentCompleted ?? false,
      answeredQuestions: chapterProgress?.exercisesCompleted ?? false,
      submittedProject: chapterProgress?.projectApproved ?? false,
      completed: chapterProgress?.contentCompleted ?? false,
      stars: chapterProgress?.stars ?? 0,
      questionAnswers: questionAnswers.map(qa => ({
        questionId: qa.questionId,
        correct: qa.correct,
        answer: qa.answer,
      })),
      hasProject: !!projectSubmission,
    })
  } catch (error) {
    console.error('Error fetching chapter progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
