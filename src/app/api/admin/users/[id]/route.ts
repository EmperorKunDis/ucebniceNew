import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import {
  canonicalChapterIdsThrough,
  canonicalExerciseSourceKeysForCourse,
} from '@/lib/canonical-content-keys'

/**
 * GET /api/admin/users/[id]
 * Get a single user with full details
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        chapterProgress: {
          where: { chapter: { chapterId: { in: canonicalChapterIdsThrough() } } },
          include: {
            chapter: true,
          },
          orderBy: {
            lastUpdated: 'desc',
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: 'desc',
          },
        },
        exerciseProgress: {
          where: { exercise: { sourceKey: { in: canonicalExerciseSourceKeysForCourse() } } },
          include: {
            exercise: {
              select: {
                id: true,
                sourceKey: true,
                question: true,
                microLessonId: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        exerciseAttempts: {
          where: { exercise: { sourceKey: { in: canonicalExerciseSourceKeysForCourse() } } },
          include: {
            exercise: {
              select: {
                id: true,
                sourceKey: true,
                question: true,
                microLessonId: true,
              },
            },
          },
          orderBy: { attemptedAt: 'desc' },
        },
        projectSubmissions: {
          where: { chapter: { chapterId: { in: canonicalChapterIdsThrough() } } },
        },
        moduleTestAttempts: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        isAdmin: user.role === 'ADMIN' || user.isAdmin,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user details
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const body = await request.json()
    const { xp, level, currentStreak, longestStreak, isAdmin, role, name, username } = body

    const validRoles = ['USER', 'JUDGE', 'TEAM_LEADER', 'ADMIN'] as const
    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (isAdmin !== undefined && typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'isAdmin must be a boolean' }, { status: 400 })
    }

    const effectiveRole =
      role ?? (isAdmin === true ? 'ADMIN' : isAdmin === false ? 'USER' : undefined)

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(xp !== undefined && { xp }),
        ...(level !== undefined && { level }),
        ...(currentStreak !== undefined && { currentStreak }),
        ...(longestStreak !== undefined && { longestStreak }),
        ...(effectiveRole !== undefined && {
          // Release A compatibility: role is primary, while the legacy flag is
          // kept aligned for older sessions and rollback tooling.
          role: effectiveRole,
          isAdmin: effectiveRole === 'ADMIN',
        }),
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
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
