#!/usr/bin/env tsx
/**
 * Import data from JSON export to PostgreSQL database
 *
 * Usage: tsx scripts/migration/import-postgres-data.ts
 *
 * Prerequisites:
 * 1. DATABASE_URL environment variable set to PostgreSQL connection string
 * 2. Migration already run (npx prisma migrate deploy)
 * 3. Export file exists at scripts/migration/sqlite-export.json
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

// Create Prisma client pointing to PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface ExportData {
  version: string
  exportedAt: string
  database: string
  stats: Record<string, number>
  data: {
    users: any[]
    lessons: any[]
    achievements: any[]
  }
}

async function importData() {
  console.log('🔄 Starting PostgreSQL data import...\n')

  // Read export file
  const exportPath = path.join(process.cwd(), 'scripts/migration/sqlite-export.json')
  if (!fs.existsSync(exportPath)) {
    throw new Error(`Export file not found at: ${exportPath}`)
  }

  const exportData: ExportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))

  console.log(`📊 Import source: ${exportData.database}`)
  console.log(`📅 Exported at: ${exportData.exportedAt}`)
  console.log(`📦 Version: ${exportData.version}`)
  console.log(`\n📈 Records to import:`)
  Object.entries(exportData.stats).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`)
  })

  try {
    // Import data in transaction
    await prisma.$transaction(
      async tx => {
        let importedCount = 0

        // 1. Import Lessons (no dependencies)
        console.log('\n📚 Importing lessons...')
        for (const lesson of exportData.data.lessons) {
          await tx.lesson.upsert({
            where: { id: lesson.id },
            create: lesson,
            update: lesson,
          })
          importedCount++
        }
        console.log(`  ✓ Imported ${exportData.data.lessons.length} lessons`)

        // 2. Import Achievements (no dependencies)
        console.log('🏆 Importing achievements...')
        for (const achievement of exportData.data.achievements) {
          await tx.achievement.upsert({
            where: { id: achievement.id },
            create: achievement,
            update: achievement,
          })
          importedCount++
        }
        console.log(`  ✓ Imported ${exportData.data.achievements.length} achievements`)

        // 3. Import Users and all related data
        console.log('👥 Importing users and related data...')
        for (const user of exportData.data.users) {
          const {
            accounts,
            sessions,
            completedLessons,
            achievements,
            lessonProgress,
            cognitiveGlitches,
            chapterCompletions,
            questionAnswers,
            projectSubmissions,
            moduleTestAttempts,
            ...userData
          } = user

          // Create/update user
          await tx.user.upsert({
            where: { id: userData.id },
            create: userData,
            update: userData,
          })
          importedCount++

          // Import accounts
          for (const account of accounts || []) {
            await tx.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              create: account,
              update: account,
            })
            importedCount++
          }

          // Import sessions
          for (const session of sessions || []) {
            await tx.session.upsert({
              where: { id: session.id },
              create: session,
              update: session,
            })
            importedCount++
          }

          // Import completed lessons
          for (const cl of completedLessons || []) {
            await tx.completedLesson.upsert({
              where: {
                userId_lessonId: {
                  userId: cl.userId,
                  lessonId: cl.lessonId,
                },
              },
              create: cl,
              update: cl,
            })
            importedCount++
          }

          // Import user achievements
          for (const ua of achievements || []) {
            await tx.userAchievement.upsert({
              where: {
                userId_achievementId: {
                  userId: ua.userId,
                  achievementId: ua.achievementId,
                },
              },
              create: ua,
              update: ua,
            })
            importedCount++
          }

          // Import lesson progress
          for (const lp of lessonProgress || []) {
            await tx.lessonProgress.upsert({
              where: {
                userId_lessonId: {
                  userId: lp.userId,
                  lessonId: lp.lessonId,
                },
              },
              create: lp,
              update: lp,
            })
            importedCount++
          }

          // Import cognitive glitch attempts
          for (const cg of cognitiveGlitches || []) {
            await tx.cognitiveGlitchAttempt.upsert({
              where: { id: cg.id },
              create: cg,
              update: cg,
            })
            importedCount++
          }

          // Import chapter completions
          for (const cc of chapterCompletions || []) {
            await tx.chapterCompletion.upsert({
              where: {
                userId_chapterId: {
                  userId: cc.userId,
                  chapterId: cc.chapterId,
                },
              },
              create: cc,
              update: cc,
            })
            importedCount++
          }

          // Import question answers
          for (const qa of questionAnswers || []) {
            await tx.questionAnswer.upsert({
              where: {
                userId_chapterId_questionId: {
                  userId: qa.userId,
                  chapterId: qa.chapterId,
                  questionId: qa.questionId,
                },
              },
              create: qa,
              update: qa,
            })
            importedCount++
          }

          // Import project submissions
          for (const ps of projectSubmissions || []) {
            await tx.projectSubmission.upsert({
              where: {
                userId_chapterId: {
                  userId: ps.userId,
                  chapterId: ps.chapterId,
                },
              },
              create: ps,
              update: ps,
            })
            importedCount++
          }

          // Import module test attempts
          for (const mt of moduleTestAttempts || []) {
            await tx.moduleTestAttempt.upsert({
              where: { id: mt.id },
              create: mt,
              update: mt,
            })
            importedCount++
          }
        }

        console.log(`  ✓ Imported ${exportData.data.users.length} users with all relations`)
        console.log(`\n✅ Total records imported: ${importedCount}`)
      },
      {
        maxWait: 60000, // 60 seconds
        timeout: 300000, // 5 minutes
      }
    )

    console.log('\n✅ Data import successful!')
  } catch (error) {
    console.error('❌ Error importing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run import
importData()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })
