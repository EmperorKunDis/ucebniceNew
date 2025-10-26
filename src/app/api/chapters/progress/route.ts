import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')

    if (!chapterId) {
      return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chapter completion
    const chapterCompletion = await prisma.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    })

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
      stars: chapterCompletion?.stars || 0,
      completed: !!chapterCompletion,
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
