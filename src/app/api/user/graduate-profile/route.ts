import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, updateGraduateProfileSchema } from '@/lib/validation-schemas'

/**
 * GET /api/user/graduate-profile
 * Get current user's graduate profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.graduateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            xp: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching graduate profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/user/graduate-profile
 * Update current user's graduate profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a graduate profile
    const existingProfile = await prisma.graduateProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Nemáš profil absolventa. Nejprve musíš dokončit kurz.' },
        { status: 400 }
      )
    }

    const validation = await validateAPIRequest(request, updateGraduateProfileSchema)
    if (!validation.success) return validation.response

    const data = validation.data

    const profile = await prisma.graduateProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: data.bio,
        skills: data.skills,
        portfolio: data.portfolio,
        linkedIn: data.linkedIn,
        github: data.github,
        website: data.website,
        lookingForWork: data.lookingForWork,
        preferredRoles: data.preferredRoles,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            xp: true,
          },
        },
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating graduate profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
