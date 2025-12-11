import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/chapters
 * Get all chapters with completion stats
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

    // Whitelist allowed sort fields to prevent injection
    const ALLOWED_SORT_FIELDS = [
      'order',
      'title',
      'createdAt',
      'updatedAt',
      'difficulty',
      'xpReward',
    ]
    const requestedSort = searchParams.get('sortBy') || 'order'
    const sortBy = ALLOWED_SORT_FIELDS.includes(requestedSort) ? requestedSort : 'order'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'

    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.chapter.count()

    // Get chapters with completion stats
    const chapters = await prisma.chapter.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            completedBy: true,
            progress: true,
          },
        },
      },
    })

    return NextResponse.json({
      chapters: chapters.map(chapter => ({
        id: chapter.id,
        chapterId: chapter.chapterId,
        title: chapter.title,
        description: chapter.description,
        xpReward: chapter.xpReward,
        difficulty: chapter.difficulty,
        order: chapter.order,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        stats: {
          completions: chapter._count.completedBy,
          inProgress: chapter._count.progress,
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
    console.error('Error fetching chapters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/chapters
 * Create a new chapter
 */
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { chapterId, title, description, xpReward, difficulty, order } = body

    if (!chapterId || !title || !difficulty || order === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const chapter = await prisma.chapter.create({
      data: {
        chapterId,
        title,
        description: description || null,
        xpReward: xpReward || 100,
        difficulty,
        order,
      },
    })

    return NextResponse.json({ chapter }, { status: 201 })
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
