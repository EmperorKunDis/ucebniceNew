import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

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
    const chapterNumber = parseInt(chapterSections[i])
    const chapterContent = chapterSections[i + 1]

    // Split by question headers (### Otázka X)
    const questionSections = chapterContent.split(/### Otázka (\d+)/)
    const questions: ParsedQuestion[] = []

    for (let j = 1; j < questionSections.length; j += 2) {
      const questionNumber = parseInt(questionSections[j])
      const questionContent = questionSections[j + 1]

      // Extract question text (between ** and **)
      const questionTextMatch = questionContent.match(/\*\*(.+?)\*\*/s)
      if (!questionTextMatch) continue

      const questionText = questionTextMatch[1].trim()

      // Extract options (lines starting with a), b), c), d))
      const optionMatches = questionContent.match(/^[a-d]\).+$/gm)
      if (!optionMatches || optionMatches.length === 0) continue

      const options = optionMatches.map(opt => opt.substring(3).trim())

      // Extract correct answer
      const correctAnswerMatch = questionContent.match(/\*\*Správná odpověď:\*\* ([a-d])\)/)
      if (!correctAnswerMatch) continue

      const correctAnswerLetter = correctAnswerMatch[1]
      const correctAnswer = correctAnswerLetter.charCodeAt(0) - 'a'.charCodeAt(0)

      // Extract explanation (optional)
      const explanationMatch = questionContent.match(
        /\*\*Vysvětlení:\*\* (.+?)(?:\n\n|---|\n##|$)/s
      )
      const explanation = explanationMatch ? explanationMatch[1].trim() : undefined

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
