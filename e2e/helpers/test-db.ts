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
  await db.userAchievement.deleteMany()
  await db.achievement.deleteMany()
  await db.completedLesson.deleteMany()
  await db.lessonProgress.deleteMany()
  await db.lesson.deleteMany()
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
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
    },
  })
}
