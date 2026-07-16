import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET, POST } from '@/app/api/final-test/route'
import { canonicalChapterIdsThrough } from '@/lib/canonical-content-keys'
import { reviewMilestoneProject } from '@/lib/gemini'
import { awardCanonicalReward, runLearningTransaction } from '@/lib/learning-service'
import { prisma } from '@/lib/prisma'

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
jest.mock('@/lib/achievement-checker', () => ({
  checkAndAwardAchievements: jest.fn().mockResolvedValue([]),
}))
jest.mock('@/lib/gemini', () => ({ reviewMilestoneProject: jest.fn() }))
jest.mock('@/lib/learning-service', () => ({
  awardCanonicalReward: jest.fn(),
  runLearningTransaction: jest.fn(),
}))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    chapterProgress: { count: jest.fn() },
    finalTest: { findUnique: jest.fn() },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockReviewMilestoneProject = reviewMilestoneProject as jest.Mock
const mockAwardCanonicalReward = awardCanonicalReward as jest.Mock
const mockRunLearningTransaction = runLearningTransaction as jest.Mock
const mockPrisma = prisma as unknown as {
  chapterProgress: { count: jest.Mock }
  finalTest: { findUnique: jest.Mock }
}

const mockTx = {
  chapterProgress: { count: jest.fn() },
  finalTest: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
}

const exactAnswers = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => [
    `final-${index + 1}`,
    'imbalanced overfitting vanishing uncertainty labeled fairness interpretability batch data automation ' +
      'Praktické vysvětlení řešení obsahuje dostatek detailů a konkrétní doporučení.',
  ])
)

function requestWithBody(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('/api/final-test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.chapterProgress.count.mockResolvedValue(40)
    mockPrisma.finalTest.findUnique.mockResolvedValue(null)
    mockTx.chapterProgress.count.mockResolvedValue(40)
    mockTx.finalTest.findUnique.mockResolvedValue(null)
    mockTx.finalTest.upsert.mockResolvedValue({ id: 'final-test-1' })
    mockTx.finalTest.update.mockResolvedValue({ id: 'final-test-1' })
    mockRunLearningTransaction.mockImplementation(
      (operation: (tx: typeof mockTx) => Promise<unknown>) => operation(mockTx)
    )
    mockAwardCanonicalReward.mockResolvedValue({
      awarded: true,
      xpEarned: 1000,
      gemsEarned: 500,
      questProgress: [],
    })
    mockReviewMilestoneProject.mockResolvedValue({ score: 100, feedback: 'Výborně' })
  })

  it('uses all 40 canonical content completions and omits the answer key from GET', async () => {
    const response = await GET({} as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.questions).toHaveLength(10)
    expect(mockPrisma.chapterProgress.count).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
    })
    expect(JSON.stringify(body)).not.toContain('expectedConcepts')
  })

  it('rejects ineligible users before exposing the assessment', async () => {
    mockPrisma.chapterProgress.count.mockResolvedValue(39)

    const response = await GET({} as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({ required: 40, completed: 39 })
  })

  it('requires a final project and the exact ten server-side question IDs', async () => {
    const withoutProject = await POST(
      requestWithBody({ answers: exactAnswers, selectedProjectId: 1 })
    )
    expect(withoutProject.status).toBe(400)

    const substitutedAnswers = { ...exactAnswers }
    delete substitutedAnswers['final-1']
    substitutedAnswers['not-a-final-question'] = exactAnswers['final-2']!
    const substitutedQuestion = await POST(
      requestWithBody({
        answers: substitutedAnswers,
        selectedProjectId: 1,
        projectCode: 'console.log("project")',
      })
    )

    expect(substitutedQuestion.status).toBe(400)
    expect(mockPrisma.chapterProgress.count).not.toHaveBeenCalled()
    expect(mockRunLearningTransaction).not.toHaveBeenCalled()
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
  })

  it('awards a stable ledger source once and safely replays a passed final test', async () => {
    const requestBody = {
      answers: exactAnswers,
      selectedProjectId: 1,
      projectCode: 'Kompletní projektový kód s dokumentací a testy.',
    }

    const firstResponse = await POST(requestWithBody(requestBody))
    const firstBody = await firstResponse.json()

    expect(firstBody).toMatchObject({
      passed: true,
      questionsScore: 100,
      projectScore: 100,
      xpEarned: 1000,
      gemsEarned: 500,
      certificateReady: true,
    })
    expect(mockAwardCanonicalReward).toHaveBeenCalledTimes(1)
    expect(mockAwardCanonicalReward).toHaveBeenCalledWith(
      mockTx,
      expect.objectContaining({
        userId: 'user-1',
        sourceType: 'FINAL_TEST_PASS',
        sourceId: 'foundation',
        xpAmount: 1000,
        gemAmount: 500,
      })
    )

    mockPrisma.finalTest.findUnique.mockResolvedValue({
      id: 'final-test-1',
      passed: true,
      questionsScore: 100,
      projectScore: 100,
      projectFeedback: 'Výborně',
    })

    const replayResponse = await POST(requestWithBody(requestBody))
    const replayBody = await replayResponse.json()

    expect(replayResponse.status).toBe(200)
    expect(replayBody).toMatchObject({
      alreadyPassed: true,
      replayed: true,
      passed: true,
      xpEarned: 0,
      gemsEarned: 0,
      certificateReady: true,
    })
    expect(mockRunLearningTransaction).toHaveBeenCalledTimes(1)
    expect(mockAwardCanonicalReward).toHaveBeenCalledTimes(1)
    expect(mockReviewMilestoneProject).toHaveBeenCalledTimes(1)
  })

  it('does not overwrite a concurrently passed final test', async () => {
    mockTx.finalTest.findUnique.mockResolvedValue({
      id: 'final-test-1',
      passed: true,
      questionsScore: 90,
      projectScore: 95,
      projectFeedback: 'Schváleno',
    })

    const response = await POST(
      requestWithBody({
        answers: exactAnswers,
        selectedProjectId: 1,
        projectCode: 'Kompletní projektový kód s dokumentací a testy.',
      })
    )
    const body = await response.json()

    expect(body).toMatchObject({
      replayed: true,
      passed: true,
      questionsScore: 90,
      projectScore: 95,
    })
    expect(mockTx.finalTest.upsert).not.toHaveBeenCalled()
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
  })
})
