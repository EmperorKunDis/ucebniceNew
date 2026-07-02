import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/progress/complete-questions/route'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quest-tracker'

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    chapter: {
      findFirst: jest.fn(),
    },
    chapterCompletion: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/quest-tracker', () => ({
  updateQuestProgress: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockUpdateQuestProgress = updateQuestProgress as jest.Mock
const mockPrisma = prisma as unknown as {
  chapter: {
    findFirst: jest.Mock
  }
  chapterCompletion: {
    findUnique: jest.Mock
  }
  $transaction: jest.Mock
}

function requestWithBody(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('/api/progress/complete-questions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.chapter.findFirst.mockResolvedValue({ id: 'chapter-db-01', chapterId: '01' })
    mockPrisma.chapterCompletion.findUnique.mockResolvedValue(null)
    mockPrisma.$transaction.mockImplementation(async callback =>
      callback({
        chapterCompletion: {
          upsert: jest.fn().mockResolvedValue({
            userId: 'user-1',
            chapterId: '01',
            answeredQuestions: true,
          }),
        },
        user: {
          update: jest.fn().mockResolvedValue({
            gems: 150,
            xp: 0,
          }),
        },
      })
    )
  })

  it('marks static questions complete without incrementing micro-lesson quests', async () => {
    const response = await POST(requestWithBody({ chapterId: '01', score: 100 }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      gemsEarned: 50,
      totalGems: 150,
      answeredQuestions: true,
      score: 100,
    })

    expect(mockUpdateQuestProgress).not.toHaveBeenCalled()
  })
})
