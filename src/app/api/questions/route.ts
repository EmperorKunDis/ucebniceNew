import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chapterId = searchParams.get('chapterId')

  if (!chapterId) {
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
        // We don't send correctAnswer or explanation to the frontend for security
        // The frontend will receive explanation only after answering
      },
    })

    // Map to the format expected by the frontend
    const formattedQuestions = questions.map((q: any) => ({
      id: q.id,
      question: q.questionText,
      options: q.options as string[],
      xpReward: q.xpReward,
      // Frontend expects these but they shouldn't be revealed initially.
      // We might need to adjust the frontend type or send dummies/nulls if strictly required by types,
      // but for now let's see if we can get away with not sending them or handling it in frontend.
      // Looking at Question interface in src/data/questions.ts:
      // correctAnswer: number
      // explanation: string
      // We should probably just send them if we want to avoid refactoring everything right now,
      // BUT it defeats the purpose of security.
      // However, the prompt asked to fix the missing questions.
      // Let's send them for now to maintain compatibility with existing 'Question' interface
      // and 'ChapterLayout' logic if it purely relies on local data (though ChapterLayout sends answer to API).
      // WAIT, ChapterLayout calls 'handleAnswerQuestion' which calls '/api/questions/answer`.
      // The frontend DOES NOT verify locally.
      // But `QuestionCard` might display explanation after answer?
      // `handleAnswerQuestion` returns `correct` and `explanation`.
      // So we don't need to send them here!
    }))

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
