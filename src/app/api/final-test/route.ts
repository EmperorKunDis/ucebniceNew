import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { prisma } from '@/lib/prisma'
import { reviewMilestoneProject } from '@/lib/gemini'
import { awardCanonicalReward, runLearningTransaction } from '@/lib/learning-service'
import { QuestCategory } from '@prisma/client'
import { z } from 'zod'
import { canonicalChapterIdsThrough } from '@/lib/canonical-content-keys'

const GEMS_FOR_PASSING = 500
const XP_FOR_PASSING = 1000

// Logické otázky - testují pochopení, ne fakta
const FINAL_QUESTIONS = [
  {
    id: 'final-1',
    question:
      'Máš dataset s 10 000 obrázky koček a 100 obrázky psů. Jaký problém to představuje a jak bys ho řešil?',
    type: 'OPEN',
    expectedConcepts: ['imbalanced data', 'oversampling', 'undersampling', 'data augmentation'],
  },
  {
    id: 'final-2',
    question:
      'Tvůj model dosahuje 99% přesnosti na trénovacích datech, ale jen 60% na testovacích. Co se děje a jak to opravíš?',
    type: 'OPEN',
    expectedConcepts: ['overfitting', 'regularization', 'dropout', 'more data'],
  },
  {
    id: 'final-3',
    question:
      'Proč neuronová síť s 1000 skrytými vrstvami není automaticky lepší než síť se 3 vrstvami?',
    type: 'OPEN',
    expectedConcepts: [
      'vanishing gradient',
      'computational cost',
      'overfitting',
      'diminishing returns',
    ],
  },
  {
    id: 'final-4',
    question:
      'Zákazník chce AI která "vždy dává správné odpovědi". Proč je to nerealistické a jak bys mu to vysvětlil?',
    type: 'OPEN',
    expectedConcepts: ['uncertainty', 'probabilistic nature', 'bias in data', 'edge cases'],
  },
  {
    id: 'final-5',
    question:
      'Kdy bys použil supervised learning vs unsupervised learning? Uveď praktický příklad pro každý.',
    type: 'OPEN',
    expectedConcepts: [
      'labeled vs unlabeled',
      'classification/regression',
      'clustering',
      'practical examples',
    ],
  },
  {
    id: 'final-6',
    question: 'Jak bys detekoval a zmírnil bias v AI systému pro nábor zaměstnanců?',
    type: 'OPEN',
    expectedConcepts: ['fairness', 'bias detection', 'diverse training data', 'human oversight'],
  },
  {
    id: 'final-7',
    question:
      'Co je "black box problem" u neuronových sítí a proč je to důležité v medicíně nebo finančnictví?',
    type: 'OPEN',
    expectedConcepts: ['interpretability', 'explainability', 'trust', 'regulatory compliance'],
  },
  {
    id: 'final-8',
    question: 'Máš omezený rozpočet na GPU. Jak bys optimalizoval trénování velkého modelu?',
    type: 'OPEN',
    expectedConcepts: ['batch size', 'transfer learning', 'model pruning', 'mixed precision'],
  },
  {
    id: 'final-9',
    question:
      'Proč je důležité mít oddělená trénovací, validační a testovací data? Co se stane když to neuděláš?',
    type: 'OPEN',
    expectedConcepts: ['data leakage', 'overfitting', 'honest evaluation', 'generalization'],
  },
  {
    id: 'final-10',
    question:
      'Jak AI změní tvůj obor práce v příštích 10 letech? Jaké dovednosti budou nejcennější?',
    type: 'OPEN',
    expectedConcepts: ['automation', 'augmentation', 'soft skills', 'continuous learning'],
  },
]

// Finální projekty na výběr
const FINAL_PROJECTS = [
  {
    id: 1,
    title: 'AI Chatbot Asistent',
    description: `Vytvoř interaktivního chatbota který:
- Odpovídá na otázky o tématech z učebnice
- Používá kontext předchozích zpráv
- Má příjemnou osobnost
- Zvládá "nevím" odpovědi elegantně

Bonus: Přidej možnost generovat kvízy na základě tématu.`,
  },
  {
    id: 2,
    title: 'Klasifikátor Obrázků',
    description: `Vytvoř systém pro klasifikaci obrázků který:
- Rozpoznává alespoň 5 kategorií
- Má webové rozhraní pro nahrání obrázku
- Ukazuje confidence score
- Umí vysvětlit proč si myslí že je to daná kategorie

Bonus: Přidej možnost dotrénování na nových kategoriích.`,
  },
  {
    id: 3,
    title: 'Prediktivní Analytický Dashboard',
    description: `Vytvoř dashboard který:
- Načítá a vizualizuje data
- Trénuje prediktivní model na datech
- Zobrazuje predikce s confidence intervaly
- Umožňuje uživateli měnit parametry modelu

Bonus: Přidej automatickou detekci anomálií.`,
  },
]

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()), // questionId -> textová odpověď
  selectedProjectId: z.number().min(1).max(3),
  projectUrl: z.string().url().optional(),
  projectCode: z.string().optional(),
})

/**
 * GET /api/final-test
 * Get final test questions and project options
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user has completed all 40 chapters
    const completedChapters = await prisma.chapterProgress.count({
      where: {
        userId,
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
    })

    if (completedChapters < 40) {
      return NextResponse.json(
        {
          error: 'Musíš dokončit všech 40 kapitol před finálním testem',
          required: 40,
          completed: completedChapters,
        },
        { status: 400 }
      )
    }

    // Check if already passed
    const existingTest = await prisma.finalTest.findUnique({
      where: { userId },
    })

    if (existingTest?.passed) {
      return NextResponse.json({
        alreadyPassed: true,
        score: existingTest.questionsScore,
        projectScore: existingTest.projectScore,
        completedAt: existingTest.completedAt,
      })
    }

    return NextResponse.json({
      questions: FINAL_QUESTIONS.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
      })),
      projects: FINAL_PROJECTS,
      instructions: `
Finální test má dvě části:

1. **10 logických otázek** - Testují tvé pochopení konceptů AI, ne zapamatované fakty.
   Odpovídej vlastními slovy, ukaž že rozumíš.

2. **Projekt** - Vyber jeden ze tří projektů a implementuj ho.
   Projekt by měl demonstrovat praktické znalosti ze všech 40 kapitol.

Pro úspěšné složení potřebuješ:
- Alespoň 70% za otázky
- Alespoň 70% za projekt
- Celkově alespoň 70%

Odměna za úspěch: 500 💎 a certifikát o dokončení!
      `.trim(),
    })
  } catch (error) {
    console.error('Error fetching final test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/final-test
 * Submit final test
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = submitSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { answers, selectedProjectId, projectUrl, projectCode } = validation.data
    const userId = session.user.id

    const submittedQuestionIds = Object.keys(answers)
    const expectedQuestionIds = new Set(FINAL_QUESTIONS.map(question => question.id))
    if (
      submittedQuestionIds.length !== FINAL_QUESTIONS.length ||
      submittedQuestionIds.some(questionId => !expectedQuestionIds.has(questionId))
    ) {
      return NextResponse.json(
        { error: 'Finální test musí obsahovat právě všech 10 otázek' },
        { status: 400 }
      )
    }

    if (!projectUrl && !projectCode?.trim()) {
      return NextResponse.json(
        { error: 'Pro finální test je povinné odevzdat projekt' },
        { status: 400 }
      )
    }

    const completedChapters = await prisma.chapterProgress.count({
      where: {
        userId,
        contentCompleted: true,
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
    })
    if (completedChapters < 40) {
      return NextResponse.json(
        { error: 'Musíš dokončit všech 40 kapitol před finálním testem' },
        { status: 403 }
      )
    }

    // Check if already passed
    const existingTest = await prisma.finalTest.findUnique({
      where: { userId },
    })

    if (existingTest?.passed) {
      return NextResponse.json({
        alreadyPassed: true,
        replayed: true,
        passed: true,
        questionsScore: existingTest.questionsScore,
        projectScore: existingTest.projectScore,
        projectFeedback: existingTest.projectFeedback,
        gemsEarned: 0,
        xpEarned: 0,
        certificateReady: true,
      })
    }

    // Grade questions using AI
    let questionsScore = 0

    // For now, simplified grading - in production would use Gemini
    const minAnswerLength = 50 // Require at least 50 chars per answer

    let qualityAnswers = 0
    for (const [questionId, answer] of Object.entries(answers)) {
      const question = FINAL_QUESTIONS.find(q => q.id === questionId)
      if (!question || !answer) continue

      const answerStr = String(answer)

      // Basic quality check
      if (answerStr.length >= minAnswerLength) {
        // Check if answer mentions expected concepts (simplified)
        const answerLower = answerStr.toLowerCase()
        const mentionedConcepts = question.expectedConcepts.filter(c => {
          const firstWord = c.toLowerCase().split(' ')[0] || c.toLowerCase()
          return answerLower.includes(firstWord)
        })

        if (mentionedConcepts.length >= 1) {
          qualityAnswers++
        } else if (answerStr.length >= 100) {
          // Give partial credit for longer answers
          qualityAnswers += 0.5
        }
      }
    }

    questionsScore = Math.round((qualityAnswers / FINAL_QUESTIONS.length) * 100)

    // Review project
    let projectScore = 0
    let projectFeedback = ''

    if (projectCode || projectUrl) {
      const selectedProject = FINAL_PROJECTS.find(p => p.id === selectedProjectId)
      const projectContent: string = projectCode || projectUrl || ''

      const aiReview = await reviewMilestoneProject(
        projectContent,
        40,
        `Finální projekt: ${selectedProject?.title || 'Unknown'}\n\n${selectedProject?.description || ''}`
      )

      projectScore = aiReview.score
      projectFeedback = aiReview.feedback
    }

    // Calculate final score
    const finalScore = Math.round((questionsScore + projectScore) / 2)
    const passed = finalScore >= 70 && questionsScore >= 70 && projectScore >= 70

    const reward = await runLearningTransaction(async tx => {
      const stillEligible = await tx.chapterProgress.count({
        where: {
          userId,
          contentCompleted: true,
          chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
        },
      })
      if (stillEligible < 40) throw new Error('Final test eligibility changed')

      const concurrentlyPassed = await tx.finalTest.findUnique({ where: { userId } })
      if (concurrentlyPassed?.passed) {
        return {
          replayed: true as const,
          existingTest: concurrentlyPassed,
          xpEarned: 0,
          gemsEarned: 0,
        }
      }

      const test = await tx.finalTest.upsert({
        where: { userId },
        create: {
          userId,
          questionsScore,
          selectedProjectId,
          projectSubmitted: true,
          projectUrl: projectUrl || null,
          projectScore,
          projectFeedback: projectFeedback || null,
          passed,
          gemsEarned: 0,
          xpEarned: 0,
          completedAt: passed ? new Date() : null,
        },
        update: {
          questionsScore,
          selectedProjectId,
          projectSubmitted: true,
          projectUrl: projectUrl || null,
          projectScore,
          projectFeedback: projectFeedback || null,
          passed: passed ? true : undefined,
          completedAt: passed ? new Date() : undefined,
        },
      })

      if (!passed) {
        return { replayed: false as const, xpEarned: 0, gemsEarned: 0 }
      }

      const awarded = await awardCanonicalReward(tx, {
        userId,
        sourceType: 'FINAL_TEST_PASS',
        sourceId: 'foundation',
        xpAmount: XP_FOR_PASSING,
        gemAmount: GEMS_FOR_PASSING,
        questCategories: [QuestCategory.XP_EARNED],
      })
      if (awarded.awarded) {
        await tx.finalTest.update({
          where: { id: test.id },
          data: {
            xpEarned: awarded.xpEarned,
            gemsEarned: awarded.gemsEarned,
          },
        })
      }
      return { replayed: false as const, ...awarded }
    })

    if (reward.replayed) {
      return NextResponse.json({
        alreadyPassed: true,
        replayed: true,
        passed: true,
        questionsScore: reward.existingTest.questionsScore,
        projectScore: reward.existingTest.projectScore,
        projectFeedback: reward.existingTest.projectFeedback,
        gemsEarned: 0,
        xpEarned: 0,
        certificateReady: true,
      })
    }

    const newAchievements =
      passed && reward.xpEarned > 0 ? await checkAndAwardAchievements(userId) : []

    return NextResponse.json({
      passed,
      score: finalScore,
      questionsScore,
      projectScore: projectScore || null,
      projectFeedback: projectFeedback || null,
      gemsEarned: reward.gemsEarned,
      xpEarned: reward.xpEarned,
      newAchievements,
      message: passed
        ? '🎉 Gratulujeme! Úspěšně jsi dokončil celou učebnici! Tvůj certifikát je připraven ke stažení.'
        : 'Test nesložen. Potřebuješ alespoň 70% v každé části.',
      certificateReady: passed,
    })
  } catch (error) {
    console.error('Error submitting final test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
