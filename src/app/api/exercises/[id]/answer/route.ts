import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateStreak } from '@/lib/streak-manager'
import { updateQuestProgress } from '@/lib/quest-tracker'
import { QuestCategory } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/exercises/[id]/answer
 * Submit an answer to an exercise
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: exerciseId } = await params
    const userId = session.user.id
    const body = await request.json()
    const { answer, timeSpent: _timeSpent } = body

    // Get exercise details
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        microLesson: {
          include: {
            chapter: true,
          },
        },
      },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Cvičení nenalezeno' }, { status: 404 })
    }

    // Get user for hearts check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hearts: true,
        maxHearts: true,
        unlimitedHeartsUntil: true,
        gems: true,
        xp: true,
        level: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has hearts (unless unlimited)
    const hasUnlimitedHearts =
      user.unlimitedHeartsUntil && new Date(user.unlimitedHeartsUntil) > new Date()
    if (!hasUnlimitedHearts && user.hearts <= 0) {
      return NextResponse.json(
        {
          error: 'Nemáš žádná srdce',
          outOfHearts: true,
          hearts: 0,
        },
        { status: 400 }
      )
    }

    // Evaluate answer based on exercise type
    const isCorrect = evaluateAnswer(
      exercise.type,
      exercise.data as Record<string, unknown>,
      answer
    )

    let xpEarned = 0
    let heartLost = false
    let newHearts = user.hearts

    if (isCorrect) {
      // Award XP
      xpEarned = exercise.xpReward

      // Check for XP multiplier from shop
      const xpBoost = await prisma.userPurchase.findFirst({
        where: {
          userId,
          usedAt: { not: null },
          expiresAt: { gt: new Date() },
          item: { key: 'double_xp' },
        },
      })

      if (xpBoost) {
        xpEarned *= 2
      }

      // Update user XP
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          dailyXP: { increment: xpEarned },
        },
        select: { xp: true, level: true },
      })

      // Check for level up
      const newLevel = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1
      const leveledUp = newLevel > user.level

      if (leveledUp) {
        await prisma.user.update({
          where: { id: userId },
          data: { level: newLevel },
        })
      }

      // Update streak
      await updateStreak(userId, xpEarned)

      // Update quest progress
      const questUpdates = await updateQuestProgress(userId, QuestCategory.XP_EARNED, xpEarned)

      // Update chapter progress
      await prisma.chapterProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId: exercise.microLesson.chapter.id,
          },
        },
        create: {
          userId,
          chapterId: exercise.microLesson.chapter.id,
          exercisesCorrect: 1,
          exercisesTotal: 1,
        },
        update: {
          exercisesCorrect: { increment: 1 },
          exercisesTotal: { increment: 1 },
        },
      })

      return NextResponse.json({
        correct: true,
        xpEarned,
        leveledUp: leveledUp ? newLevel : null,
        questProgress: questUpdates,
        hearts: newHearts,
        heartLost: false,
      })
    } else {
      // Wrong answer - lose heart
      if (!hasUnlimitedHearts && user.hearts > 0) {
        newHearts = user.hearts - 1
        heartLost = true

        await prisma.user.update({
          where: { id: userId },
          data: {
            hearts: newHearts,
            lastHeartRegenAt: new Date(),
          },
        })
      }

      // Update chapter progress (total exercises attempted)
      await prisma.chapterProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId: exercise.microLesson.chapter.id,
          },
        },
        create: {
          userId,
          chapterId: exercise.microLesson.chapter.id,
          exercisesCorrect: 0,
          exercisesTotal: 1,
        },
        update: {
          exercisesTotal: { increment: 1 },
        },
      })

      // Get correct answer for feedback
      const correctAnswer = getCorrectAnswer(
        exercise.type,
        exercise.data as Record<string, unknown>
      )

      return NextResponse.json({
        correct: false,
        correctAnswer,
        explanation: exercise.explanation,
        hearts: newHearts,
        heartLost,
        outOfHearts: newHearts <= 0,
      })
    }
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Evaluate if the answer is correct based on exercise type
 */
function evaluateAnswer(type: string, data: Record<string, unknown>, answer: unknown): boolean {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return answer === data.correctIndex

    case 'TRUE_FALSE':
      return answer === data.isTrue

    case 'FILL_IN_BLANK': {
      const answers = data.answers as string[]
      const userAnswers = answer as string[]
      const alternatives = (data.alternatives as string[][] | undefined) ?? []

      return answers.every((correct, i) => {
        const userAnswer = (userAnswers[i] ?? '').trim().toLowerCase()
        const correctNormalized = correct.trim().toLowerCase()
        if (userAnswer === correctNormalized) return true

        // Check alternatives
        const alts = alternatives[i] ?? []
        return alts.some(alt => alt.trim().toLowerCase() === userAnswer)
      })
    }

    case 'CODE_OUTPUT':
      return answer === data.correctIndex

    case 'MATCH_PAIRS': {
      const matches = answer as Record<string, number>
      // All pairs should match their original index
      return Object.entries(matches).every(([leftIdx, rightIdx]) => parseInt(leftIdx) === rightIdx)
    }

    default:
      return false
  }
}

/**
 * Get the correct answer for feedback
 */
function getCorrectAnswer(type: string, data: Record<string, unknown>): unknown {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return {
        index: data.correctIndex,
        text: (data.options as string[])[data.correctIndex as number],
      }

    case 'TRUE_FALSE':
      return data.isTrue

    case 'FILL_IN_BLANK':
      return data.answers

    case 'CODE_OUTPUT':
      return {
        index: data.correctIndex,
        text: (data.options as string[])[data.correctIndex as number],
      }

    case 'MATCH_PAIRS':
      return 'Správné páry jsou v původním pořadí'

    default:
      return null
  }
}
