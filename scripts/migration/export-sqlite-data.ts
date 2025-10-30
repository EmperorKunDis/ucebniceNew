#!/usr/bin/env tsx
/**
 * Export all data from SQLite database to JSON
 *
 * Usage: tsx scripts/migration/export-sqlite-data.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Create Prisma client pointing to SQLite database
// Use absolute path to ensure we find the database
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
})

async function exportData() {
  console.log('🔄 Starting SQLite data export...\n')

  try {
    // Export all tables
    console.log('📊 Exporting users...')
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        completedLessons: true,
        achievements: true,
        lessonProgress: true,
        cognitiveGlitches: true,
        chapterCompletions: true,
        questionAnswers: true,
        projectSubmissions: true,
        moduleTestAttempts: true,
      },
    })
    console.log(`  ✓ Found ${users.length} users`)

    console.log('📊 Exporting lessons...')
    const lessons = await prisma.lesson.findMany()
    console.log(`  ✓ Found ${lessons.length} lessons`)

    console.log('📊 Exporting achievements...')
    const achievements = await prisma.achievement.findMany()
    console.log(`  ✓ Found ${achievements.length} achievements`)

    // Count total records
    const stats = {
      users: users.length,
      accounts: users.reduce((sum, u) => sum + u.accounts.length, 0),
      sessions: users.reduce((sum, u) => sum + u.sessions.length, 0),
      completedLessons: users.reduce((sum, u) => sum + u.completedLessons.length, 0),
      userAchievements: users.reduce((sum, u) => sum + u.achievements.length, 0),
      lessonProgress: users.reduce((sum, u) => sum + u.lessonProgress.length, 0),
      cognitiveGlitches: users.reduce((sum, u) => sum + u.cognitiveGlitches.length, 0),
      chapterCompletions: users.reduce((sum, u) => sum + u.chapterCompletions.length, 0),
      questionAnswers: users.reduce((sum, u) => sum + u.questionAnswers.length, 0),
      projectSubmissions: users.reduce((sum, u) => sum + u.projectSubmissions.length, 0),
      moduleTestAttempts: users.reduce((sum, u) => sum + u.moduleTestAttempts.length, 0),
      lessons: lessons.length,
      achievements: achievements.length,
    }

    // Prepare export data
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      database: 'SQLite',
      stats,
      data: {
        users,
        lessons,
        achievements,
      },
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), 'scripts/migration/sqlite-export.json')
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

    console.log('\n✅ Data exported successfully!')
    console.log(`📁 Output: ${outputPath}`)
    console.log(`📊 Total records exported: ${Object.values(stats).reduce((a, b) => a + b, 0)}`)
    console.log('\nExport statistics:')
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`)
    })
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run export
exportData()
  .then(() => {
    console.log('\n✨ Export complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Export failed:', error)
    process.exit(1)
  })
