import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  transactionClient: null as unknown,
  prisma: {
    $transaction: vi.fn(),
  },
  updateStreak: vi.fn(),
  updateQuestProgress: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }))
vi.mock('@/lib/streak-manager', () => ({ updateStreak: mocks.updateStreak }))
vi.mock('@/lib/quest-tracker', () => ({
  updateQuestProgress: mocks.updateQuestProgress,
}))

import {
  assertProjectSubmissionAllowed,
  awardCanonicalReward,
  completeMicroLesson,
  LearningServiceError,
  submitExerciseAnswer,
} from '../learning-service'

describe('canonical learning rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.$transaction.mockImplementation(async operation =>
      operation(mocks.transactionClient)
    )
    mocks.updateStreak.mockResolvedValue(null)
    mocks.updateQuestProgress.mockResolvedValue([])
  })

  it('awards concurrent requests for the same source exactly once', async () => {
    const ledger = new Set<string>()
    let xp = 0
    const tx = {
      rewardLedger: {
        createMany: vi.fn(
          async ({ data }: { data: Array<{ userId: string; dedupeKey: string }> }) => {
            const row = data[0]!
            const key = `${row.userId}:${row.dedupeKey}`
            if (ledger.has(key)) return { count: 0 }
            ledger.add(key)
            return { count: 1 }
          }
        ),
      },
      user: {
        update: vi.fn(async ({ data }: { data: { xp?: { increment: number } } }) => {
          xp += data.xp?.increment ?? 0
          return { xp, level: 1 }
        }),
      },
      leagueMembership: {
        findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }),
        update: vi.fn().mockResolvedValue({}),
      },
    }

    const reward = {
      userId: 'user-1',
      sourceType: 'EXERCISE_CORRECT',
      sourceId: 'exercise-1',
      xpAmount: 20,
      gemAmount: 3,
    }
    const results = await Promise.all([
      awardCanonicalReward(tx as never, reward),
      awardCanonicalReward(tx as never, reward),
    ])

    expect(results.filter(result => result.awarded)).toHaveLength(1)
    expect(results.map(result => result.xpEarned).sort((a, b) => a - b)).toEqual([0, 20])
    expect(tx.user.update).toHaveBeenCalledTimes(1)
    expect(tx.leagueMembership.update).toHaveBeenCalledTimes(1)
    expect(mocks.updateStreak).toHaveBeenCalledTimes(1)
    expect(xp).toBe(20)
  })

  it('replays a wrong answer without consuming another heart or writing another attempt', async () => {
    let hearts = 5
    let storedAttempt: { id: string; exerciseId: string; answer: number; correct: boolean } | null =
      null

    const tx = {
      exerciseAttempt: {
        findUnique: vi.fn().mockImplementation(async () => storedAttempt),
        createMany: vi.fn().mockImplementation(async () => {
          storedAttempt = {
            id: 'attempt-1',
            exerciseId: 'exercise-1',
            answer: 0,
            correct: false,
          }
          return { count: 1 }
        }),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      exercise: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'exercise-1',
          sourceKey: 'exercise:01:01',
          type: 'MULTIPLE_CHOICE',
          data: { options: ['A', 'B'], correctIndex: 1 },
          xpReward: 5,
          microLessonId: 'lesson-1',
          microLesson: {
            isPublished: true,
            sourceKey: 'lesson:01',
            chapter: { id: 'chapter-internal-1', chapterId: '01', order: 1 },
          },
        }),
        count: vi.fn().mockResolvedValue(1),
      },
      chapter: { findUnique: vi.fn().mockResolvedValue(null) },
      microLessonProgress: { findUnique: vi.fn().mockResolvedValue({ completed: true }) },
      user: {
        findUnique: vi.fn().mockImplementation(async () => ({
          hearts,
          unlimitedHeartsUntil: null,
          xp: 0,
          level: 1,
        })),
        updateMany: vi.fn().mockImplementation(async () => {
          if (hearts <= 0) return { count: 0 }
          hearts -= 1
          return { count: 1 }
        }),
      },
      exerciseProgress: {
        upsert: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(0),
      },
      chapterProgress: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({
          contentCompleted: false,
          exercisesCompleted: false,
          projectApproved: false,
          stars: 0,
          progress: 0,
        }),
      },
      chapterCompletion: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      completedChapter: { upsert: vi.fn().mockResolvedValue({}) },
    }
    mocks.transactionClient = tx

    const input = {
      userId: 'user-1',
      exerciseId: 'exercise-1',
      answer: 0,
      dedupeKey: 'attempt-key-1',
    }
    const first = await submitExerciseAnswer(input)
    const replay = await submitExerciseAnswer(input)

    expect(first).toMatchObject({ correct: false, heartLost: true, hearts: 4, replayed: false })
    expect(replay).toMatchObject({
      correct: false,
      heartLost: false,
      hearts: 4,
      replayed: true,
      xpEarned: 0,
    })
    expect(tx.user.updateMany).toHaveBeenCalledTimes(1)
    expect(tx.exerciseAttempt.createMany).toHaveBeenCalledTimes(1)
    expect(tx.exercise.findUnique).toHaveBeenCalledTimes(1)
  })

  it('rejects reuse of an idempotency key for a different answer', async () => {
    const tx = {
      exerciseAttempt: {
        findUnique: vi.fn().mockResolvedValue({
          exerciseId: 'exercise-1',
          answer: { choice: 0, metadata: { source: 'web' } },
          correct: false,
        }),
      },
    }
    mocks.transactionClient = tx

    await expect(
      submitExerciseAnswer({
        userId: 'user-1',
        exerciseId: 'exercise-1',
        answer: { metadata: { source: 'web' }, choice: 1 },
        dedupeKey: 'reused-key',
      })
    ).rejects.toMatchObject<Partial<LearningServiceError>>({ status: 409 })
  })

  it('uses the internal chapter id and requires content plus exercises before a project', async () => {
    const tx = {
      chapter: { findUnique: vi.fn().mockResolvedValue(null) },
      chapterProgress: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ contentCompleted: true, exercisesCompleted: false })
          .mockResolvedValueOnce({ contentCompleted: true, exercisesCompleted: true }),
      },
    }
    const chapter = { id: 'chapter-internal-1', chapterId: '01', order: 1 }

    await expect(
      assertProjectSubmissionAllowed(tx as never, 'user-1', chapter)
    ).rejects.toMatchObject<Partial<LearningServiceError>>({ status: 403 })
    await expect(
      assertProjectSubmissionAllowed(tx as never, 'user-1', chapter)
    ).resolves.toBeUndefined()

    expect(tx.chapterProgress.findUnique).toHaveBeenCalledWith({
      where: {
        userId_chapterId: { userId: 'user-1', chapterId: 'chapter-internal-1' },
      },
      select: { contentCompleted: true, exercisesCompleted: true },
    })
  })

  it('rejects a DB-only chapter at the canonical service boundary', async () => {
    const tx = {
      chapterProgress: { findUnique: vi.fn() },
    }

    await expect(
      assertProjectSubmissionAllowed(tx as never, 'user-1', {
        id: 'chapter-db-only',
        chapterId: 'db-only',
        order: 41,
      })
    ).rejects.toMatchObject<Partial<LearningServiceError>>({ status: 404 })
    expect(tx.chapterProgress.findUnique).not.toHaveBeenCalled()
  })

  it('completes a lesson idempotently and preserves the first completion timestamp', async () => {
    const ledger = new Set<string>()
    let xp = 0
    let lessonProgress: { completed: boolean; completedAt: Date; startedAt: Date } | null = null
    let chapterProgress: {
      contentCompleted: boolean
      exercisesCompleted: boolean
      projectApproved: boolean
      contentCompletedAt: Date | null
      exercisesCompletedAt: Date | null
      projectApprovedAt: Date | null
      lessonsCompleted: number
      exercisesCorrect: number
      exercisesTotal: number
      stars: number
      progress: number
    } | null = null

    const microLessonProgressUpsert = vi.fn(
      async ({
        create,
        update,
      }: {
        create: Record<string, unknown>
        update: Record<string, unknown>
      }) => {
        if (!lessonProgress) {
          lessonProgress = {
            completed: true,
            completedAt: create.completedAt as Date,
            startedAt: create.startedAt as Date,
          }
        } else {
          lessonProgress = {
            completed: true,
            completedAt: update.completedAt as Date,
            startedAt: update.startedAt as Date,
          }
        }
        return lessonProgress
      }
    )
    const tx = {
      microLesson: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'lesson-1',
          sourceKey: 'lesson:01',
          xpReward: 10,
          chapter: { id: 'chapter-internal-1', chapterId: '01', order: 1 },
        }),
        count: vi.fn().mockResolvedValue(1),
      },
      chapter: { findUnique: vi.fn().mockResolvedValue(null) },
      microLessonProgress: {
        findUnique: vi.fn().mockImplementation(async () => lessonProgress),
        upsert: microLessonProgressUpsert,
        count: vi.fn().mockImplementation(async () => (lessonProgress?.completed ? 1 : 0)),
      },
      chapterProgress: {
        findUnique: vi.fn().mockImplementation(async () => chapterProgress),
        upsert: vi.fn().mockImplementation(async () => {
          chapterProgress = {
            contentCompleted: true,
            exercisesCompleted: false,
            projectApproved: false,
            contentCompletedAt: chapterProgress?.contentCompletedAt ?? new Date(),
            exercisesCompletedAt: null,
            projectApprovedAt: null,
            lessonsCompleted: 1,
            exercisesCorrect: 0,
            exercisesTotal: 0,
            stars: 1,
            progress: 33,
          }
          return chapterProgress
        }),
      },
      chapterCompletion: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
      completedChapter: { upsert: vi.fn().mockResolvedValue({}) },
      rewardLedger: {
        createMany: vi.fn(
          async ({ data }: { data: Array<{ userId: string; dedupeKey: string }> }) => {
            const row = data[0]!
            const key = `${row.userId}:${row.dedupeKey}`
            if (ledger.has(key)) return { count: 0 }
            ledger.add(key)
            return { count: 1 }
          }
        ),
      },
      user: {
        update: vi.fn(async ({ data }: { data: { xp?: { increment: number } } }) => {
          xp += data.xp?.increment ?? 0
          return { xp, level: 1 }
        }),
        findUnique: vi.fn().mockImplementation(async () => ({ xp, level: 1 })),
      },
      leagueMembership: {
        findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }),
        update: vi.fn().mockResolvedValue({}),
      },
    }
    mocks.transactionClient = tx

    const first = await completeMicroLesson({ userId: 'user-1', lessonId: 'lesson-1' })
    const firstCompletedAt = lessonProgress?.completedAt
    const replay = await completeMicroLesson({ userId: 'user-1', lessonId: 'lesson-1' })

    expect(first).toMatchObject({ alreadyCompleted: false, xpEarned: 10, contentCompleted: true })
    expect(replay).toMatchObject({ alreadyCompleted: true, xpEarned: 0, contentCompleted: true })
    expect(lessonProgress?.completedAt).toBe(firstCompletedAt)
    expect(tx.user.update).toHaveBeenCalledTimes(1)
    expect(mocks.updateStreak).toHaveBeenCalledTimes(1)
    expect(mocks.updateQuestProgress).toHaveBeenCalledTimes(3)
  })
})
