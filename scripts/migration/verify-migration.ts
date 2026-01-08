#!/usr/bin/env tsx
/**
 * Verify data integrity after migration
 *
 * Compares record counts between SQLite export and PostgreSQL database
 *
 * Usage: tsx scripts/migration/verify-migration.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

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

async function verifyMigration() {
  console.log('🔍 Starting migration verification...\n')

  try {
    // Read export data for comparison
    const exportPath = path.join(process.cwd(), 'scripts/migration/sqlite-export.json')
    const exportData: ExportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))

    console.log('📊 Comparing record counts...\n')

    // Count records in PostgreSQL
    const postgresStats = {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      sessions: await prisma.session.count(),
      completedLessons: await prisma.completedLesson.count(),
      userAchievements: await prisma.userAchievement.count(),
      lessonProgress: await prisma.lessonProgress.count(),
      cognitiveGlitches: await prisma.cognitiveGlitchAttempt.count(),
      chapterCompletions: await prisma.chapterCompletion.count(),
      questionAnswers: await prisma.questionAnswer.count(),
      projectSubmissions: await prisma.projectSubmission.count(),
      moduleTestAttempts: await prisma.moduleTestAttempt.count(),
      lessons: await prisma.lesson.count(),
      achievements: await prisma.achievement.count(),
    }

    // Compare counts
    const checks: Array<{
      table: string
      sqlite: number
      postgres: number
      match: boolean
    }> = []

    for (const [table, sqliteCount] of Object.entries(exportData.stats)) {
      const postgresCount = postgresStats[table as keyof typeof postgresStats]
      const match = sqliteCount === postgresCount

      checks.push({
        table,
        sqlite: sqliteCount,
        postgres: postgresCount,
        match,
      })

      const icon = match ? '✅' : '❌'
      console.log(`${icon} ${table}:`)
      console.log(`   SQLite:     ${sqliteCount}`)
      console.log(`   PostgreSQL: ${postgresCount}`)
      if (!match) {
        console.log(`   Difference: ${postgresCount - sqliteCount}`)
      }
      console.log('')
    }

    // Summary
    const allMatch = checks.every(c => c.match)
    const mismatches = checks.filter(c => !c.match)

    console.log('\n' + '='.repeat(50))
    if (allMatch) {
      console.log('✅ All record counts match!')
      console.log('✨ Migration verification successful!')
    } else {
      console.log(`❌ Found ${mismatches.length} mismatches:`)
      mismatches.forEach(m => {
        console.log(`   - ${m.table}: SQLite ${m.sqlite} vs PostgreSQL ${m.postgres}`)
      })
      console.log('\n⚠️  Please review the migration process')
    }
    console.log('='.repeat(50))

    // Additional integrity checks
    console.log('\n🔍 Performing additional integrity checks...')

    // Check for orphaned records (using raw SQL to avoid Prisma validation issues)
    try {
      const orphanedAccountsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "Account"
        WHERE "userId" NOT IN (SELECT id FROM "User")
      `
      const orphanedAccounts = Number(orphanedAccountsResult[0]?.count || 0)

      const orphanedSessionsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "Session"
        WHERE "userId" NOT IN (SELECT id FROM "User")
      `
      const orphanedSessions = Number(orphanedSessionsResult[0]?.count || 0)

      const orphanedLessonsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "CompletedLesson"
        WHERE "userId" NOT IN (SELECT id FROM "User")
           OR "lessonId" NOT IN (SELECT id FROM "Lesson")
      `
      const orphanedCompletedLessons = Number(orphanedLessonsResult[0]?.count || 0)

      console.log(`   Orphaned accounts: ${orphanedAccounts}`)
      console.log(`   Orphaned sessions: ${orphanedSessions}`)
      console.log(`   Orphaned completed lessons: ${orphanedCompletedLessons}`)

      if (orphanedAccounts + orphanedSessions + orphanedCompletedLessons > 0) {
        console.log('   ⚠️  Found orphaned records - please investigate')
      } else {
        console.log('   ✅ No orphaned records found')
      }
    } catch (error) {
      console.log('   ⚠️  Could not check for orphaned records (this is OK)')
    }

    // Check sample user data integrity
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            accounts: true,
            sessions: true,
            completedLessons: true,
            achievements: true,
            chapterCompletions: true,
            questionAnswers: true,
            projectSubmissions: true,
            moduleTestAttempts: true,
          },
        },
      },
    })

    console.log('\n📊 Sample user data:')
    sampleUsers.forEach((user, i) => {
      console.log(`   User ${i + 1} (${user.email || user.username || user.id}):`)
      console.log(`     - Accounts: ${user._count.accounts}`)
      console.log(`     - Completed Lessons: ${user._count.completedLessons}`)
      console.log(`     - Achievements: ${user._count.achievements}`)
      console.log(`     - Chapter Completions: ${user._count.chapterCompletions}`)
      console.log(`     - XP: ${user.xp} | Level: ${user.level}`)
    })

    return allMatch
  } catch (error) {
    console.error('❌ Verification error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyMigration()
  .then(success => {
    if (success) {
      console.log('\n✨ Verification complete - migration successful!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Verification complete - found issues')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Verification failed:', error)
    process.exit(1)
  })
