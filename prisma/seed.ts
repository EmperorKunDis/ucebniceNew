import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient, QuestCategory, QuestType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { chapters } from '../src/data/chapters'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

interface ParsedQuestion {
  questionNumber: number
  questionText: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface ChapterQuestions {
  chapterNumber: number
  questions: ParsedQuestion[]
}

function parseQuestionsFromMarkdown(filePath: string): ChapterQuestions[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const parsedChapters: ChapterQuestions[] = []
  const chapterSections = content.split(/## Kapitola (\d+):/)

  for (let i = 1; i < chapterSections.length; i += 2) {
    const chapterNumStr = chapterSections[i]
    const chapterContent = chapterSections[i + 1]
    if (!chapterNumStr || !chapterContent) continue

    const questionSections = chapterContent.split(/### Otázka (\d+)/)
    const questions: ParsedQuestion[] = []

    for (let j = 1; j < questionSections.length; j += 2) {
      const questionNumStr = questionSections[j]
      const questionContent = questionSections[j + 1]
      if (!questionNumStr || !questionContent) continue

      const questionText = questionContent.match(/\*\*([^*]+)\*\*/)?.[1]?.trim()
      const optionMatches = questionContent.match(/^[a-d]\).+$/gm)
      const correctAnswerLetter = questionContent.match(/\*\*Správná odpověď:\*\* ([a-d])\)/)?.[1]

      if (!questionText || !optionMatches || !correctAnswerLetter) continue

      questions.push({
        questionNumber: parseInt(questionNumStr),
        questionText,
        options: optionMatches.map(option => option.substring(3).trim()),
        correctAnswer: correctAnswerLetter.charCodeAt(0) - 'a'.charCodeAt(0),
        explanation: questionContent.match(/\*\*Vysvětlení:\*\* ([^\n]+)/)?.[1]?.trim(),
      })
    }

    if (questions.length > 0) {
      parsedChapters.push({
        chapterNumber: parseInt(chapterNumStr),
        questions,
      })
    }
  }

  return parsedChapters
}

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

  const questionsFilePath = path.join(__dirname, '../public/prednasky/Otazky_Kapitoly_1-40.md')
  const chaptersWithQuestions = parseQuestionsFromMarkdown(questionsFilePath)
  let seededQuestions = 0

  for (const chapterData of chaptersWithQuestions) {
    const chapterId = chapterData.chapterNumber.toString().padStart(2, '0')
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
    })

    if (!chapter) continue

    await prisma.question.deleteMany({
      where: { chapterId: chapter.id },
    })

    await prisma.question.createMany({
      data: chapterData.questions.map(question => ({
        chapterId: chapter.id,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpReward: 10,
      })),
    })

    seededQuestions += chapterData.questions.length
  }

  console.log(`Seeded ${seededQuestions} questions`)

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
