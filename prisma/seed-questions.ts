import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

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

/**
 * Parse the markdown file and extract questions
 */
function parseQuestionsFromMarkdown(filePath: string): ChapterQuestions[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const chapters: ChapterQuestions[] = []

  // Split by chapter headers (## Kapitola X:)
  const chapterSections = content.split(/## Kapitola (\d+):/)

  for (let i = 1; i < chapterSections.length; i += 2) {
    const chapterNumStr = chapterSections[i]
    const chapterContent = chapterSections[i + 1]
    if (!chapterNumStr || !chapterContent) continue

    const chapterNumber = parseInt(chapterNumStr)

    // Split by question headers (### Otázka X)
    const questionSections = chapterContent.split(/### Otázka (\d+)/)
    const questions: ParsedQuestion[] = []

    for (let j = 1; j < questionSections.length; j += 2) {
      const questionNumStr = questionSections[j]
      const questionContent = questionSections[j + 1]
      if (!questionNumStr || !questionContent) continue

      const questionNumber = parseInt(questionNumStr)

      // Extract question text (between ** and **)
      const questionTextMatch = questionContent.match(/\*\*([^*]+)\*\*/)
      if (!questionTextMatch || !questionTextMatch[1]) continue

      const questionText = questionTextMatch[1].trim()

      // Extract options (lines starting with a), b), c), d))
      const optionMatches = questionContent.match(/^[a-d]\).+$/gm)
      if (!optionMatches || optionMatches.length === 0) continue

      const options = optionMatches.map(opt => opt.substring(3).trim())

      // Extract correct answer
      const correctAnswerMatch = questionContent.match(/\*\*Správná odpověď:\*\* ([a-d])\)/)
      if (!correctAnswerMatch) continue

      const correctAnswerLetter = correctAnswerMatch[1]
      if (!correctAnswerLetter) continue
      const correctAnswer = correctAnswerLetter.charCodeAt(0) - 'a'.charCodeAt(0)

      // Extract explanation (optional)
      const explanationMatch = questionContent.match(/\*\*Vysvětlení:\*\* ([^\n]+)/)
      const explanation = explanationMatch?.[1]?.trim()

      questions.push({
        questionNumber,
        questionText,
        options,
        correctAnswer,
        explanation,
      })
    }

    if (questions.length > 0) {
      chapters.push({
        chapterNumber,
        questions,
      })
    }
  }

  return chapters
}

async function main() {
  console.log('🌱 Starting seed...')

  // Path to the markdown file
  const mdFilePath = path.join(__dirname, '../public/prednasky/Otazky_Kapitoly_1-40.md')

  console.log('📖 Reading questions from:', mdFilePath)

  // Parse questions from markdown
  const chaptersData = parseQuestionsFromMarkdown(mdFilePath)
  console.log(`✅ Parsed ${chaptersData.length} chapters`)

  // Seed questions for each chapter
  for (const chapterData of chaptersData) {
    const chapterId = chapterData.chapterNumber.toString().padStart(2, '0')

    console.log(`\n📝 Seeding Chapter ${chapterId}...`)

    // Find or create chapter
    let chapter = await prisma.chapter.findUnique({
      where: { chapterId },
    })

    if (!chapter) {
      console.log(`  ⚠️  Chapter ${chapterId} not found in database, skipping...`)
      continue
    }

    // Delete existing questions for this chapter
    await prisma.question.deleteMany({
      where: { chapterId: chapter.id },
    })

    // Create new questions
    for (const question of chapterData.questions) {
      await prisma.question.create({
        data: {
          chapterId: chapter.id,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          xpReward: 10,
        },
      })
    }

    console.log(`  ✅ Created ${chapterData.questions.length} questions`)
  }

  console.log('\n✨ Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
