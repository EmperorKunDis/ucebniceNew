import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ai-tutor/history
 * Get user's AI tutor chat history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const chapterId = searchParams.get('chapterId')

    const userId = session.user.id

    // Build where clause
    const where = {
      userId,
      ...(chapterId ? { chapterId } : {}),
    }

    const history = await prisma.aIChatHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      select: {
        id: true,
        role: true,
        content: true,
        chapterId: true,
        model: true,
        helpful: true,
        createdAt: true,
      },
    })

    // Reverse to get chronological order
    history.reverse()

    // Group by conversation (messages within 30 min of each other)
    const conversations: {
      id: string
      chapterId: string | null
      messages: typeof history
      startedAt: Date
    }[] = []

    let currentConversation: typeof history = []
    let lastTimestamp: Date | null = null

    for (const msg of history) {
      const msgTime = new Date(msg.createdAt)

      if (lastTimestamp && msgTime.getTime() - lastTimestamp.getTime() > 1800000) {
        // More than 30 min gap - new conversation
        if (currentConversation.length > 0) {
          conversations.push({
            id: currentConversation[0]?.id ?? '',
            chapterId: currentConversation[0]?.chapterId ?? null,
            messages: currentConversation,
            startedAt: new Date(currentConversation[0]?.createdAt ?? new Date()),
          })
        }
        currentConversation = []
      }

      currentConversation.push(msg)
      lastTimestamp = msgTime
    }

    // Don't forget the last conversation
    if (currentConversation.length > 0) {
      conversations.push({
        id: currentConversation[0]?.id ?? '',
        chapterId: currentConversation[0]?.chapterId ?? null,
        messages: currentConversation,
        startedAt: new Date(currentConversation[0]?.createdAt ?? new Date()),
      })
    }

    // Get total message count
    const totalMessages = await prisma.aIChatHistory.count({
      where: { userId },
    })

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations.reverse(), // Most recent first
        totalMessages,
        totalConversations: conversations.length,
      },
    })
  } catch (error) {
    console.error('Error fetching AI tutor history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
