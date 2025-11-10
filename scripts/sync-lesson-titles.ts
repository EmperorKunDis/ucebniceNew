/**
 * BUG-002: Database Lesson Titles Sync Script
 * 
 * This script syncs lesson titles from chapters.ts to the database.
 * It updates the Lesson table with meaningful titles instead of generic "Chapter XX".
 */

import { PrismaClient } from '@prisma/client'
import { chapters } from '../src/data/chapters'

const prisma = new PrismaClient()

async function syncLessonTitles() {
  console.log('🔄 Starting lesson title synchronization...')
  console.log(`📚 Found ${chapters.length} chapters to sync\n`)

  let successCount = 0
  let errorCount = 0

  for (const chapter of chapters) {
    try {
      // Update lesson title in database
      const result = await prisma.lesson.update({
        where: {
          chapterId: chapter.id,
        },
        data: {
          title: chapter.title,
        },
      })

      console.log(`✅ Chapter ${chapter.id}: "${chapter.title}"`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to update Chapter ${chapter.id}:`, error)
      errorCount++
    }
  }

  console.log('\n📊 Synchronization Summary:')
  console.log(`   ✅ Successfully updated: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  console.log(`   📚 Total chapters: ${chapters.length}`)

  // Verify the changes
  console.log('\n🔍 Verifying database state...')
  const lessons = await prisma.lesson.findMany({
    select: {
      chapterId: true,
      title: true,
    },
    orderBy: {
      chapterId: 'asc',
    },
    take: 5,
  })

  console.log('\n📝 First 5 lessons in database:')
  lessons.forEach(lesson => {
    console.log(`   ${lesson.chapterId}: ${lesson.title}`)
  })
}

async function main() {
  try {
    await syncLessonTitles()
    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
