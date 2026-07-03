import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { validateAPIRequest, answerQuestionSchema } from '@/lib/validation-schemas'
import { QuestCategory } from '@prisma/client'
import { updateQuestProgress } from '@/lib/quest-tracker'

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

    // Check if already answered correctly. Wrong answers remain retryable.
    const existingAnswer = await prisma.questionAnswer.findUnique({
      where: {
        userId_chapterId_questionId: {
          userId: user.id,
          chapterId,
          questionId,
        },
      },
    })

    if (existingAnswer?.correct) {
      return NextResponse.json({
        correct: true,
        explanation: 'Tuto otázku jsi již zodpověděl.',
        xpEarned: 0,
        alreadyAnswered: true,
      })
    }

    // Get question from DB to verify answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const correct = question.correctAnswer === answerIndex
    const xpReward = correct && !existingAnswer?.correct ? question.xpReward : 0
    const explanation = question.explanation || (correct ? 'Správně!' : 'Zkus to znovu.')

    // Save answer to database. Existing wrong answers are updated so users can recover.
    if (existingAnswer) {
      await prisma.questionAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          answer: answerIndex.toString(),
          correct,
          xpEarned: xpReward,
        },
      })
    } else {
      await prisma.questionAnswer.create({
        data: {
          userId: user.id,
          chapterId,
          questionId,
          answer: answerIndex.toString(),
          correct,
          xpEarned: xpReward,
        },
      })
    }

    if (correct && xpReward > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: xpReward },
          dailyXP: { increment: xpReward },
        },
      })

      await updateQuestProgress(user.id, QuestCategory.XP_EARNED, xpReward)
    }

    if (!correct) {
      return NextResponse.json({
        correct,
        explanation,
        xpEarned: 0,
        allQuestionsCompleted: false,
        correctAnswer: {
          index: question.correctAnswer,
          text: Array.isArray(question.options)
            ? question.options[question.correctAnswer]
            : undefined,
        },
      })
    }

    // Deduct a heart on a wrong answer (Duolingo-style), unless user has unlimited hearts
    let hearts = user.hearts
    let heartLost = false
    const hasUnlimitedHearts =
      !!user.unlimitedHeartsUntil && new Date(user.unlimitedHeartsUntil) > new Date()
    if (!correct && !hasUnlimitedHearts && user.hearts > 0) {
      hearts = user.hearts - 1
      heartLost = true
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hearts,
          lastHeartRegenAt: new Date(),
        },
      })
    }

    // Check if all questions answered correctly
    // 1. Get total questions count for this chapter
    const totalQuestions = await prisma.question.count({
      where: { chapterId: question.chapterId },
    })

    const userCorrectAnswers = await prisma.questionAnswer.count({
      where: {
        userId: user.id,
        chapterId, // "01"
        correct: true,
      },
    })

    const allCorrect = userCorrectAnswers === totalQuestions

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
      correct,
      explanation,
      xpEarned: xpReward,
      allQuestionsCompleted: allCorrect,
      newAchievements,
      hearts,
      heartLost,
      outOfHearts: hearts <= 0,
      correctAnswer: {
        index: question.correctAnswer,
        text: Array.isArray(question.options)
          ? question.options[question.correctAnswer]
          : undefined,
      },
    })
  } catch (error) {
    console.error('Error answering question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
