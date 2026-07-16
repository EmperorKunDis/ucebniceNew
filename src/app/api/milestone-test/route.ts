import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { prisma } from '@/lib/prisma'
import { reviewMilestoneProject } from '@/lib/gemini'
import { awardCanonicalReward, runLearningTransaction } from '@/lib/learning-service'
import { QuestCategory } from '@prisma/client'
import { z } from 'zod'
import {
  canonicalChapterIdsInRange,
  canonicalChapterIdsThrough,
} from '@/lib/canonical-content-keys'

const QUESTIONS_PER_MILESTONE = 20
const MILESTONES = [10, 20, 30, 40] // 40 is special final test
const GEMS_FOR_PASSING = 200

type MilestoneAssessment = {
  startChapter: number
  chapters: Array<{
    id: string
    chapterId: string
    title: string
    description: string | null
  }>
  questions: Array<{
    id: string
    questionText: string
    options: unknown
    correctAnswer: number
    chapterId: string
    chapterTitle: string
    chapterSlug: string
  }>
}

const submitTestSchema = z.object({
  milestone: z.number().refine(m => MILESTONES.includes(m)),
  answers: z.record(z.string(), z.any()), // questionId -> answer
  projectCode: z.string().optional(),
})

async function getMilestoneAssessment(milestone: number): Promise<MilestoneAssessment> {
  const startChapter = milestone - 9
  const chapterIds = canonicalChapterIdsInRange(startChapter, milestone)
  const chapters = await prisma.chapter.findMany({
    where: { chapterId: { in: chapterIds } },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      chapterId: true,
      title: true,
      description: true,
      questions: {
        orderBy: [{ questionNumber: 'asc' }, { id: 'asc' }],
        take: 2,
        select: {
          id: true,
          questionText: true,
          options: true,
          correctAnswer: true,
        },
      },
    },
  })

  if (chapters.length !== 10 || chapters.some(chapter => chapter.questions.length !== 2)) {
    throw new Error(`Milestone ${milestone} assessment is incomplete`)
  }

  return {
    startChapter,
    chapters: chapters.map(chapter => ({
      id: chapter.id,
      chapterId: chapter.chapterId,
      title: chapter.title,
      description: chapter.description,
    })),
    questions: chapters.flatMap(chapter =>
      chapter.questions.map(question => ({
        ...question,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterSlug: chapter.chapterId,
      }))
    ),
  }
}

/**
 * GET /api/milestone-test?milestone=10
 * Get the deterministic milestone question set (two per chapter)
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
    const completedChapters = await prisma.chapterProgress.count({
      where: {
        userId,
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough(milestone) } },
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

    const assessment = await getMilestoneAssessment(milestone)

    // Only public question fields are returned. correctAnswer remains server-side.
    const questions = assessment.questions.map((question, index) => {
      return {
        id: question.id,
        order: index + 1,
        type: 'MULTIPLE_CHOICE',
        question: question.questionText,
        options: question.options as string[],
        chapterTitle: question.chapterTitle,
        chapterId: question.chapterSlug,
      }
    })

    // Project description
    const projectDescription = `Vytvoř kombinovaný projekt který demonstruje znalosti z kapitol ${assessment.startChapter}-${milestone}:

${assessment.chapters.map(c => `- ${c.chapterId}: ${c.title}`).join('\n')}

Projekt by měl obsahovat praktické použití konceptů ze všech těchto kapitol.`

    return NextResponse.json({
      milestone,
      questions,
      totalQuestions: questions.length,
      projectDescription,
      chapters: assessment.chapters.map(c => ({ id: c.chapterId, title: c.title })),
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

    const completedChapters = await prisma.chapterProgress.count({
      where: {
        userId,
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough(milestone) } },
      },
    })
    if (completedChapters < milestone) {
      return NextResponse.json(
        { error: `Musíš dokončit prvních ${milestone} kapitol`, completed: completedChapters },
        { status: 403 }
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
        replayed: true,
        passed: true,
        score: existingTest.score,
        questionsCorrect: existingTest.questionsCorrect,
        questionsTotal: existingTest.questionsTotal,
        projectScore: existingTest.projectScore,
        projectFeedback: existingTest.projectFeedback,
        gemsEarned: 0,
        xpEarned: 0,
      })
    }

    const assessment = await getMilestoneAssessment(milestone)

    // Grade only the exact deterministic server-side question set.
    const questionIds = Object.keys(answers)
    const expectedQuestionIds = new Set(assessment.questions.map(question => question.id))
    if (
      questionIds.length !== QUESTIONS_PER_MILESTONE ||
      questionIds.some(questionId => !expectedQuestionIds.has(questionId))
    ) {
      return NextResponse.json(
        { error: `Test musí obsahovat přesně serverovou sadu ${QUESTIONS_PER_MILESTONE} otázek` },
        { status: 400 }
      )
    }

    let correctCount = 0
    for (const question of assessment.questions) {
      const userAnswer = answers[question.id]
      // Simple grading - check if answer matches correctAnswer index
      if (userAnswer === question.correctAnswer) {
        correctCount++
      }
    }

    const questionsScore =
      assessment.questions.length > 0
        ? Math.round((correctCount / assessment.questions.length) * 100)
        : 0

    // Review project with AI
    let projectScore = 0
    let projectFeedback = ''

    if (projectCode) {
      const chaptersSummary = `Kapitoly ${assessment.startChapter}-${milestone}`

      const aiReview = await reviewMilestoneProject(projectCode, milestone, chaptersSummary)
      projectScore = aiReview.score
      projectFeedback = aiReview.feedback
    }

    // Calculate final score (50% questions, 50% project)
    const finalScore = projectCode
      ? Math.round((questionsScore + projectScore) / 2)
      : questionsScore

    const passed = finalScore >= 70
    const result = await runLearningTransaction(async tx => {
      const stillEligible = await tx.chapterProgress.count({
        where: {
          userId,
          contentCompleted: true,
          chapter: { chapterId: { in: canonicalChapterIdsThrough(milestone) } },
        },
      })
      if (stillEligible < milestone) throw new Error('Milestone eligibility changed')

      const concurrentlyPassed = await tx.milestoneTest.findUnique({
        where: { userId_milestone: { userId, milestone } },
      })
      if (concurrentlyPassed?.passed) {
        return {
          replayed: true as const,
          existingTest: concurrentlyPassed,
          xpEarned: 0,
          gemsEarned: 0,
        }
      }

      const test = await tx.milestoneTest.upsert({
        where: { userId_milestone: { userId, milestone } },
        create: {
          userId,
          milestone,
          score: finalScore,
          questionsCorrect: correctCount,
          questionsTotal: assessment.questions.length,
          projectSubmitted: Boolean(projectCode),
          projectScore: projectCode ? projectScore : null,
          projectFeedback: projectCode ? projectFeedback : null,
          passed,
          gemsEarned: 0,
          xpEarned: 0,
          completedAt: new Date(),
        },
        update: {
          score: finalScore,
          questionsCorrect: correctCount,
          questionsTotal: assessment.questions.length,
          projectSubmitted: Boolean(projectCode),
          projectScore: projectCode ? projectScore : null,
          projectFeedback: projectCode ? projectFeedback : null,
          passed: passed ? true : undefined,
          completedAt: new Date(),
        },
      })
      if (!passed) {
        return { replayed: false as const, xpEarned: 0, gemsEarned: 0 }
      }

      const reward = await awardCanonicalReward(tx, {
        userId,
        sourceType: 'MILESTONE_PASS',
        sourceId: String(milestone),
        xpAmount: 500,
        gemAmount: GEMS_FOR_PASSING,
        questCategories: [QuestCategory.XP_EARNED],
      })
      if (reward.awarded) {
        await tx.milestoneTest.update({
          where: { id: test.id },
          data: { xpEarned: reward.xpEarned, gemsEarned: reward.gemsEarned },
        })
      }
      return { replayed: false as const, ...reward }
    })

    if (result.replayed) {
      return NextResponse.json({
        alreadyPassed: true,
        replayed: true,
        passed: true,
        score: result.existingTest.score,
        questionsCorrect: result.existingTest.questionsCorrect,
        questionsTotal: result.existingTest.questionsTotal,
        projectScore: result.existingTest.projectScore,
        projectFeedback: result.existingTest.projectFeedback,
        gemsEarned: 0,
        xpEarned: 0,
      })
    }

    const newAchievements =
      passed && result.xpEarned > 0 ? await checkAndAwardAchievements(userId) : []

    return NextResponse.json({
      passed,
      score: finalScore,
      questionsScore,
      questionsCorrect: correctCount,
      questionsTotal: assessment.questions.length,
      projectScore: projectCode ? projectScore : null,
      projectFeedback: projectCode ? projectFeedback : null,
      gemsEarned: result.gemsEarned,
      xpEarned: result.xpEarned,
      newAchievements,
      message: passed
        ? `Gratulujeme! Úspěšně jsi složil test po ${milestone}. kapitole!`
        : `Test nesložen. Potřebuješ alespoň 70% pro úspěch.`,
    })
  } catch (error) {
    console.error('Error submitting milestone test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
