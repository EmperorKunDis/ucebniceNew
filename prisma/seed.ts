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

  const quests = [
    {
      type: QuestType.DAILY,
      category: QuestCategory.LESSONS_COMPLETED,
      title: 'Pilný student',
      description: 'Dokonči 3 lekce',
      targetValue: 3,
      xpReward: 20,
      gemReward: 5,
      icon: '📚',
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
      type: QuestType.DAILY,
      category: QuestCategory.EXERCISES_PERFECT,
      title: 'Bezchybný',
      description: '10 správných odpovědí v řadě',
      targetValue: 10,
      xpReward: 50,
      gemReward: 15,
      icon: '🎯',
    },
    {
      type: QuestType.DAILY,
      category: QuestCategory.HEARTS_PRESERVED,
      title: 'Opatrný student',
      description: 'Dokonči 5 cvičení bez ztráty srdce',
      targetValue: 5,
      xpReward: 40,
      gemReward: 10,
      icon: '❤️',
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
      category: QuestCategory.STREAK_MAINTAINED,
      title: 'Věrný student',
      description: 'Udrž streak 7 dní v řadě',
      targetValue: 7,
      xpReward: 100,
      gemReward: 30,
      icon: '🔥',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.FRIENDS_ENCOURAGED,
      title: 'Sociální motivátor',
      description: 'Povzbuď 3 přátele',
      targetValue: 3,
      xpReward: 50,
      gemReward: 20,
      icon: '💪',
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
      description: 'Dokonči 3 kapitoly',
      targetValue: 3,
      xpReward: 250,
      gemReward: 100,
      icon: '🗺️',
    },
  ]

  for (const quest of quests) {
    const existingQuest = await prisma.quest.findFirst({
      where: {
        type: quest.type,
        category: quest.category,
      },
    })

    if (existingQuest) {
      await prisma.quest.update({
        where: { id: existingQuest.id },
        data: { ...quest, isActive: true },
      })
    } else {
      await prisma.quest.create({ data: quest })
    }
  }

  console.log(`Seeded ${quests.length} quests`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
