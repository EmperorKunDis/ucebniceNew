import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const QUESTIONS_PER_CHAPTER = 3 // Random 3 out of 10

const querySchema = z.object({
  chapterId: z.string().min(1),
})

/**
 * GET /api/questions/random?chapterId=XX
 * Get 3 random questions from a chapter (out of 10)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const validation = querySchema.safeParse({
      chapterId: searchParams.get('chapterId'),
    })

    if (!validation.success) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
    }

    const { chapterId } = validation.data
    const userId = session.user.id

    // Get chapter
    const chapter = await prisma.chapter.findFirst({
      where: { chapterId },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Get all questions for this chapter
    const allQuestions = await prisma.question.findMany({
      where: { chapterId: chapter.id },
      orderBy: { questionNumber: 'asc' },
    })

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this chapter' }, { status: 404 })
    }

    // Randomly select 3 questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(QUESTIONS_PER_CHAPTER, shuffled.length))

    // Get user's previous answers for these questions
    const previousAnswers = await prisma.questionAnswer.findMany({
      where: {
        userId,
        questionId: { in: selectedQuestions.map(q => q.id) },
      },
    })

    const answeredMap = new Map(previousAnswers.map(a => [a.questionId, a]))

    // Format questions for frontend (hide correct answers)
    const questions = selectedQuestions.map((q, index) => {
      const previousAnswer = answeredMap.get(q.id)

      return {
        id: q.id,
        order: index + 1,
        type: 'MULTIPLE_CHOICE',
        question: q.questionText,
        options: q.options as string[],
        previousAnswer: previousAnswer
          ? {
              answer: previousAnswer.answer,
              correct: previousAnswer.correct,
            }
          : null,
        hint: q.explanation || null,
      }
    })

    return NextResponse.json({
      chapterId,
      chapterTitle: chapter.title,
      totalQuestions: allQuestions.length,
      selectedCount: selectedQuestions.length,
      questions,
    })
  } catch (error) {
    console.error('Error fetching random questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
