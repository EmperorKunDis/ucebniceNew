import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import { updateStreak } from '../streak-manager'

function startOfLocalDay(value: Date): Date {
  const result = new Date(value)
  result.setHours(0, 0, 0, 0)
  return result
}

describe('updateStreak milestone rewards', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('records and grants milestone gems exactly once under concurrent replay', async () => {
    const yesterday = startOfLocalDay(new Date())
    yesterday.setDate(yesterday.getDate() - 1)

    let gems = 0
    const userAchievements = new Set<string>()
    const rewardLedger = new Set<string>()
    const client = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          currentStreak: 2,
          longestStreak: 2,
          lastActiveDate: yesterday,
        }),
        update: vi.fn(async ({ data }: { data: { gems?: { increment: number } } }) => {
          gems += data.gems?.increment ?? 0
          return {}
        }),
      },
      streakHistory: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      userPurchase: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      achievement: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'achievement-streak-3',
          badgeId: 'streak_3',
          name: 'Třídenní série',
          gemReward: 5,
        }),
      },
      userAchievement: {
        createMany: vi.fn(async ({ data }: { data: Array<{ achievementId: string }> }) => {
          const achievementId = data[0]!.achievementId
          if (userAchievements.has(achievementId)) return { count: 0 }
          userAchievements.add(achievementId)
          return { count: 1 }
        }),
      },
      rewardLedger: {
        createMany: vi.fn(
          async ({
            data,
          }: {
            data: Array<{
              userId: string
              sourceType: string
              sourceId: string
              dedupeKey: string
              gemAmount: number
            }>
          }) => {
            const row = data[0]!
            const key = `${row.userId}:${row.dedupeKey}`
            if (rewardLedger.has(key)) return { count: 0 }
            rewardLedger.add(key)
            return { count: 1 }
          }
        ),
      },
      notification: {
        create: vi.fn().mockResolvedValue({}),
      },
    }

    const concurrentResults = await Promise.all([
      updateStreak('user-1', 10, client as never),
      updateStreak('user-1', 10, client as never),
    ])
    const replay = await updateStreak('user-1', 10, client as never)

    expect(concurrentResults).toEqual([
      expect.objectContaining({ streak: 3, milestone: 3 }),
      expect.objectContaining({ streak: 3, milestone: 3 }),
    ])
    expect(replay).toEqual(expect.objectContaining({ streak: 3, milestone: 3 }))
    expect(userAchievements.size).toBe(1)
    expect(rewardLedger).toEqual(new Set(['user-1:STREAK_MILESTONE:streak_3']))
    expect(gems).toBe(5)
    expect(client.rewardLedger.createMany).toHaveBeenCalledTimes(1)
    expect(client.notification.create).toHaveBeenCalledTimes(1)
    expect(client.user.update).toHaveBeenCalledTimes(4)
  })

  it('does not retroactively grant gems without a new milestone achievement claim', async () => {
    const yesterday = startOfLocalDay(new Date())
    yesterday.setDate(yesterday.getDate() - 1)

    const client = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          currentStreak: 2,
          longestStreak: 2,
          lastActiveDate: yesterday,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      streakHistory: { upsert: vi.fn().mockResolvedValue({}) },
      userPurchase: { findFirst: vi.fn().mockResolvedValue(null) },
      achievement: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'achievement-streak-3',
          badgeId: 'streak_3',
          name: 'Třídenní série',
          gemReward: 5,
        }),
      },
      userAchievement: {
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      rewardLedger: { createMany: vi.fn() },
      notification: { create: vi.fn() },
    }

    await updateStreak('user-1', 10, client as never)

    expect(client.rewardLedger.createMany).not.toHaveBeenCalled()
    expect(client.notification.create).not.toHaveBeenCalled()
    expect(client.user.update).toHaveBeenCalledTimes(1)
  })
})
