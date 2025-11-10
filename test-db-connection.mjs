// Quick test script to verify SQLite database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing SQLite database connection...\n')

  try {
    // Test 1: Count lessons
    const lessonCount = await prisma.lesson.count()
    console.log(`✅ Lessons in database: ${lessonCount}`)

    // Test 2: Get first lesson
    const firstLesson = await prisma.lesson.findFirst({
      orderBy: { order: 'asc' },
    })
    console.log(`✅ First lesson: ${firstLesson?.title}`)

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
