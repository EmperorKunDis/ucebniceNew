import 'dotenv/config'
import { PrismaClient, QuestCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type ProgressInput = {
  userId: string
  questId: string
  targetValue: number
  progress: number
}

async function upsertQuestProgress({ userId, questId, targetValue, progress }: ProgressInput) {
  const cappedProgress = Math.min(progress, targetValue)
  const completed = cappedProgress >= targetValue

  const existing = await prisma.userQuest.findUnique({
    where: {
      userId_questId: {
        userId,
        questId,
      },
    },
  })

  await prisma.userQuest.upsert({
    where: {
      userId_questId: {
        userId,
        questId,
      },
    },
    create: {
      userId,
      questId,
      progress: cappedProgress,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      progress: cappedProgress,
      completed,
      completedAt: completed ? (existing?.completedAt ?? new Date()) : null,
      claimed: completed ? (existing?.claimed ?? false) : false,
      claimedAt: completed ? (existing?.claimedAt ?? null) : null,
    },
  })
}

async function getCompletedChapterCounts() {
  const chapterCompletions = await prisma.chapterCompletion.findMany({
    where: { completedChapter: true },
    select: {
      userId: true,
      chapterId: true,
    },
  })

  const legacyCompletions = await prisma.completedChapter.findMany({
    include: {
      chapter: {
        select: { chapterId: true },
      },
    },
  })

  const completedChaptersByUser = new Map<string, Set<string>>()

  for (const completion of chapterCompletions) {
    const chapters = completedChaptersByUser.get(completion.userId) ?? new Set<string>()
    chapters.add(completion.chapterId)
    completedChaptersByUser.set(completion.userId, chapters)
  }

  for (const completion of legacyCompletions) {
    const chapters = completedChaptersByUser.get(completion.userId) ?? new Set<string>()
    chapters.add(completion.chapter.chapterId)
    completedChaptersByUser.set(completion.userId, chapters)
  }

  return completedChaptersByUser
}

async function main() {
  console.log('Backfilling quest progress...')

  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      category: {
        in: [QuestCategory.CHAPTERS_COMPLETED, QuestCategory.XP_EARNED],
      },
    },
  })

  const chapterQuests = quests.filter(quest => quest.category === QuestCategory.CHAPTERS_COMPLETED)
  const xpQuests = quests.filter(quest => quest.category === QuestCategory.XP_EARNED)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      xp: true,
    },
  })

  const completedChaptersByUser = await getCompletedChapterCounts()
  let updates = 0

  for (const user of users) {
    const completedChapterCount = completedChaptersByUser.get(user.id)?.size ?? 0

    for (const quest of chapterQuests) {
      await upsertQuestProgress({
        userId: user.id,
        questId: quest.id,
        targetValue: quest.targetValue,
        progress: completedChapterCount,
      })
      updates++
    }

    for (const quest of xpQuests) {
      await upsertQuestProgress({
        userId: user.id,
        questId: quest.id,
        targetValue: quest.targetValue,
        progress: user.xp,
      })
      updates++
    }
  }

  console.log(`Backfilled ${updates} quest progress records for ${users.length} users`)
}

main()
  .catch(error => {
    console.error('Quest progress backfill failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
