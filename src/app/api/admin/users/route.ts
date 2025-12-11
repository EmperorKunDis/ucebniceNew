import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const parsedLimit = parseInt(searchParams.get('limit') || '50')
    const page = Math.max(parsedPage, 1)
    const limit = Math.min(Math.max(parsedLimit, 1), 100)
    const search = searchParams.get('search') || ''

    // Whitelist allowed sort fields to prevent injection
    const ALLOWED_SORT_FIELDS = [
      'createdAt',
      'email',
      'name',
      'username',
      'xp',
      'level',
      'updatedAt',
    ]
    const requestedSort = searchParams.get('sortBy') || 'createdAt'
    const sortBy = ALLOWED_SORT_FIELDS.includes(requestedSort) ? requestedSort : 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

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

    // Get users with relations
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            completedChapters: true,
            achievements: true,
            chapterCompletions: true,
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
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          completedChapters: user._count.completedChapters,
          achievements: user._count.achievements,
          chapterCompletions: user._count.chapterCompletions,
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
