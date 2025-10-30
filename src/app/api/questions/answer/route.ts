import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAnswer, getChapterQuestions } from '@/data/questions'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { validateAPIRequest, answerQuestionSchema } from '@/lib/validation-schemas'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body with Zod
    const validation = await validateAPIRequest(request, answerQuestionSchema)
    if (!validation.success) {
      return validation.response
    }

    const { chapterId, questionId, answerIndex } = validation.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already answered
    const existingAnswer = await prisma.questionAnswer.findUnique({
      where: {
        userId_chapterId_questionId: {
          userId: user.id,
          chapterId,
          questionId,
        },
      },
    })

    if (existingAnswer) {
      return NextResponse.json({
        correct: existingAnswer.correct,
        explanation: 'Tuto otázku jsi již zodpověděl.',
        xpEarned: 0,
        alreadyAnswered: true,
      })
    }

    // Check answer
    const result = checkAnswer(chapterId, questionId, answerIndex)

    // Save answer to database
    await prisma.questionAnswer.create({
      data: {
        userId: user.id,
        chapterId,
        questionId,
        answer: answerIndex.toString(),
        correct: result.correct,
        xpEarned: result.xpReward,
      },
    })

    // Award XP if correct
    if (result.correct && result.xpReward > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: result.xpReward },
        },
      })
    }

    // Check if all questions answered correctly
    const allQuestions = getChapterQuestions(chapterId)
    const userAnswers = await prisma.questionAnswer.findMany({
      where: {
        userId: user.id,
        chapterId,
      },
    })

    const allCorrect =
      userAnswers.length === allQuestions.length && userAnswers.every(answer => answer.correct)

    // Update chapter completion - set answeredQuestions flag if all questions answered correctly
    if (allCorrect) {
      await prisma.chapterCompletion.upsert({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId,
          },
        },
        create: {
          userId: user.id,
          chapterId,
          completedChapter: false,
          answeredQuestions: true,
          submittedProject: false,
        },
        update: {
          answeredQuestions: true,
        },
      })
    }

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(user.id)

    return NextResponse.json({
      correct: result.correct,
      explanation: result.explanation,
      xpEarned: result.xpReward,
      allQuestionsCompleted: allCorrect,
      newAchievements,
    })
  } catch (error) {
    console.error('Error answering question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
