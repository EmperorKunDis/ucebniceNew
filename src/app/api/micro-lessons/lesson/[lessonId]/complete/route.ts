import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAndAwardAchievements } from '@/lib/achievement-checker'
import { completeMicroLesson, LearningServiceError } from '@/lib/learning-service'

interface RouteParams {
  params: Promise<{ lessonId: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId } = await params
    const result = await completeMicroLesson({ userId: session.user.id, lessonId })
    const newAchievements =
      result.xpEarned > 0 ? await checkAndAwardAchievements(session.user.id) : []
    return NextResponse.json({ ...result, newAchievements })
  } catch (error) {
    if (error instanceof LearningServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Error completing micro lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
