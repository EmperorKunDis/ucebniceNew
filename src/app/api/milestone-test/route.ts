import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reviewMilestoneProject } from '@/lib/gemini'
import { z } from 'zod'

const QUESTIONS_PER_MILESTONE = 20
const MILESTONES = [10, 20, 30, 40] // 40 is special final test
const GEMS_FOR_PASSING = 200

const submitTestSchema = z.object({
  milestone: z.number().refine(m => MILESTONES.includes(m)),
  answers: z.record(z.string(), z.any()), // questionId -> answer
  projectCode: z.string().optional(),
})

/**
 * GET /api/milestone-test?milestone=10
 * Get milestone test questions (20 random from previous 10 chapters)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const milestoneParam = parseInt(searchParams.get('milestone') || '0')

    if (!MILESTONES.includes(milestoneParam)) {
      return NextResponse.json(
        { error: 'Invalid milestone. Valid values: 10, 20, 30, 40' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const milestone = milestoneParam

    // Check if user has completed required chapters
    const completedChapters = await prisma.chapterCompletion.count({
      where: {
        userId,
        completedChapter: true,
      },
    })

    if (completedChapters < milestone) {
      return NextResponse.json(
        {
          error: `Musíš dokončit ${milestone} kapitol před tímto testem`,
          required: milestone,
          completed: completedChapters,
        },
        { status: 400 }
      )
    }

    // Check if already passed
    const existingTest = await prisma.milestoneTest.findUnique({
      where: {
        userId_milestone: {
          userId,
          milestone,
        },
      },
    })

    if (existingTest?.passed) {
      return NextResponse.json({
        alreadyPassed: true,
        score: existingTest.score,
        completedAt: existingTest.completedAt,
      })
    }

    // Get chapters for this milestone range
    const startChapter = milestone === 10 ? 1 : milestone - 9
    const endChapter = milestone
    const chapterIds = Array.from({ length: 10 }, (_, i) =>
      String(startChapter + i).padStart(2, '0')
    )

    // Get chapters by chapterId
    const chapters = await prisma.chapter.findMany({
      where: { chapterId: { in: chapterIds } },
      select: { id: true, title: true, chapterId: true, description: true },
    })

    // Get all questions from these chapters
    const allQuestions = await prisma.question.findMany({
      where: {
        chapterId: { in: chapters.map(c => c.id) },
      },
    })

    // Randomly select 20 questions (2 per chapter ideally)
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_MILESTONE)

    // Format questions
    const questions = selectedQuestions.map((q, index) => {
      const chapter = chapters.find(c => c.id === q.chapterId)
      return {
        id: q.id,
        order: index + 1,
        type: 'MULTIPLE_CHOICE',
        question: q.questionText,
        options: q.options as string[],
        chapterTitle: chapter?.title || '',
        chapterId: chapter?.chapterId || '',
      }
    })

    // Project description
    const projectDescription = `Vytvoř kombinovaný projekt který demonstruje znalosti z kapitol ${startChapter}-${endChapter}:

${chapters.map(c => `- ${c.chapterId}: ${c.title}`).join('\n')}

Projekt by měl obsahovat praktické použití konceptů ze všech těchto kapitol.`

    return NextResponse.json({
      milestone,
      questions,
      totalQuestions: questions.length,
      projectDescription,
      chapters: chapters.map(c => ({ id: c.chapterId, title: c.title })),
    })
  } catch (error) {
    console.error('Error fetching milestone test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/milestone-test
 * Submit milestone test answers and project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = submitTestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { milestone, answers, projectCode } = validation.data
    const userId = session.user.id

    // Check if already passed
    const existingTest = await prisma.milestoneTest.findUnique({
      where: {
        userId_milestone: {
          userId,
          milestone,
        },
      },
    })

    if (existingTest?.passed) {
      return NextResponse.json(
        {
          error: 'Test už byl úspěšně složen',
          alreadyPassed: true,
        },
        { status: 400 }
      )
    }

    // Grade questions
    const questionIds = Object.keys(answers)
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    })

    let correctCount = 0
    for (const question of questions) {
      const userAnswer = answers[question.id]
      // Simple grading - check if answer matches correctAnswer index
      if (userAnswer === question.correctAnswer) {
        correctCount++
      }
    }

    const questionsScore =
      questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

    // Review project with AI
    let projectScore = 0
    let projectFeedback = ''

    if (projectCode) {
      const startChapter = milestone === 10 ? 1 : milestone - 9
      const chaptersSummary = `Kapitoly ${startChapter}-${milestone}`

      const aiReview = await reviewMilestoneProject(projectCode, milestone, chaptersSummary)
      projectScore = aiReview.score
      projectFeedback = aiReview.feedback
    }

    // Calculate final score (50% questions, 50% project)
    const finalScore = projectCode
      ? Math.round((questionsScore + projectScore) / 2)
      : questionsScore

    const passed = finalScore >= 70
    const gemsEarned = passed ? GEMS_FOR_PASSING : 0
    const xpEarned = passed ? 500 : 100

    // Save or update test result
    await prisma.milestoneTest.upsert({
      where: {
        userId_milestone: {
          userId,
          milestone,
        },
      },
      create: {
        userId,
        milestone,
        score: finalScore,
        questionsCorrect: correctCount,
        questionsTotal: questions.length,
        projectSubmitted: !!projectCode,
        projectScore: projectCode ? projectScore : null,
        projectFeedback: projectCode ? projectFeedback : null,
        passed,
        gemsEarned,
        xpEarned,
        completedAt: new Date(),
      },
      update: {
        score: finalScore,
        questionsCorrect: correctCount,
        projectSubmitted: !!projectCode,
        projectScore: projectCode ? projectScore : null,
        projectFeedback: projectCode ? projectFeedback : null,
        passed,
        gemsEarned: passed ? gemsEarned : 0,
        xpEarned,
        completedAt: new Date(),
      },
    })

    // Award gems and XP if passed
    if (passed) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          gems: { increment: gemsEarned },
          xp: { increment: xpEarned },
        },
      })
    }

    return NextResponse.json({
      passed,
      score: finalScore,
      questionsScore,
      questionsCorrect: correctCount,
      questionsTotal: questions.length,
      projectScore: projectCode ? projectScore : null,
      projectFeedback: projectCode ? projectFeedback : null,
      gemsEarned,
      xpEarned,
      message: passed
        ? `Gratulujeme! Úspěšně jsi složil test po ${milestone}. kapitole!`
        : `Test nesložen. Potřebuješ alespoň 70% pro úspěch.`,
    })
  } catch (error) {
    console.error('Error submitting milestone test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
