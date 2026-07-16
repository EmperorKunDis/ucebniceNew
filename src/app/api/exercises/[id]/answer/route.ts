import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { LearningServiceError, submitExerciseAnswer } from '@/lib/learning-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/exercises/[id]/answer
 *
 * Evaluation and rewards are server-authoritative. A repeated correct answer is
 * recorded as an attempt but the reward ledger grants XP only once.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: unknown = await request.json()
    if (!isRecord(body) || !Object.prototype.hasOwnProperty.call(body, 'answer')) {
      return NextResponse.json({ error: 'Odpověď je povinná' }, { status: 400 })
    }
    if (body.answer === undefined || body.answer === null || typeof body.answer === 'function') {
      return NextResponse.json({ error: 'Neplatný formát odpovědi' }, { status: 400 })
    }

    const { id: exerciseId } = await params
    const headerKey = request.headers.get('Idempotency-Key')?.trim()
    const bodyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : ''
    const dedupeKey = headerKey || bodyKey
    if (!dedupeKey) {
      return NextResponse.json({ error: 'Idempotency key je povinný' }, { status: 400 })
    }
    if (dedupeKey.length > 200) {
      return NextResponse.json({ error: 'Idempotency key je příliš dlouhý' }, { status: 400 })
    }

    const result = await submitExerciseAnswer({
      userId: session.user.id,
      exerciseId,
      answer: body.answer as Prisma.InputJsonValue,
      dedupeKey,
      hintsUsed: toNonNegativeInteger(body.hintsUsed),
      timeSpentSeconds: toNonNegativeInteger(body.timeSpent ?? body.timeSpentSeconds),
    })
    const newAchievements =
      result.correct && result.xpEarned > 0 ? await checkAndAwardAchievements(session.user.id) : []

    return NextResponse.json({ ...result, newAchievements })
  } catch (error) {
    if (error instanceof LearningServiceError) {
      return NextResponse.json(
        {
          error: error.message,
          outOfHearts: error.status === 400 && error.message.includes('srdce'),
        },
        { status: error.status }
      )
    }

    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function toNonNegativeInteger(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
