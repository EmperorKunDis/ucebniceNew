import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/projects/submit/route'
import { prisma } from '@/lib/prisma'
import { reviewProjectWithGemini } from '@/lib/gemini'
import { runLearningTransaction } from '@/lib/learning-service'
import { validateAPIRequest } from '@/lib/validation-schemas'

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      headers: init?.headers,
      json: async () => body,
    }),
  },
}))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    chapter: { findUnique: jest.fn() },
    rewardLedger: { deleteMany: jest.fn() },
  },
}))
jest.mock('@/lib/gemini', () => ({ reviewProjectWithGemini: jest.fn() }))
jest.mock('@/lib/achievement-checker', () => ({ checkAndAwardAchievements: jest.fn() }))
jest.mock('@/lib/validation-schemas', () => ({
  validateAPIRequest: jest.fn(),
  validateQueryParams: jest.fn(),
  submitProjectSchema: {},
  chapterProgressQuerySchema: {},
}))
jest.mock('@/lib/learning-service', () => ({
  applyProjectApproval: jest.fn(),
  assertProjectSubmissionAllowed: jest.fn(),
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
const mockValidateApiRequest = validateAPIRequest as jest.Mock
const mockReviewProject = reviewProjectWithGemini as jest.Mock
const mockRunLearningTransaction = runLearningTransaction as jest.Mock
const mockPrisma = prisma as unknown as {
  chapter: { findUnique: jest.Mock }
  rewardLedger: { deleteMany: jest.Mock }
}

function requestWithKey(key: string | null) {
  return {
    headers: { get: jest.fn(() => key) },
  } as unknown as NextRequest
}

describe('/api/projects/submit idempotency', () => {
  let claimMetadata: unknown
  let tx: {
    rewardLedger: { findUnique: jest.Mock; createMany: jest.Mock; update: jest.Mock }
    projectSubmission: { findUnique: jest.Mock; upsert: jest.Mock; update: jest.Mock }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    claimMetadata = null
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockValidateApiRequest.mockResolvedValue({
      success: true,
      data: {
        chapterId: '01',
        projectUrl: 'https://example.com/project',
        description: 'Canonical project',
      },
    })
    mockPrisma.chapter.findUnique.mockResolvedValue({
      id: 'chapter-internal-1',
      chapterId: '01',
      order: 1,
      title: 'Kapitola 1',
      description: 'Popis',
      projectRequirements: 'Požadavky',
    })
    mockReviewProject.mockResolvedValue({
      score: 0,
      feedback: 'Ruční kontrola',
      strengths: [],
      improvements: [],
      approved: false,
      model: 'test-model',
      promptVersion: 'test-v1',
      latencyMs: 1,
      tokenCount: null,
      failureReason: 'missing_api_key',
      safetyStatus: 'manual_review',
      manualReviewRequired: true,
    })
    tx = {
      rewardLedger: {
        findUnique: jest.fn(async () =>
          claimMetadata === null ? null : { metadata: claimMetadata }
        ),
        createMany: jest.fn(async ({ data }) => {
          if (claimMetadata !== null) return { count: 0 }
          claimMetadata = data[0].metadata
          return { count: 1 }
        }),
        update: jest.fn(async ({ data }) => {
          claimMetadata = data.metadata
          return {}
        }),
      },
      projectSubmission: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'submission-1', aiApproved: false }),
        update: jest.fn(),
      },
    }
    mockRunLearningTransaction.mockImplementation(async operation => operation(tx))
  })

  it('requires an idempotency key before invoking the reviewer', async () => {
    const response = await POST(requestWithKey(null))

    expect(response.status).toBe(400)
    expect(mockReviewProject).not.toHaveBeenCalled()
    expect(mockPrisma.chapter.findUnique).not.toHaveBeenCalled()
  })

  it('stores and replays the response without calling Gemini twice', async () => {
    const first = await POST(requestWithKey('project-request-1'))
    const second = await POST(requestWithKey('project-request-1'))

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    await expect(second.json()).resolves.toMatchObject({
      submittedProject: false,
      aiReview: { feedback: 'Ruční kontrola' },
    })
    expect(mockReviewProject).toHaveBeenCalledTimes(1)
    expect(tx.projectSubmission.upsert).toHaveBeenCalledTimes(1)
    expect(tx.rewardLedger.update).toHaveBeenCalledTimes(1)
  })
})
