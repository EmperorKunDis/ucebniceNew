import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canonicalChapterIdsThrough } from '@/lib/canonical-content-keys'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      // Return empty progress if not logged in
      return NextResponse.json({ progress: {} })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ progress: {} })
    }

    const chapterProgress = await prisma.chapterProgress.findMany({
      where: {
        userId: user.id,
        chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
      },
      include: { chapter: { select: { chapterId: true } } },
    })

    // Convert to map for easy lookup
    const progress: Record<
      string,
      {
        completedChapter: boolean
        answeredQuestions: boolean
        submittedProject: boolean
        completed: boolean
        stars: number
      }
    > = {}

    chapterProgress.forEach(chapterProgress => {
      progress[chapterProgress.chapter.chapterId] = {
        completedChapter: chapterProgress.contentCompleted,
        answeredQuestions: chapterProgress.exercisesCompleted,
        submittedProject: chapterProgress.projectApproved,
        completed: chapterProgress.contentCompleted,
        stars: chapterProgress.stars,
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching all chapter progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
