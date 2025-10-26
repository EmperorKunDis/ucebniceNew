import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'

const PROJECT_XP_REWARD = 50 // XP for submitting a project

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chapterId, projectUrl, description } = await request.json()

    if (!chapterId || !projectUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(projectUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

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

    // Update chapter completion to 3 stars
    const completion = await prisma.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    })

    if (completion) {
      await prisma.chapterCompletion.update({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId,
          },
        },
        data: {
          stars: 3,
        },
      })
    } else {
      // Create completion record with 3 stars if doesn't exist
      await prisma.chapterCompletion.create({
        data: {
          userId: user.id,
          chapterId,
          stars: 3,
        },
      })
    }

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(user.id)

    return NextResponse.json({
      message: 'Projekt byl úspěšně odeslán!',
      xpEarned: PROJECT_XP_REWARD,
      stars: 3,
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
    const chapterId = searchParams.get('chapterId')

    if (!chapterId) {
      return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 })
    }

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
