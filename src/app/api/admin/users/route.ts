import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { canonicalChapterIdsThrough } from '@/lib/canonical-content-keys'

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // ChapterProgress is the canonical chapter-level source of truth.
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            achievements: true,
            chapterProgress: {
              where: {
                contentCompleted: true,
                chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        role: user.role,
        // Compatibility field for the Release A admin UI. Role is primary;
        // the legacy flag is accepted only as a fallback until Release B.
        isAdmin: user.role === 'ADMIN' || user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          completedChapters: user._count.chapterProgress,
          achievements: user._count.achievements,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
