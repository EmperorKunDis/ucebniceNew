import { claimQuestReward } from '@/lib/quest-tracker'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}))

const mockPrisma = prisma as unknown as {
  $transaction: jest.Mock
}

describe('claimQuestReward', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('claims and awards rewards in a transaction', async () => {
    const tx = {
      userQuest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-quest-1',
          completed: true,
          claimed: false,
          quest: {
            xpReward: 30,
            gemReward: 10,
          },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    }
    mockPrisma.$transaction.mockImplementation(callback => callback(tx))

    await expect(claimQuestReward('user-1', 'quest-1')).resolves.toEqual({
      xp: 30,
      gems: 10,
    })

    expect(tx.userQuest.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'user-quest-1',
        claimed: false,
        completed: true,
      },
      data: {
        claimed: true,
        claimedAt: expect.any(Date),
      },
    })
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        xp: { increment: 30 },
        gems: { increment: 10 },
      },
    })
  })

  it('does not award rewards when the quest was already claimed', async () => {
    const tx = {
      userQuest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-quest-1',
          completed: true,
          claimed: true,
          quest: {
            xpReward: 30,
            gemReward: 10,
          },
        }),
        updateMany: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
    }
    mockPrisma.$transaction.mockImplementation(callback => callback(tx))

    await expect(claimQuestReward('user-1', 'quest-1')).resolves.toBeNull()
    expect(tx.userQuest.updateMany).not.toHaveBeenCalled()
    expect(tx.user.update).not.toHaveBeenCalled()
  })

  it('does not award rewards if another claim wins the conditional update', async () => {
    const tx = {
      userQuest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-quest-1',
          completed: true,
          claimed: false,
          quest: {
            xpReward: 30,
            gemReward: 10,
          },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: {
        update: jest.fn(),
      },
    }
    mockPrisma.$transaction.mockImplementation(callback => callback(tx))

    await expect(claimQuestReward('user-1', 'quest-1')).resolves.toBeNull()
    expect(tx.user.update).not.toHaveBeenCalled()
  })
})
