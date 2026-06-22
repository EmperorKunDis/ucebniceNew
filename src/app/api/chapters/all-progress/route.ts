import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get all chapter completions for this user
    const chapterCompletions = await prisma.chapterCompletion.findMany({
      where: {
        userId: user.id,
      },
    })

    // Convert to map for easy lookup
    const progress: Record<
      string,
      {
        completedChapter: boolean
        answeredQuestions: boolean
        submittedProject: boolean
        completed: boolean
      }
    > = {}

    chapterCompletions.forEach(completion => {
      progress[completion.chapterId] = {
        completedChapter: completion.completedChapter,
        answeredQuestions: completion.answeredQuestions,
        submittedProject: completion.submittedProject,
        // BUG FIX: completed = Star 1 (completedChapter), not just record existence
        completed: completion.completedChapter,
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching all chapter progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
