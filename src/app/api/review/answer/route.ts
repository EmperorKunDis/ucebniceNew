import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReviewRating } from '@prisma/client'
import { updateStreak } from '@/lib/streak-manager'
import { updateQuestProgress } from '@/lib/quest-tracker'
import { QuestCategory } from '@prisma/client'

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm
 */
function calculateSM2(
  quality: number, // 0-5 (0=complete blackout, 5=perfect)
  repetitions: number,
  easeFactor: number,
  interval: number
): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
  // Quality mapping: AGAIN=0, HARD=2, GOOD=4, EASY=5

  let newRepetitions = repetitions
  let newEaseFactor = easeFactor
  let newInterval = interval

  if (quality < 3) {
    // Failed - reset repetitions
    newRepetitions = 0
    newInterval = 1
  } else {
    // Successful review
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions = repetitions + 1
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Minimum ease factor is 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  return {
    newInterval,
    newEaseFactor: Math.round(newEaseFactor * 100) / 100,
    newRepetitions,
  }
}

/**
 * POST /api/review/answer
 * Submit a review rating for a card
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { cardId, rating, timeSpent: _timeSpent } = body

    // Validate rating
    const validRatings: ReviewRating[] = ['AGAIN', 'HARD', 'GOOD', 'EASY']
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Get the card
    const card = await prisma.reviewCard.findUnique({
      where: { id: cardId },
      include: {
        concept: {
          include: {
            exercises: {
              take: 1,
              select: { xpReward: true },
            },
          },
        },
      },
    })

    if (!card || card.userId !== userId) {
      return NextResponse.json({ error: 'Karta nenalezena' }, { status: 404 })
    }

    // Map rating to quality (0-5)
    const qualityMap: Record<ReviewRating, number> = {
      AGAIN: 0,
      HARD: 2,
      GOOD: 4,
      EASY: 5,
    }
    const quality = qualityMap[rating as ReviewRating]

    // Calculate new SM-2 values
    const { newInterval, newEaseFactor, newRepetitions } = calculateSM2(
      quality,
      card.repetitions,
      card.easeFactor,
      card.interval
    )

    // Calculate next review date
    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

    // Update the card
    const updatedCard = await prisma.reviewCard.update({
      where: { id: cardId },
      data: {
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewAt,
        lastReviewAt: new Date(),
        totalReviews: { increment: 1 },
        correctCount: quality >= 3 ? { increment: 1 } : undefined,
        lastRating: rating,
      },
    })

    // Award XP for successful review
    let xpEarned = 0
    if (quality >= 3) {
      xpEarned = card.concept.exercises[0]?.xpReward ?? 5

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          dailyXP: { increment: xpEarned },
        },
      })

      // Update streak
      await updateStreak(userId, xpEarned)

      // Update quest progress
      await updateQuestProgress(userId, QuestCategory.REVIEW_SESSIONS, 1)
      await updateQuestProgress(userId, QuestCategory.XP_EARNED, xpEarned)
    }

    return NextResponse.json({
      success: true,
      data: {
        newInterval,
        newEaseFactor,
        newRepetitions,
        nextReviewAt: updatedCard.nextReviewAt.toISOString(),
        xpEarned,
        correct: quality >= 3,
      },
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
