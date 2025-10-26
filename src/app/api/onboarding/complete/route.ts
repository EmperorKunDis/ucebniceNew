import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BADGES } from '@/lib/gamification'
import { XP, BADGE_IDS } from '@/lib/constants'
import { validateAPIRequest, completeOnboardingSchema } from '@/lib/validation-schemas'

const ONBOARDING_XP = XP.ONBOARDING_COMPLETE

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     summary: Complete onboarding process
 *     description: Awards onboarding XP, creates achievement badge, and stores user's goal and experience level
 *     tags:
 *       - Onboarding
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal:
 *                 type: string
 *                 enum: [career, skills, ai, fun]
 *               experience:
 *                 type: string
 *                 enum: [beginner, some, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body with Zod
    const validation = await validateAPIRequest(request, completeOnboardingSchema)
    if (!validation.success) {
      return validation.response
    }

    const { goal, experience } = validation.data

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already completed onboarding
    const hasOnboardingBadge = user.achievements.some(
      ua => ua.achievement.badgeId === 'onboarding-complete'
    )

    if (hasOnboardingBadge) {
      return NextResponse.json({
        message: 'Onboarding already completed',
        alreadyCompleted: true,
      })
    }

    // Create onboarding achievement if it doesn't exist
    let onboardingAchievement = await prisma.achievement.findUnique({
      where: { badgeId: 'onboarding-complete' },
    })

    if (!onboardingAchievement) {
      onboardingAchievement = await prisma.achievement.create({
        data: {
          badgeId: 'onboarding-complete',
          name: 'První kroky',
          description: 'Dokončil/a jsi onboarding',
          icon: '🎆',
          xpReward: ONBOARDING_XP,
          rarity: 'common',
        },
      })
    }

    // Complete onboarding in transaction
    const result = await prisma.$transaction(async tx => {
      // Award achievement
      await tx.userAchievement.create({
        data: {
          userId: session.user.id,
          achievementId: onboardingAchievement!.id,
        },
      })

      // Update user with XP, goal, and experience
      // Note: We don't store goal/experience in current schema
      // You may want to add these fields to User model in the future
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: user.xp + ONBOARDING_XP,
          level: Math.floor(Math.sqrt((user.xp + ONBOARDING_XP) / 100)) + 1,
          updatedAt: new Date(),
        },
      })

      return { updatedUser }
    })

    return NextResponse.json({
      success: true,
      xpEarned: ONBOARDING_XP,
      totalXP: result.updatedUser.xp,
      level: result.updatedUser.level,
      badge: {
        id: 'onboarding-complete',
        name: 'První kroky',
        description: 'Dokončil/a jsi onboarding',
        icon: '🎆',
      },
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
