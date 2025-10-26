import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { moduleNumber, score, totalQuestions, timeElapsed, answers } = await request.json()

    if (!moduleNumber || score === undefined || !totalQuestions || !timeElapsed) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate attempt number
    const previousAttempts = await prisma.moduleTestAttempt.count({
      where: {
        userId: user.id,
        moduleNumber,
      },
    })

    // Calculate XP and stars
    const percentage = (score / totalQuestions) * 100
    const baseXP = score * 50
    const fiveMinutes = 5 * 60
    const timeBonus =
      timeElapsed < fiveMinutes ? Math.floor(((fiveMinutes - timeElapsed) / fiveMinutes) * 200) : 0
    const totalXP = baseXP + timeBonus

    let stars = 0
    if (percentage >= 50) stars = 1
    if (percentage >= 70) stars = 2
    if (percentage >= 90) stars = 3

    // Create test attempt
    const testAttempt = await prisma.moduleTestAttempt.create({
      data: {
        userId: user.id,
        moduleNumber,
        score,
        totalQuestions,
        timeElapsed,
        attemptNumber: previousAttempts + 1,
        completed: true,
        xpEarned: totalXP,
        moduleStars: stars,
        completedAt: new Date(),
      },
    })

    // Award XP to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: totalXP },
      },
    })

    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(user.id)

    return NextResponse.json({
      success: true,
      testAttempt,
      xpEarned: totalXP,
      stars,
      timeBonus,
      newAchievements,
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
