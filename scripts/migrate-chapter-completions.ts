/**
 * Migration Script: CompletedChapter -> ChapterCompletion
 *
 * This script migrates data from the deprecated CompletedChapter model
 * to the new ChapterCompletion model, resolving the ID format mismatch.
 *
 * CompletedChapter uses Chapter.id (UUID)
 * ChapterCompletion uses Chapter.chapterId (string like "01", "02")
 *
 * Run with: npx tsx scripts/migrate-chapter-completions.ts
 */

// Use the project's prisma instance
import { prisma } from '../src/lib/prisma'

async function migrateChapterCompletions() {
  console.log('Starting migration: CompletedChapter -> ChapterCompletion')

  // Get all old completions with chapter info
  const oldCompletions = await prisma.completedChapter.findMany({
    include: {
      chapter: true,
    },
  })

  console.log(`Found ${oldCompletions.length} old completion records`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const old of oldCompletions) {
    try {
      // Check if new completion already exists
      const existing = await prisma.chapterCompletion.findUnique({
        where: {
          userId_chapterId: {
            userId: old.userId,
            chapterId: old.chapter.chapterId, // Use string format
          },
        },
      })

      if (existing) {
        // Update existing if not already marked as completed
        if (!existing.completedChapter) {
          await prisma.chapterCompletion.update({
            where: { id: existing.id },
            data: {
              completedChapter: true,
              xpEarned: Math.max(existing.xpEarned, old.xpEarned),
              completedAt:
                old.completedAt < existing.completedAt ? old.completedAt : existing.completedAt,
            },
          })
          migrated++
          console.log(`Updated: user=${old.userId}, chapter=${old.chapter.chapterId}`)
        } else {
          skipped++
        }
      } else {
        // Create new completion record
        await prisma.chapterCompletion.create({
          data: {
            userId: old.userId,
            chapterId: old.chapter.chapterId,
            completedChapter: true,
            answeredQuestions: false,
            submittedProject: false,
            stars: 1,
            xpEarned: old.xpEarned,
            completedAt: old.completedAt,
          },
        })
        migrated++
        console.log(`Created: user=${old.userId}, chapter=${old.chapter.chapterId}`)
      }
    } catch (error) {
      console.error(`Error migrating user=${old.userId}, chapter=${old.chapterId}:`, error)
      errors++
    }
  }

  console.log('\n--- Migration Summary ---')
  console.log(`Total records: ${oldCompletions.length}`)
  console.log(`Migrated: ${migrated}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Errors: ${errors}`)

  // Verify migration
  const newCount = await prisma.chapterCompletion.count({
    where: { completedChapter: true },
  })
  console.log(`\nNew ChapterCompletion records with completedChapter=true: ${newCount}`)
}

async function main() {
  try {
    await migrateChapterCompletions()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
