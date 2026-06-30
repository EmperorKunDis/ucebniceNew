import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/review/session
 * Get review cards due for spaced repetition session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '20')

    // Get cards due for review
    const dueCards = await prisma.reviewCard.findMany({
      where: {
        userId,
        nextReviewAt: { lte: new Date() },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: Math.min(limit, 50),
      include: {
        concept: {
          include: {
            chapter: {
              select: {
                chapterId: true,
                title: true,
              },
            },
            exercises: {
              take: 1,
              orderBy: { order: 'asc' },
              select: {
                id: true,
                type: true,
                question: true,
                data: true,
                hints: true,
                xpReward: true,
              },
            },
          },
        },
      },
    })

    // Get total due count
    const totalDue = await prisma.reviewCard.count({
      where: {
        userId,
        nextReviewAt: { lte: new Date() },
      },
    })

    // Get user's review stats
    const stats = await prisma.reviewCard.groupBy({
      by: ['userId'],
      where: { userId },
      _count: true,
      _avg: { easeFactor: true },
    })

    const masteredCount = await prisma.reviewCard.count({
      where: {
        userId,
        interval: { gte: 21 }, // 21+ days = mastered
      },
    })

    const learningCount = await prisma.reviewCard.count({
      where: {
        userId,
        interval: { lt: 21, gt: 0 },
      },
    })

    const newCount = await prisma.reviewCard.count({
      where: {
        userId,
        repetitions: 0,
      },
    })

    // Format cards for response
    const cards = dueCards.map(card => ({
      id: card.id,
      conceptId: card.conceptId,
      conceptName: card.concept.name,
      conceptDescription: card.concept.description,
      chapterTitle: card.concept.chapter.title,
      chapterId: card.concept.chapter.chapterId,
      exercise: card.concept.exercises[0] ?? null,
      difficulty: {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        lastRating: card.lastRating,
      },
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalDue,
        cards,
        stats: {
          totalCards: stats[0]?._count ?? 0,
          averageEaseFactor: stats[0]?._avg?.easeFactor ?? 2.5,
          masteredCards: masteredCount,
          learningCards: learningCount,
          newCards: newCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching review session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
