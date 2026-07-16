import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET } from '@/app/api/micro-lessons/[chapterId]/route'
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
      findUnique: jest.fn(),
    },
    chapterProgress: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockPrisma = prisma as unknown as {
  chapter: {
    findUnique: jest.Mock
  }
  chapterProgress: {
    findUnique: jest.Mock
  }
}

const chapter = {
  id: 'chapter-db-01',
  chapterId: '01',
  title: 'Uvod do Pythonu',
  description: 'Zaklady prace s Pythonem',
  difficulty: 'EASY',
  microLessons: [
    {
      id: 'lesson-1',
      order: 1,
      title: 'Promenne',
      xpReward: 10,
      progress: [{ completed: true, completedAt: new Date() }],
      exercises: [
        {
          id: 'exercise-1',
          order: 1,
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          question: 'Co je promenna?',
          data: { options: ['Hodnota', 'Soubor'], correctIndex: 0 },
          explanation: 'Promenna uchovava hodnotu.',
          hints: ['Je to pojmenovane misto pro hodnotu.'],
          xpReward: 5,
        },
      ],
    },
  ],
}

function requestFor(path: string) {
  return {
    nextUrl: new URL(`http://localhost${path}`),
  } as NextRequest
}

describe('/api/micro-lessons/[chapterId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.chapter.findUnique.mockResolvedValue(chapter)
    mockPrisma.chapterProgress.findUnique.mockResolvedValue({
      lessonsCompleted: 1,
      exercisesCorrect: 3,
      exercisesTotal: 4,
      contentCompleted: true,
      exercisesCompleted: false,
      projectApproved: false,
      stars: 1,
    })
  })

  it('returns the overview contract consumed by /learn/[chapterId]', async () => {
    const response = await GET(requestFor('/api/micro-lessons/01'), {
      params: Promise.resolve({ chapterId: '01' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data).toMatchObject({
      chapterId: '01',
      title: 'Uvod do Pythonu',
      chapterTitle: 'Uvod do Pythonu',
      description: 'Zaklady prace s Pythonem',
      chapterDescription: 'Zaklady prace s Pythonem',
      difficulty: 'EASY',
      isUnlocked: true,
      progress: {
        lessonsCompleted: 1,
        totalLessons: 1,
        stars: 1,
        bestScore: 75,
        completed: 1,
        total: 1,
        percentage: 100,
      },
    })

    expect(body.data.lessons).toEqual([
      expect.objectContaining({
        id: 'lesson-1',
        completed: true,
        status: 'completed',
        exerciseCount: 1,
      }),
    ])
  })

  it('returns practice exercises without an answer key', async () => {
    const response = await GET(requestFor('/api/micro-lessons/01?practice=true&limit=1'), {
      params: Promise.resolve({ chapterId: '01' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data).toMatchObject({
      chapterId: '01',
      title: 'Uvod do Pythonu',
      chapterTitle: 'Uvod do Pythonu',
      totalExercises: 1,
      limit: 1,
    })
    expect(body.data.exercises).toEqual([
      expect.objectContaining({
        id: 'exercise-1',
        type: 'MULTIPLE_CHOICE',
        question: 'Co je promenna?',
        data: { options: ['Hodnota', 'Soubor'] },
        lessonId: 'lesson-1',
        lessonTitle: 'Promenne',
      }),
    ])
    expect(body.data.exercises[0].data).not.toHaveProperty('correctIndex')
  })

  it('returns 401 without a session', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET(requestFor('/api/micro-lessons/01'), {
      params: Promise.resolve({ chapterId: '01' }),
    })

    expect(response.status).toBe(401)
  })
})
