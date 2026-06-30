import 'dotenv/config'
import { PrismaClient, QuestCategory, QuestType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { chapters } from '../src/data/chapters'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Seed chapters for all chapters
  for (const chapter of chapters) {
    const moduleNumber = Math.ceil(chapter.number / 5)

    await prisma.chapter.upsert({
      where: {
        chapterId: chapter.id,
      },
      update: {
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'MEDIUM',
        order: chapter.number,
        module: moduleNumber,
      },
      create: {
        chapterId: chapter.id,
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'MEDIUM',
        order: chapter.number,
        module: moduleNumber,
      },
    })
  }

  console.log(`Seeded ${chapters.length} chapters`)

  const activeQuests = [
    {
      type: QuestType.DAILY,
      category: QuestCategory.CHAPTERS_COMPLETED,
      title: 'Denní kapitoly',
      description: 'Dokonči 3 kapitoly',
      targetValue: 3,
      xpReward: 20,
      gemReward: 5,
      icon: '🗺️',
    },
    {
      type: QuestType.DAILY,
      category: QuestCategory.XP_EARNED,
      title: 'XP Sběratel',
      description: 'Získej 100 XP',
      targetValue: 100,
      xpReward: 30,
      gemReward: 10,
      icon: '⭐',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.LESSONS_COMPLETED,
      title: 'Týdenní maratón',
      description: 'Dokonči 15 lekcí',
      targetValue: 15,
      xpReward: 150,
      gemReward: 50,
      icon: '📖',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.XP_EARNED,
      title: 'XP Master',
      description: 'Získej 500 XP',
      targetValue: 500,
      xpReward: 200,
      gemReward: 75,
      icon: '🏆',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.REVIEW_SESSIONS,
      title: 'Opakování',
      description: 'Dokonči 5 opakování',
      targetValue: 5,
      xpReward: 75,
      gemReward: 25,
      icon: '🧠',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.CHAPTERS_COMPLETED,
      title: 'Průzkumník',
      description: 'Dokonči 10 kapitol',
      targetValue: 10,
      xpReward: 250,
      gemReward: 100,
      icon: '🗺️',
    },
  ]

  for (const quest of activeQuests) {
    const existingQuests = await prisma.quest.findMany({
      where: {
        type: quest.type,
        category: quest.category,
      },
      orderBy: { createdAt: 'asc' },
    })

    const [existingQuest, ...duplicateQuests] = existingQuests

    if (existingQuest) {
      await prisma.quest.update({
        where: { id: existingQuest.id },
        data: { ...quest, isActive: true },
      })

      if (duplicateQuests.length > 0) {
        await prisma.quest.updateMany({
          where: { id: { in: duplicateQuests.map(q => q.id) } },
          data: { isActive: false },
        })
      }
    } else {
      await prisma.quest.create({ data: quest })
    }
  }

  await prisma.quest.updateMany({
    where: {
      OR: [
        { type: QuestType.DAILY, category: QuestCategory.LESSONS_COMPLETED },
        { category: QuestCategory.STREAK_MAINTAINED },
        { category: QuestCategory.FRIENDS_ENCOURAGED },
        { category: QuestCategory.EXERCISES_PERFECT },
        { category: QuestCategory.HEARTS_PRESERVED },
      ],
    },
    data: { isActive: false },
  })

  console.log(`Seeded ${activeQuests.length} active quests`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
