import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/review/answer/route'
import { awardCanonicalReward, runLearningTransaction } from '@/lib/learning-service'

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    rewardLedger: { findUnique: jest.fn() },
  },
}))

jest.mock('@/lib/learning-service', () => ({
  awardCanonicalReward: jest.fn(),
  runLearningTransaction: jest.fn(),
  LearningServiceError: class LearningServiceError extends Error {
    constructor(
      message: string,
      readonly status: number
    ) {
      super(message)
    }
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockAwardCanonicalReward = awardCanonicalReward as jest.Mock
const mockRunLearningTransaction = runLearningTransaction as jest.Mock

function requestWith(
  body: Record<string, unknown>,
  idempotencyKey: string | null = 'review-request-1'
) {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((name: string) => (name === 'Idempotency-Key' ? idempotencyKey : null)),
    },
  } as unknown as NextRequest
}

function dueCard(nextReviewAt = new Date('2025-01-01T00:00:00.000Z')) {
  return {
    id: 'card-1',
    userId: 'user-1',
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReviewAt,
    concept: { exercises: [{ xpReward: 7 }] },
  }
}

describe('/api/review/answer', () => {
  let tx: {
    rewardLedger: { findUnique: jest.Mock; createMany: jest.Mock }
    reviewCard: { findUnique: jest.Mock; update: jest.Mock }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    tx = {
      rewardLedger: {
        findUnique: jest.fn().mockResolvedValue(null),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      reviewCard: {
        findUnique: jest.fn().mockResolvedValue(dueCard()),
        update: jest.fn().mockResolvedValue({}),
      },
    }
    mockRunLearningTransaction.mockImplementation(async operation => operation(tx))
    mockAwardCanonicalReward.mockResolvedValue({ awarded: true, xpEarned: 7 })
  })

  it('requires a stable idempotency key', async () => {
    const response = await POST(requestWith({ cardId: 'card-1', rating: 'GOOD' }, null))

    expect(response.status).toBe(400)
    expect(mockRunLearningTransaction).not.toHaveBeenCalled()
  })

  it('rejects a card that is not due without awarding XP', async () => {
    tx.reviewCard.findUnique.mockResolvedValue(dueCard(new Date('2999-01-01T00:00:00.000Z')))

    const response = await POST(requestWith({ cardId: 'card-1', rating: 'GOOD' }))

    expect(response.status).toBe(409)
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
    expect(tx.reviewCard.update).not.toHaveBeenCalled()
  })

  it('updates the card and awards a successful review in one canonical transaction', async () => {
    const response = await POST(requestWith({ cardId: 'card-1', rating: 'GOOD' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { xpEarned: 7, correct: true, replayed: false },
    })
    expect(mockAwardCanonicalReward).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        userId: 'user-1',
        sourceType: 'REVIEW_ANSWER',
        sourceId: 'card-1:review-request-1',
        xpAmount: 7,
      })
    )
    expect(tx.reviewCard.update).toHaveBeenCalledTimes(1)
  })

  it('replays the stored result without advancing the card or awarding again', async () => {
    tx.rewardLedger.findUnique.mockResolvedValue({
      metadata: {
        cardId: 'card-1',
        rating: 'GOOD',
        result: {
          newInterval: 1,
          newEaseFactor: 2.5,
          newRepetitions: 1,
          nextReviewAt: '2026-01-02T00:00:00.000Z',
          xpEarned: 7,
          correct: true,
          replayed: false,
        },
      },
    })

    const response = await POST(requestWith({ cardId: 'card-1', rating: 'GOOD' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ data: { xpEarned: 7, replayed: true } })
    expect(tx.reviewCard.findUnique).not.toHaveBeenCalled()
    expect(tx.reviewCard.update).not.toHaveBeenCalled()
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
  })
})
