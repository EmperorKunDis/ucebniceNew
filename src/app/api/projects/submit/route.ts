import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import {
  validateAPIRequest,
  validateQueryParams,
  submitProjectSchema,
  chapterProgressQuerySchema,
} from '@/lib/validation-schemas'

const PROJECT_XP_REWARD = 50 // XP for submitting a project

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

    // Create new submission
    await prisma.projectSubmission.create({
      data: {
        userId: user.id,
        chapterId,
        projectUrl,
        description,
        xpEarned: PROJECT_XP_REWARD,
      },
    })

    // Award XP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: PROJECT_XP_REWARD },
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
        submittedProject: true,
      },
      update: {
        submittedProject: true,
      },
    })

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(user.id)

    return NextResponse.json({
      message: 'Projekt byl úspěšně odeslán!',
      xpEarned: PROJECT_XP_REWARD,
      submittedProject: true,
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
