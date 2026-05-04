import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quest-tracker'
import { QuestCategory } from '@prisma/client'
import { z } from 'zod'

const GEMS_FOR_QUESTIONS = 50

const completeQuestionsSchema = z.object({
  chapterId: z.string().min(1),
  score: z.number().min(0).max(100).optional(), // percentage correct
})

/**
 * POST /api/progress/complete-questions
 * Mark chapter questions as completed and award 50 gems
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = completeQuestionsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { chapterId, score } = validation.data
    const userId = session.user.id

    // Check if chapter exists
    const chapter = await prisma.chapter.findFirst({
      where: { chapterId },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Check if questions already completed
    const existingCompletion = await prisma.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    })

    if (existingCompletion?.answeredQuestions) {
      return NextResponse.json({
        message: 'Questions already completed',
        alreadyCompleted: true,
      })
    }

    // Award gems and mark questions as completed
    const result = await prisma.$transaction(async tx => {
      // Update or create chapter completion
      const completion = await tx.chapterCompletion.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
        create: {
          userId,
          chapterId,
          completedChapter: false,
          answeredQuestions: true,
          submittedProject: false,
        },
        update: {
          answeredQuestions: true,
        },
      })

      // Award gems
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          gems: { increment: GEMS_FOR_QUESTIONS },
        },
        select: {
          gems: true,
          xp: true,
        },
      })

      return { completion, user }
    })

    // Update quest progress for lessons completed
    await updateQuestProgress(userId, QuestCategory.LESSONS_COMPLETED, 1)

    return NextResponse.json({
      success: true,
      gemsEarned: GEMS_FOR_QUESTIONS,
      totalGems: result.user.gems,
      answeredQuestions: true,
      score,
    })
  } catch (error) {
    console.error('Error completing questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
