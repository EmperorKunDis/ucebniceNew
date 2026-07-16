import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET, POST } from '@/app/api/milestone-test/route'
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
    milestoneTest: { findUnique: jest.fn() },
    chapter: { findMany: jest.fn() },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockReviewMilestoneProject = reviewMilestoneProject as jest.Mock
const mockAwardCanonicalReward = awardCanonicalReward as jest.Mock
const mockRunLearningTransaction = runLearningTransaction as jest.Mock
const mockPrisma = prisma as unknown as {
  chapterProgress: { count: jest.Mock }
  milestoneTest: { findUnique: jest.Mock }
  chapter: { findMany: jest.Mock }
}

const mockTx = {
  chapterProgress: { count: jest.fn() },
  milestoneTest: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
}

function buildAssessmentChapters(startChapter = 1) {
  return Array.from({ length: 10 }, (_, chapterIndex) => {
    const order = startChapter + chapterIndex
    const chapterId = String(order).padStart(2, '0')
    return {
      id: `chapter-db-${chapterId}`,
      chapterId,
      title: `Kapitola ${chapterId}`,
      description: null,
      questions: [1, 2].map(questionNumber => ({
        id: `question-${chapterId}-${questionNumber}`,
        questionText: `Otázka ${questionNumber}`,
        options: ['správně', 'špatně'],
        correctAnswer: 0,
      })),
    }
  })
}

function requestWithBody(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('/api/milestone-test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.chapterProgress.count.mockResolvedValue(10)
    mockPrisma.milestoneTest.findUnique.mockResolvedValue(null)
    mockPrisma.chapter.findMany.mockResolvedValue(buildAssessmentChapters())
    mockTx.chapterProgress.count.mockResolvedValue(10)
    mockTx.milestoneTest.findUnique.mockResolvedValue(null)
    mockTx.milestoneTest.upsert.mockResolvedValue({ id: 'test-1' })
    mockTx.milestoneTest.update.mockResolvedValue({ id: 'test-1' })
    mockRunLearningTransaction.mockImplementation(
      (operation: (tx: typeof mockTx) => Promise<unknown>) => operation(mockTx)
    )
    mockAwardCanonicalReward.mockResolvedValue({
      awarded: true,
      xpEarned: 500,
      gemsEarned: 200,
      questProgress: [],
    })
    mockReviewMilestoneProject.mockResolvedValue({ score: 100, feedback: 'Výborně' })
  })

  it('uses canonical content completion in the exact eligibility range', async () => {
    mockPrisma.chapterProgress.count.mockResolvedValue(9)

    const response = await GET({
      url: 'http://localhost/api/milestone-test?milestone=10',
    } as NextRequest)

    expect(response.status).toBe(400)
    expect(mockPrisma.chapterProgress.count).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough(10) } },
      },
    })
    expect(mockPrisma.chapter.findMany).not.toHaveBeenCalled()
  })

  it('returns a deterministic 20-question set without an answer key', async () => {
    const response = await GET({
      url: 'http://localhost/api/milestone-test?milestone=10',
    } as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.questions).toHaveLength(20)
    expect(body.questions[0]).toEqual({
      id: 'question-01-1',
      order: 1,
      type: 'MULTIPLE_CHOICE',
      question: 'Otázka 1',
      options: ['správně', 'špatně'],
      chapterTitle: 'Kapitola 01',
      chapterId: '01',
    })
    expect(JSON.stringify(body)).not.toContain('correctAnswer')
    expect(mockPrisma.chapter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { chapterId: { in: canonicalChapterIdsThrough(10) } },
        orderBy: { order: 'asc' },
      })
    )
  })

  it('rejects a substituted question even when exactly 20 answers are sent', async () => {
    const questionIds = buildAssessmentChapters().flatMap(chapter =>
      chapter.questions.map(question => question.id)
    )
    const answers = Object.fromEntries(questionIds.map(id => [id, 0]))
    delete answers[questionIds[0]!]
    answers['question-from-another-test'] = 0

    const response = await POST(requestWithBody({ milestone: 10, answers }))

    expect(response.status).toBe(400)
    expect(mockRunLearningTransaction).not.toHaveBeenCalled()
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
  })

  it('awards a stable ledger source once and replays a passed test without lowering it', async () => {
    const questionIds = buildAssessmentChapters().flatMap(chapter =>
      chapter.questions.map(question => question.id)
    )
    const requestBody = {
      milestone: 10,
      answers: Object.fromEntries(questionIds.map(id => [id, 0])),
    }

    const firstResponse = await POST(requestWithBody(requestBody))
    const firstBody = await firstResponse.json()

    expect(firstBody).toMatchObject({
      passed: true,
      xpEarned: 500,
      gemsEarned: 200,
    })
    expect(mockAwardCanonicalReward).toHaveBeenCalledTimes(1)
    expect(mockAwardCanonicalReward).toHaveBeenCalledWith(
      mockTx,
      expect.objectContaining({
        userId: 'user-1',
        sourceType: 'MILESTONE_PASS',
        sourceId: '10',
        xpAmount: 500,
        gemAmount: 200,
      })
    )

    mockPrisma.milestoneTest.findUnique.mockResolvedValue({
      id: 'test-1',
      passed: true,
      score: 100,
      questionsCorrect: 20,
      questionsTotal: 20,
      projectScore: null,
      projectFeedback: null,
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
    })
    expect(mockRunLearningTransaction).toHaveBeenCalledTimes(1)
    expect(mockAwardCanonicalReward).toHaveBeenCalledTimes(1)
  })

  it('preserves a concurrently passed attempt inside the transaction', async () => {
    const questionIds = buildAssessmentChapters().flatMap(chapter =>
      chapter.questions.map(question => question.id)
    )
    mockTx.milestoneTest.findUnique.mockResolvedValue({
      id: 'test-1',
      passed: true,
      score: 85,
      questionsCorrect: 17,
      questionsTotal: 20,
      projectScore: null,
      projectFeedback: null,
    })

    const response = await POST(
      requestWithBody({
        milestone: 10,
        answers: Object.fromEntries(questionIds.map(id => [id, 0])),
      })
    )
    const body = await response.json()

    expect(body).toMatchObject({ replayed: true, passed: true, score: 85 })
    expect(mockTx.milestoneTest.upsert).not.toHaveBeenCalled()
    expect(mockAwardCanonicalReward).not.toHaveBeenCalled()
  })
})
