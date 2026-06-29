import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { reviewProjectWithGemini } from '@/lib/gemini'
import {
  validateAPIRequest,
  validateQueryParams,
  submitProjectSchema,
  chapterProgressQuerySchema,
} from '@/lib/validation-schemas'

const PROJECT_XP_REWARD = 50 // XP for submitting a project
const GEMS_FOR_APPROVED_PROJECT = 100 // Gems for AI-approved project

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body with Zod (includes URL format validation)
    const validation = await validateAPIRequest(request, submitProjectSchema)
    if (!validation.success) {
      return validation.response
    }

    const { chapterId, projectUrl, description } = validation.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already submitted
    const existingSubmission = await prisma.projectSubmission.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    })

    if (existingSubmission) {
      // Update existing submission
      await prisma.projectSubmission.update({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId,
          },
        },
        data: {
          projectUrl,
          description,
        },
      })

      return NextResponse.json({
        message: 'Projekt byl úspěšně aktualizován!',
        xpEarned: 0,
        updated: true,
      })
    }

    // Get chapter details for AI review
    const chapter = await prisma.chapter.findFirst({
      where: { chapterId },
    })

    // Review project with Gemini AI
    const aiReview = await reviewProjectWithGemini({
      projectCode: description || projectUrl, // Use description as code or URL
      chapterTitle: chapter?.title || `Kapitola ${chapterId}`,
      chapterDescription: chapter?.description || '',
      projectRequirements: 'Implementovat praktické řešení dle pracovního sešitu',
    })

    // Calculate gems earned (only if AI approved)
    const gemsEarned = aiReview.approved ? GEMS_FOR_APPROVED_PROJECT : 0
    const xpEarned = aiReview.approved ? PROJECT_XP_REWARD : 0

    // Create new submission with AI review
    await prisma.projectSubmission.create({
      data: {
        userId: user.id,
        chapterId,
        projectUrl,
        description,
        xpEarned,
        gemsEarned,
        aiReviewScore: aiReview.score,
        aiReviewFeedback: aiReview.feedback,
        aiReviewedAt: new Date(),
        aiApproved: aiReview.approved,
      },
    })

    // Award XP and gems
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpEarned },
        gems: { increment: gemsEarned },
      },
    })

    // Update chapter completion - set submittedProject flag
    await prisma.chapterCompletion.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
      create: {
        userId: user.id,
        chapterId,
        completedChapter: false,
        answeredQuestions: false,
        submittedProject: aiReview.approved,
      },
      update: {
        submittedProject: aiReview.approved,
      },
    })

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(user.id)

    return NextResponse.json({
      message: aiReview.approved
        ? 'Projekt byl schválen AI a ohodnocen!'
        : 'Projekt byl odevzdán, ale čeká na kontrolu nebo nedosáhl požadovaného skóre.',
      xpEarned,
      gemsEarned,
      submittedProject: aiReview.approved,
      aiReview: {
        score: aiReview.score,
        feedback: aiReview.feedback,
        strengths: aiReview.strengths,
        improvements: aiReview.improvements,
        approved: aiReview.approved,
      },
      newAchievements,
    })
  } catch (error) {
    console.error('Error submitting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve user's project submission
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(searchParams, chapterProgressQuerySchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const { chapterId } = validation.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get submission
    const submission = await prisma.projectSubmission.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error getting project submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
