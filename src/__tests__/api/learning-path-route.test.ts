import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET } from '@/app/api/learning-path/route'
import { prisma } from '@/lib/prisma'

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
      findMany: jest.fn(),
    },
    chapterProgress: {
      findMany: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockPrisma = prisma as unknown as {
  chapter: {
    findMany: jest.Mock
  }
  chapterProgress: {
    findMany: jest.Mock
  }
}

describe('/api/learning-path', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.chapter.findMany.mockResolvedValue([
      {
        id: 'chapter-db-01',
        chapterId: '01',
        title: 'Uvod do Pythonu',
        description: 'Zaklady',
        order: 1,
        module: 1,
        xpReward: 100,
        difficulty: 'EASY',
      },
      {
        id: 'chapter-db-02',
        chapterId: '02',
        title: 'Promenne',
        description: 'Hodnoty',
        order: 2,
        module: 1,
        xpReward: 100,
        difficulty: 'EASY',
      },
    ])
  })

  it('uses ChapterProgress as the gamified dashboard source of truth', async () => {
    mockPrisma.chapterProgress.findMany.mockResolvedValue([
      {
        chapterId: 'chapter-db-01',
        progress: 50,
        lessonsCompleted: 1,
        exercisesCorrect: 3,
        exercisesTotal: 4,
      },
    ])

    const response = await GET({} as NextRequest)

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.nodes).toEqual([
      expect.objectContaining({
        id: '01',
        status: 'active',
        stars: 1,
        progress: 50,
        lessonsCompleted: 1,
      }),
      expect.objectContaining({
        id: '02',
        status: 'locked',
        stars: 0,
        progress: 0,
      }),
    ])
    expect(body.data.userProgress).toMatchObject({
      totalCompleted: 0,
      totalChapters: 2,
      currentChapter: '01',
      totalStars: 1,
      maxStars: 6,
      percentage: 0,
    })
  })

  it('marks nodes completed only when gamified progress reaches 100 percent', async () => {
    mockPrisma.chapterProgress.findMany.mockResolvedValue([
      {
        chapterId: 'chapter-db-01',
        progress: 100,
        lessonsCompleted: 3,
        exercisesCorrect: 8,
        exercisesTotal: 10,
      },
    ])

    const response = await GET({} as NextRequest)
    const body = await response.json()

    expect(body.data.nodes[0]).toMatchObject({
      id: '01',
      status: 'completed',
      stars: 3,
      progress: 100,
    })
    expect(body.data.nodes[1]).toMatchObject({
      id: '02',
      status: 'active',
    })
    expect(body.data.userProgress).toMatchObject({
      totalCompleted: 1,
      currentChapter: '02',
      totalStars: 3,
      percentage: 50,
    })
  })
})
