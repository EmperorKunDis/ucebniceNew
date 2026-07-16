import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/exercises/[id]/answer/route'
import { submitExerciseAnswer } from '@/lib/learning-service'

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
jest.mock('@/lib/learning-service', () => ({
  submitExerciseAnswer: jest.fn(),
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
const mockSubmitExerciseAnswer = submitExerciseAnswer as jest.Mock

function requestWith(body: Record<string, unknown>, idempotencyKey?: string) {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((name: string) =>
        name === 'Idempotency-Key' ? (idempotencyKey ?? null) : null
      ),
    },
  } as unknown as NextRequest
}

describe('/api/exercises/[id]/answer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('requires an idempotency key for every write', async () => {
    const response = await POST(requestWith({ answer: 1 }), {
      params: Promise.resolve({ id: 'exercise-1' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('Idempotency'),
    })
    expect(mockSubmitExerciseAnswer).not.toHaveBeenCalled()
  })

  it('passes the stable key and answer to the canonical service', async () => {
    mockSubmitExerciseAnswer.mockResolvedValue({ correct: true, xpEarned: 5 })

    const response = await POST(requestWith({ answer: 1 }, 'attempt-123'), {
      params: Promise.resolve({ id: 'exercise-1' }),
    })

    expect(response.status).toBe(200)
    expect(mockSubmitExerciseAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        exerciseId: 'exercise-1',
        answer: 1,
        dedupeKey: 'attempt-123',
      })
    )
  })
})
