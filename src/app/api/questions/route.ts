import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isCanonicalChapterId } from '@/lib/canonical-content-keys'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chapterId = searchParams.get('chapterId')

  if (!chapterId || !isCanonicalChapterId(chapterId)) {
    return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 })
  }

  try {
    // Find chapter first to get internal ID
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const questions = await prisma.question.findMany({
      where: {
        chapterId: chapter.id,
      },
      orderBy: {
        questionNumber: 'asc',
      },
      select: {
        id: true,
        questionNumber: true,
        questionText: true,
        options: true,
        xpReward: true,
        // Answer keys and explanations remain server-side.
      },
    })

    // Read-only compatibility DTO; the v2 exercise API is canonical.
    const formattedQuestions = questions.map((q: any) => ({
      id: q.id,
      question: q.questionText,
      options: q.options as string[],
      xpReward: q.xpReward,
    }))

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
