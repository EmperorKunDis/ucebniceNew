import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/learning-path
 * Returns the skill tree data for the learning path visualization
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all chapters ordered by their order field
    const chapters = await prisma.chapter.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        chapterId: true,
        title: true,
        description: true,
        order: true,
        module: true,
        xpReward: true,
        difficulty: true,
      },
    })

    // Fetch user's gamified lesson progress.
    const progressData = await prisma.chapterProgress.findMany({
      where: { userId },
      select: {
        chapterId: true,
        progress: true,
        lessonsCompleted: true,
        exercisesCorrect: true,
        exercisesTotal: true,
      },
    })

    // Note: Review cards due count can be fetched here when concepts are implemented
    // const reviewDueCounts = await prisma.reviewCard.groupBy({...})

    // Map gamified progress by DB Chapter.id. Static ChapterCompletion intentionally
    // stays out of the dashboard contract so /chapters and /learn cannot complete each other.
    const progressMap = new Map(progressData.map(p => [p.chapterId, p]))

    // Calculate position for each node (snake pattern)
    const CONTAINER_WIDTH = 400
    const CENTER_X = CONTAINER_WIDTH / 2
    const VERTICAL_GAP = 120
    const HORIZONTAL_OFFSET = 80
    const CHECKPOINT_GAP = 60

    // Determine which chapter is the current active one
    let firstIncompleteIndex = chapters.findIndex(ch => {
      const progress = progressMap.get(ch.id)
      return (progress?.progress ?? 0) < 100
    })

    if (firstIncompleteIndex === -1) {
      firstIncompleteIndex = chapters.length // All complete
    }

    // Build nodes
    const nodes = chapters.map((chapter, index) => {
      const progress = progressMap.get(chapter.id)
      const progressPercentage = progress?.progress ?? 0
      const isCompleted = progressPercentage >= 100

      // Gamified stars reflect lesson progress only. Static textbook stars live in /chapters.
      const stars = isCompleted ? 3 : progressPercentage >= 67 ? 2 : progressPercentage > 0 ? 1 : 0

      // Determine status
      let status: 'completed' | 'active' | 'locked'
      if (isCompleted) {
        status = 'completed'
      } else if (index === firstIncompleteIndex) {
        status = 'active'
      } else if (index < firstIncompleteIndex) {
        // Previous chapters should be completed, but mark active if not
        status = 'active'
      } else {
        status = 'locked'
      }

      // Calculate position (snake pattern)
      const patternIndex = index % 5
      const xPositions = [
        CENTER_X, // center
        CENTER_X - HORIZONTAL_OFFSET, // left
        CENTER_X - HORIZONTAL_OFFSET * 1.5, // far left
        CENTER_X + HORIZONTAL_OFFSET, // right
        CENTER_X + HORIZONTAL_OFFSET * 1.5, // far right
      ]

      // Add checkpoint gap for module transitions
      const moduleNumber = Math.ceil((index + 1) / 5)
      const checkpointsBefore = moduleNumber - 1
      const y = index * VERTICAL_GAP + checkpointsBefore * CHECKPOINT_GAP + 100

      return {
        id: chapter.chapterId,
        title: chapter.title,
        description: chapter.description,
        module: chapter.module,
        order: chapter.order,
        status,
        stars,
        xpReward: chapter.xpReward,
        difficulty: chapter.difficulty,
        position: {
          x: xPositions[patternIndex] ?? CENTER_X,
          y,
        },
        prerequisites: index > 0 ? [chapters[index - 1]!.chapterId] : [],
        progress: progressPercentage,
        lessonsCompleted: progress?.lessonsCompleted ?? 0,
        exercisesCorrect: progress?.exercisesCorrect ?? 0,
        exercisesTotal: progress?.exercisesTotal ?? 0,
        reviewDue: 0, // Will be populated if we add concepts
      }
    })

    // Build edges (connections between nodes)
    const edges = chapters
      .slice(1)
      .map((chapter, index) => ({
        from: chapters[index]?.chapterId ?? '',
        to: chapter.chapterId,
      }))
      .filter(e => e.from !== '')

    // Build modules
    const moduleMap = new Map<number, { name: string; chapters: string[] }>()
    const moduleNames = [
      'Základy AI',
      'Pokročilé koncepty',
      'Machine Learning',
      'Deep Learning',
      'NLP a LLMs',
      'Počítačové vidění',
      'Praktické projekty',
      'Závěrečné projekty',
    ]

    chapters.forEach(chapter => {
      const mod = moduleMap.get(chapter.module) ?? {
        name: moduleNames[chapter.module - 1] ?? `Modul ${chapter.module}`,
        chapters: [],
      }
      mod.chapters.push(chapter.chapterId)
      moduleMap.set(chapter.module, mod)
    })

    const modules = Array.from(moduleMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      chaptersRange: data.chapters,
    }))

    // User progress summary
    const totalCompleted = progressData.filter(p => p.progress >= 100).length
    const totalStars = progressData.reduce((sum, p) => {
      if (p.progress >= 100) return sum + 3
      if (p.progress >= 67) return sum + 2
      if (p.progress > 0) return sum + 1
      return sum
    }, 0)

    const userProgress = {
      totalCompleted,
      totalChapters: chapters.length,
      currentChapter: nodes[firstIncompleteIndex]?.id ?? null,
      totalStars,
      maxStars: chapters.length * 3,
      percentage: chapters.length > 0 ? Math.round((totalCompleted / chapters.length) * 100) : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        modules,
        userProgress,
      },
    })
  } catch (error) {
    console.error('Error fetching learning path:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
