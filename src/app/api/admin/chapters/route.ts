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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'order'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const skip = (page - 1) * limit

    const [total, chapters, completedCounts] = await Promise.all([
      prisma.chapter.count(),
      prisma.chapter.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              progress: true,
            },
          },
        },
      }),
      prisma.chapterProgress.groupBy({
        by: ['chapterId'],
        where: { contentCompleted: true },
        _count: true,
      }),
    ])

    const completionsByChapterId = new Map(
      completedCounts.map(completion => [completion.chapterId, completion._count])
    )

    return NextResponse.json({
      chapters: chapters.map(chapter => {
        const completions = completionsByChapterId.get(chapter.id) ?? 0

        return {
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
            completions,
            inProgress: Math.max(0, chapter._count.progress - completions),
          },
        }
      }),
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
