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

import { checkAndAwardAchievements } from '../achievement-checker'
import { canonicalChapterIdsThrough } from '../canonical-content-keys'

type CanonicalProgress = {
  contentCompleted: boolean
  exercisesCompleted: boolean
  projectApproved: boolean
}

function createTransaction(options?: {
  chapterProgress?: CanonicalProgress[]
  preclaimedReward?: boolean
}) {
  const state = {
    xp: 0,
    dailyXP: 0,
    gems: 0,
    level: 1,
  }
  const achievements = new Map<
    string,
    {
      id: string
      badgeId: string
      xpReward: number
      gemReward: number
    }
  >()
  const userAchievements = new Set<string>()
  const rewardLedger = new Set<string>()
  if (options?.preclaimedReward) {
    rewardLedger.add('user-1:ACHIEVEMENT_UNLOCK:first-chapter')
  }

  const tx = {
    user: {
      findUnique: vi.fn().mockResolvedValue({ currentStreak: 0 }),
      update: vi.fn(
        async ({ data }: { data: Record<string, number | { increment: number } | undefined> }) => {
          const xpIncrement = data.xp
          const dailyXpIncrement = data.dailyXP
          const gemsIncrement = data.gems
          state.xp += typeof xpIncrement === 'object' && xpIncrement ? xpIncrement.increment : 0
          state.dailyXP +=
            typeof dailyXpIncrement === 'object' && dailyXpIncrement
              ? dailyXpIncrement.increment
              : 0
          state.gems +=
            typeof gemsIncrement === 'object' && gemsIncrement ? gemsIncrement.increment : 0
          if (typeof data.level === 'number') state.level = data.level
          return { xp: state.xp, level: state.level }
        }
      ),
    },
    userAchievement: {
      findMany: vi.fn(async () =>
        [...userAchievements].map(achievementId => ({
          achievement: { badgeId: achievements.get(achievementId)?.badgeId ?? '' },
        }))
      ),
      createMany: vi.fn(async ({ data }: { data: Array<{ achievementId: string }> }) => {
        const achievementId = data[0]!.achievementId
        if (userAchievements.has(achievementId)) return { count: 0 }
        userAchievements.add(achievementId)
        return { count: 1 }
      }),
    },
    exerciseProgress: {
      count: vi.fn().mockResolvedValue(0),
    },
    chapterProgress: {
      findMany: vi.fn().mockResolvedValue(
        options?.chapterProgress ?? [
          {
            contentCompleted: true,
            exercisesCompleted: false,
            projectApproved: false,
          },
        ]
      ),
    },
    milestoneTest: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    finalTest: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    achievement: {
      upsert: vi.fn(
        async ({ where, create }: { where: { badgeId: string }; create: { xpReward: number } }) => {
          const existing = [...achievements.values()].find(
            achievement => achievement.badgeId === where.badgeId
          )
          if (existing) return existing

          const achievement = {
            id: `achievement-${where.badgeId}`,
            badgeId: where.badgeId,
            xpReward: create.xpReward,
            gemReward: 0,
          }
          achievements.set(achievement.id, achievement)
          return achievement
        }
      ),
    },
    rewardLedger: {
      createMany: vi.fn(
        async ({ data }: { data: Array<{ userId: string; dedupeKey: string }> }) => {
          const row = data[0]!
          const key = `${row.userId}:${row.dedupeKey}`
          if (rewardLedger.has(key)) return { count: 0 }
          rewardLedger.add(key)
          return { count: 1 }
        }
      ),
    },
    leagueMembership: {
      findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }),
      update: vi.fn().mockResolvedValue({}),
    },
  }

  return { tx, state, userAchievements, rewardLedger }
}

describe('checkAndAwardAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prisma.$transaction.mockImplementation(async operation =>
      operation(mocks.transactionClient)
    )
    mocks.updateStreak.mockResolvedValue(null)
    mocks.updateQuestProgress.mockResolvedValue([])
  })

  it('uses only canonical ChapterProgress rows from chapters 1 through 40', async () => {
    const fixture = createTransaction()
    mocks.transactionClient = fixture.tx

    await expect(checkAndAwardAchievements('user-1')).resolves.toEqual(['FIRST_CHAPTER'])

    expect(fixture.tx.chapterProgress.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
      select: {
        contentCompleted: true,
        exercisesCompleted: true,
        projectApproved: true,
      },
    })
    expect(fixture.state.xp).toBe(50)
    expect(fixture.rewardLedger).toEqual(new Set(['user-1:ACHIEVEMENT_UNLOCK:first-chapter']))
  })

  it('awards concurrent and replayed achievement checks exactly once', async () => {
    const fixture = createTransaction()
    mocks.transactionClient = fixture.tx

    const concurrentResults = await Promise.all([
      checkAndAwardAchievements('user-1'),
      checkAndAwardAchievements('user-1'),
    ])
    const replay = await checkAndAwardAchievements('user-1')

    expect(concurrentResults.flat()).toEqual(['FIRST_CHAPTER'])
    expect(replay).toEqual([])
    expect(fixture.userAchievements.size).toBe(1)
    expect(fixture.rewardLedger.size).toBe(1)
    expect(fixture.state.xp).toBe(50)
    expect(fixture.state.dailyXP).toBe(50)
    expect(fixture.tx.user.update).toHaveBeenCalledTimes(1)
    expect(mocks.updateStreak).toHaveBeenCalledTimes(1)
  })

  it('never increments XP when the reward ledger claim already exists', async () => {
    const fixture = createTransaction({ preclaimedReward: true })
    mocks.transactionClient = fixture.tx

    await expect(checkAndAwardAchievements('user-1')).resolves.toEqual(['FIRST_CHAPTER'])

    expect(fixture.userAchievements.size).toBe(1)
    expect(fixture.rewardLedger.size).toBe(1)
    expect(fixture.state.xp).toBe(0)
    expect(fixture.state.dailyXP).toBe(0)
    expect(fixture.tx.user.update).not.toHaveBeenCalled()
    expect(mocks.updateStreak).not.toHaveBeenCalled()
  })
})
