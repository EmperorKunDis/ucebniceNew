import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { GET as getAllProgress } from '@/app/api/chapters/all-progress/route'
import { GET as getChapterProgress } from '@/app/api/chapters/progress/route'
import { canonicalChapterIdsThrough } from '@/lib/canonical-content-keys'
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
    user: { findUnique: jest.fn() },
    chapter: { findUnique: jest.fn() },
    chapterProgress: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    questionAnswer: { findMany: jest.fn() },
    projectSubmission: { findUnique: jest.fn() },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock }
  chapter: { findUnique: jest.Mock }
  chapterProgress: { findUnique: jest.Mock; findMany: jest.Mock }
  questionAnswer: { findMany: jest.Mock }
  projectSubmission: { findUnique: jest.Mock }
}

describe('canonical chapter progress compatibility routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { email: 'student@example.com' } })
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' })
    mockPrisma.questionAnswer.findMany.mockResolvedValue([])
    mockPrisma.projectSubmission.findUnique.mockResolvedValue(null)
  })

  it('maps the public chapter slug to Chapter.id before reading ChapterProgress', async () => {
    mockPrisma.chapter.findUnique.mockResolvedValue({ id: 'chapter-db-01' })
    mockPrisma.chapterProgress.findUnique.mockResolvedValue({
      contentCompleted: true,
      exercisesCompleted: true,
      projectApproved: false,
      stars: 2,
    })

    const response = await getChapterProgress({
      url: 'http://localhost/api/chapters/progress?chapterId=01',
    } as NextRequest)

    expect(mockPrisma.chapter.findUnique).toHaveBeenCalledWith({
      where: { chapterId: '01' },
      select: { id: true },
    })
    expect(mockPrisma.chapterProgress.findUnique).toHaveBeenCalledWith({
      where: {
        userId_chapterId: {
          userId: 'user-1',
          chapterId: 'chapter-db-01',
        },
      },
    })
    await expect(response.json()).resolves.toMatchObject({
      completedChapter: true,
      answeredQuestions: true,
      submittedProject: false,
      stars: 2,
    })
  })

  it('builds the all-progress map only from ChapterProgress', async () => {
    mockPrisma.chapterProgress.findMany.mockResolvedValue([
      {
        chapter: { chapterId: '01' },
        contentCompleted: true,
        exercisesCompleted: false,
        projectApproved: false,
        stars: 1,
      },
    ])

    const response = await getAllProgress({} as NextRequest)

    expect(mockPrisma.chapterProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
      include: { chapter: { select: { chapterId: true } } },
    })
    await expect(response.json()).resolves.toEqual({
      progress: {
        '01': {
          completedChapter: true,
          answeredQuestions: false,
          submittedProject: false,
          completed: true,
          stars: 1,
        },
      },
    })
  })
})
