import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestCategory, ReviewRating } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import {
  awardCanonicalReward,
  LearningServiceError,
  runLearningTransaction,
} from '@/lib/learning-service'
import { canonicalExerciseSourceKeysForCourse } from '@/lib/canonical-content-keys'

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

interface ReviewAnswerData {
  newInterval: number
  newEaseFactor: number
  newRepetitions: number
  nextReviewAt: string
  xpEarned: number
  correct: boolean
  replayed: boolean
}

function replayClaim(
  metadata: unknown,
  expected: { cardId: string; rating: ReviewRating }
): ReviewAnswerData {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new LearningServiceError('Idempotency claim nelze bezpečně zopakovat', 409)
  }

  const claim = metadata as Record<string, unknown>
  if (claim.cardId !== expected.cardId || claim.rating !== expected.rating) {
    throw new LearningServiceError('Idempotency klíč už byl použit pro jinou odpověď', 409)
  }

  const result = claim.result
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new LearningServiceError('Idempotency claim neobsahuje výsledek', 409)
  }
  const data = result as Record<string, unknown>
  if (
    typeof data.newInterval !== 'number' ||
    typeof data.newEaseFactor !== 'number' ||
    typeof data.newRepetitions !== 'number' ||
    typeof data.nextReviewAt !== 'string' ||
    typeof data.xpEarned !== 'number' ||
    typeof data.correct !== 'boolean'
  ) {
    throw new LearningServiceError('Idempotency claim má neplatný výsledek', 409)
  }

  return {
    newInterval: data.newInterval,
    newEaseFactor: data.newEaseFactor,
    newRepetitions: data.newRepetitions,
    nextReviewAt: data.nextReviewAt,
    xpEarned: data.xpEarned,
    correct: data.correct,
    replayed: true,
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

    if (typeof cardId !== 'string' || cardId.length === 0) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')?.trim()
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
      return NextResponse.json(
        { error: 'Platný Idempotency-Key header je povinný' },
        { status: 400 }
      )
    }

    // Validate rating
    const validRatings: ReviewRating[] = ['AGAIN', 'HARD', 'GOOD', 'EASY']
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Map rating to quality (0-5)
    const qualityMap: Record<ReviewRating, number> = {
      AGAIN: 0,
      HARD: 2,
      GOOD: 4,
      EASY: 5,
    }
    const reviewRating = rating as ReviewRating
    const quality = qualityMap[reviewRating]
    const dedupeKey = `REVIEW_ANSWER:${cardId}:${idempotencyKey}`

    const transactionResult = await runLearningTransaction(async tx => {
      const existingClaim = await tx.rewardLedger.findUnique({
        where: { userId_dedupeKey: { userId, dedupeKey } },
        select: { metadata: true },
      })
      if (existingClaim) {
        return {
          kind: 'response' as const,
          data: replayClaim(existingClaim.metadata, { cardId, rating: reviewRating }),
        }
      }

      const card = await tx.reviewCard.findUnique({
        where: { id: cardId },
        include: {
          concept: {
            include: {
              exercises: {
                where: { sourceKey: { in: canonicalExerciseSourceKeysForCourse() } },
                take: 1,
                select: { xpReward: true },
              },
            },
          },
        },
      })

      if (!card || card.userId !== userId) {
        throw new LearningServiceError('Karta nenalezena', 404)
      }

      const reviewedAt = new Date()
      if (card.nextReviewAt.getTime() > reviewedAt.getTime()) {
        throw new LearningServiceError('Tato karta zatím není připravena k opakování', 409)
      }

      const { newInterval, newEaseFactor, newRepetitions } = calculateSM2(
        quality,
        card.repetitions,
        card.easeFactor,
        card.interval
      )
      const nextReviewAt = new Date(reviewedAt)
      nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)
      const proposedXp = quality >= 3 ? (card.concept.exercises[0]?.xpReward ?? 5) : 0
      const data: ReviewAnswerData = {
        newInterval,
        newEaseFactor,
        newRepetitions,
        nextReviewAt: nextReviewAt.toISOString(),
        xpEarned: proposedXp,
        correct: quality >= 3,
        replayed: false,
      }
      const resultMetadata: Prisma.InputJsonObject = {
        newInterval: data.newInterval,
        newEaseFactor: data.newEaseFactor,
        newRepetitions: data.newRepetitions,
        nextReviewAt: data.nextReviewAt,
        xpEarned: data.xpEarned,
        correct: data.correct,
        replayed: data.replayed,
      }
      const metadata: Prisma.InputJsonObject = {
        cardId,
        rating: reviewRating,
        result: resultMetadata,
      }

      if (quality >= 3) {
        const reward = await awardCanonicalReward(tx, {
          userId,
          sourceType: 'REVIEW_ANSWER',
          sourceId: `${cardId}:${idempotencyKey}`,
          xpAmount: proposedXp,
          metadata,
          questCategories: [QuestCategory.REVIEW_SESSIONS, QuestCategory.XP_EARNED],
        })
        if (!reward.awarded) return { kind: 'collision' as const }
        data.xpEarned = reward.xpEarned
      } else {
        const claim = await tx.rewardLedger.createMany({
          data: [
            {
              userId,
              sourceType: 'REVIEW_ANSWER',
              sourceId: `${cardId}:${idempotencyKey}`,
              dedupeKey,
              xpAmount: 0,
              gemAmount: 0,
              metadata,
            },
          ],
          skipDuplicates: true,
        })
        if (claim.count !== 1) return { kind: 'collision' as const }
      }

      await tx.reviewCard.update({
        where: { id: cardId },
        data: {
          easeFactor: newEaseFactor,
          interval: newInterval,
          repetitions: newRepetitions,
          nextReviewAt,
          lastReviewAt: reviewedAt,
          totalReviews: { increment: 1 },
          correctCount: quality >= 3 ? { increment: 1 } : undefined,
          lastRating: reviewRating,
        },
      })

      return { kind: 'response' as const, data }
    })

    let responseData: ReviewAnswerData
    if (transactionResult.kind === 'collision') {
      const claim = await prisma.rewardLedger.findUnique({
        where: { userId_dedupeKey: { userId, dedupeKey } },
        select: { metadata: true },
      })
      if (!claim) {
        throw new LearningServiceError('Souběžná odpověď se zpracovává, zkus požadavek znovu', 409)
      }
      responseData = replayClaim(claim.metadata, { cardId, rating: reviewRating })
    } else {
      responseData = transactionResult.data
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    if (error instanceof LearningServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error submitting review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
