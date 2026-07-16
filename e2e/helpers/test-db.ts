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

  // User deletion cascades through canonical and compatibility progress,
  // attempts, rewards, projects, tests, certificates and social records.
  await db.user.deleteMany()

  // Clean global fixtures after their user-owned join rows were cascaded.
  await db.quest.deleteMany()
  await db.league.deleteMany()
  await db.achievement.deleteMany()
  await db.shopItem.deleteMany()
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
  const chapter = await db.chapter.findUniqueOrThrow({
    where: { chapterId: data.chapterId },
    select: { id: true, chapterId: true },
  })
  const stars = Math.max(0, Math.min(3, data.stars ?? 3))
  const contentCompleted = stars >= 1
  const exercisesCompleted = stars >= 2
  const projectApproved = stars >= 3
  const now = new Date()

  const progress = await db.chapterProgress.upsert({
    where: { userId_chapterId: { userId: data.userId, chapterId: chapter.id } },
    create: {
      userId: data.userId,
      chapterId: chapter.id,
      progress: Math.round((stars / 3) * 100),
      currentStep: contentCompleted ? 1 : 0,
      totalSteps: 1,
      lessonsCompleted: contentCompleted ? 1 : 0,
      exercisesCorrect: exercisesCompleted ? 10 : 0,
      exercisesTotal: exercisesCompleted ? 10 : 0,
      contentCompleted,
      exercisesCompleted,
      projectApproved,
      stars,
      contentCompletedAt: contentCompleted ? now : null,
      exercisesCompletedAt: exercisesCompleted ? now : null,
      projectApprovedAt: projectApproved ? now : null,
    },
    update: {
      progress: Math.round((stars / 3) * 100),
      lessonsCompleted: contentCompleted ? 1 : 0,
      exercisesCorrect: exercisesCompleted ? 10 : 0,
      exercisesTotal: exercisesCompleted ? 10 : 0,
      contentCompleted,
      exercisesCompleted,
      projectApproved,
      stars,
      contentCompletedAt: contentCompleted ? now : null,
      exercisesCompletedAt: exercisesCompleted ? now : null,
      projectApprovedAt: projectApproved ? now : null,
    },
  })

  // Release A keeps a monotonic compatibility projection for rollback.
  await db.chapterCompletion.upsert({
    where: { userId_chapterId: { userId: data.userId, chapterId: chapter.chapterId } },
    create: {
      userId: data.userId,
      chapterId: chapter.chapterId,
      completedChapter: contentCompleted,
      answeredQuestions: exercisesCompleted,
      submittedProject: projectApproved,
      stars,
      xpEarned: data.xpEarned ?? 100,
    },
    update: {
      completedChapter: contentCompleted,
      answeredQuestions: exercisesCompleted,
      submittedProject: projectApproved,
      stars,
      xpEarned: data.xpEarned ?? 100,
    },
  })
  if (contentCompleted) {
    await db.completedChapter.upsert({
      where: { userId_chapterId: { userId: data.userId, chapterId: chapter.id } },
      create: {
        userId: data.userId,
        chapterId: chapter.id,
        completedAt: now,
        xpEarned: data.xpEarned ?? 100,
      },
      update: {},
    })
  }

  return progress
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
