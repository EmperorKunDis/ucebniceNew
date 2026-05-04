import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Test database helper
 * Provides utilities for managing test database state
 */

let prisma: PrismaClient
let pool: Pool

export function getTestDb() {
  if (!prisma) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}

export async function cleanupTestDb() {
  const db = getTestDb()

  // Clean up in order to respect foreign key constraints
  await db.analyticsEvent.deleteMany()
  await db.notification.deleteMany()
  await db.userQuest.deleteMany()
  await db.quest.deleteMany()
  await db.friendship.deleteMany()
  await db.leagueMembership.deleteMany()
  await db.league.deleteMany()
  await db.aIChatHistory.deleteMany()
  await db.reviewCard.deleteMany()
  await db.questionAnswer.deleteMany()
  await db.userAchievement.deleteMany()
  await db.achievement.deleteMany()
  await db.chapterCompletion.deleteMany()
  await db.chapterProgress.deleteMany()
  await db.userPurchase.deleteMany()
  await db.shopItem.deleteMany()
  await db.account.deleteMany()
  await db.session.deleteMany()
  await db.user.deleteMany()
}

export async function disconnectTestDb() {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (pool) {
    await pool.end()
  }
}

/**
 * Create a test user with credentials
 */
export async function createTestUser(data: {
  email: string
  username: string
  name: string
  password?: string
  xp?: number
  level?: number
  gems?: number
  hearts?: number
}) {
  const db = getTestDb()
  const bcrypt = await import('bcryptjs')

  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 12)
    : await bcrypt.hash('Test123!', 12)

  return db.user.create({
    data: {
      email: data.email,
      username: data.username,
      name: data.name,
      password: hashedPassword,
      xp: data.xp ?? 0,
      level: data.level ?? 1,
      gems: data.gems ?? 100,
      hearts: data.hearts ?? 5,
      maxHearts: 5,
      currentStreak: 0,
      longestStreak: 0,
    },
  })
}

/**
 * Create chapter completion for a user
 */
export async function createChapterCompletion(data: {
  userId: string
  chapterId: string
  stars?: number
  xpEarned?: number
}) {
  const db = getTestDb()
  return db.chapterCompletion.create({
    data: {
      userId: data.userId,
      chapterId: data.chapterId,
      completedChapter: true,
      stars: data.stars ?? 3,
      xpEarned: data.xpEarned ?? 100,
    },
  })
}

/**
 * Create a quest for testing
 */
export async function createTestQuest(data: {
  type: 'DAILY' | 'WEEKLY'
  title: string
  targetValue: number
  xpReward: number
  gemReward?: number
}) {
  const db = getTestDb()
  return db.quest.create({
    data: {
      type: data.type,
      category: 'LESSONS_COMPLETED',
      title: data.title,
      description: `Complete ${data.targetValue} tasks`,
      targetValue: data.targetValue,
      xpReward: data.xpReward,
      gemReward: data.gemReward ?? 0,
      icon: '🎯',
      isActive: true,
    },
  })
}

/**
 * Create a shop item for testing
 */
export async function createTestShopItem(data: {
  name: string
  price: number
  category: 'POWER_UP' | 'COSMETIC' | 'STREAK' | 'HEART' | 'XP_BOOST'
}) {
  const db = getTestDb()
  return db.shopItem.create({
    data: {
      key: `test-${Date.now()}`,
      name: data.name,
      description: `Test ${data.category}`,
      category: data.category,
      price: data.price,
      icon: '🛒',
      effectData: {},
      isActive: true,
    },
  })
}
