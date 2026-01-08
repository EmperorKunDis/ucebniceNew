// Quick test script to verify database connection
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  try {
    // Test 1: Count chapters
    const chapterCount = await prisma.chapter.count()
    console.log(`✅ Chapters in database: ${chapterCount}`)

    // Test 2: Get first chapter
    const firstChapter = await prisma.chapter.findFirst({
      orderBy: { order: 'asc' },
    })
    console.log(`✅ First chapter: ${firstChapter?.title}`)

    // Test 3: Count users
    const userCount = await prisma.user.count()
    console.log(`✅ Users in database: ${userCount}`)

    // Test 4: Test database write
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        username: `testuser${Date.now()}`,
      },
    })
    console.log(`✅ Created test user: ${testUser.name}`)

    // Clean up
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log(`✅ Deleted test user`)

    console.log('\n🎉 All database tests passed!')
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
