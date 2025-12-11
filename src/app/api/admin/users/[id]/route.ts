import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/users/[id]
 * Get a single user with full details
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        completedChapters: {
          include: {
            chapter: true,
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 50, // Limit to prevent loading excessive data
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: 'desc',
          },
          take: 50, // Limit to prevent loading excessive data
        },
        chapterCompletions: {
          take: 50, // Limit to prevent loading excessive data
          orderBy: {
            updatedAt: 'desc',
          },
        },
        questionAnswers: {
          take: 100, // Limit to prevent loading excessive data
          orderBy: {
            answeredAt: 'desc',
          },
        },
        projectSubmissions: {
          take: 50, // Limit to prevent loading excessive data
          orderBy: {
            submittedAt: 'desc',
          },
        },
        moduleTestAttempts: {
          take: 20, // Limit to prevent loading excessive data
          orderBy: {
            completedAt: 'desc',
          },
        },
        _count: {
          select: {
            completedChapters: true,
            achievements: true,
            chapterCompletions: true,
            questionAnswers: true,
            projectSubmissions: true,
            moduleTestAttempts: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user details
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { xp, level, currentStreak, longestStreak, isAdmin, name, username } = body

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(xp !== undefined && { xp }),
        ...(level !== undefined && { level }),
        ...(currentStreak !== undefined && { currentStreak }),
        ...(longestStreak !== undefined && { longestStreak }),
        ...(isAdmin !== undefined && { isAdmin }),
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
