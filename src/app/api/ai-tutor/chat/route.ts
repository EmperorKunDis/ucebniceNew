import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const AI_MODEL = process.env.AI_TUTOR_MODEL ?? 'gpt-4o-mini'

// System prompt for the AI tutor
const SYSTEM_PROMPT = `Jsi AI tutor pro kurz "Programování AI". Pomáháš studentům pochopit koncepty umělé inteligence, machine learningu a programování v Pythonu.

Pravidla:
1. Odpovídej v češtině, pokud student nepíše anglicky
2. Buď trpělivý a povzbuzující
3. Používej jednoduché příklady a analogie
4. Pokud student dělá chybu, vysvětli proč je to špatně a jak to udělat správně
5. Nabídni follow-up otázky pro hlubší porozumění
6. Pokud je otázka mimo téma kurzu, zdvořile přesměruj zpět k AI/ML tématu
7. Formátuj kód pomocí markdown code blocks

Témata kurzu zahrnují:
- Základy Pythonu
- NumPy, Pandas, Matplotlib
- Machine Learning (supervised, unsupervised)
- Neuronové sítě a Deep Learning
- NLP a Large Language Models
- Počítačové vidění
- Praktické projekty s TensorFlow/PyTorch`

/**
 * POST /api/ai-tutor/chat
 * Send a message to the AI tutor
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI Tutor není nakonfigurován' }, { status: 503 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { message, chapterId, conversationId } = body

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json({ error: 'Neplatná zpráva (max 2000 znaků)' }, { status: 400 })
    }

    // Rate limit: max 30 messages per hour
    const oneHourAgo = new Date(Date.now() - 3600000)
    const recentMessages = await prisma.aIChatHistory.count({
      where: {
        userId,
        role: 'user',
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentMessages >= 30) {
      return NextResponse.json(
        { error: 'Příliš mnoho zpráv. Zkus to znovu za chvíli.' },
        { status: 429 }
      )
    }

    // Get conversation history (last 10 messages)
    let conversationHistory: { role: string; content: string }[] = []
    if (conversationId) {
      const history = await prisma.aIChatHistory.findMany({
        where: { userId, id: { startsWith: conversationId } },
        orderBy: { createdAt: 'asc' },
        take: 10,
        select: { role: true, content: true },
      })
      conversationHistory = history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      }))
    }

    // Get chapter context if provided
    let chapterContext = ''
    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { chapterId },
        select: { title: true, description: true },
      })
      if (chapter) {
        chapterContext = `\n\nStudent se právě učí kapitolu: "${chapter.title}"\nPopis: ${chapter.description}`
      }
    }

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + chapterContext },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return NextResponse.json({ error: 'AI Tutor není momentálně dostupný' }, { status: 503 })
    }

    const openaiData = await openaiResponse.json()
    const assistantMessage = openaiData.choices?.[0]?.message?.content ?? ''
    const tokensUsed = openaiData.usage?.total_tokens ?? 0

    // Generate conversation ID if new
    const newConversationId = conversationId ?? `conv_${Date.now()}_${userId.slice(0, 8)}`

    // Save both messages to history
    await prisma.aIChatHistory.createMany({
      data: [
        {
          userId,
          chapterId: chapterId ?? null,
          role: 'user',
          content: message,
          model: AI_MODEL,
          tokenCount: null,
        },
        {
          userId,
          chapterId: chapterId ?? null,
          role: 'assistant',
          content: assistantMessage,
          model: AI_MODEL,
          tokenCount: tokensUsed,
        },
      ],
    })

    // Extract code blocks for syntax highlighting hints
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const codeBlocks: { language: string; code: string }[] = []
    let match
    while ((match = codeBlockRegex.exec(assistantMessage)) !== null) {
      codeBlocks.push({
        language: match[1] ?? 'python',
        code: match[2] ?? '',
      })
    }

    // Generate suggested follow-up questions
    const suggestedFollowups = generateFollowups(message, assistantMessage)

    return NextResponse.json({
      success: true,
      data: {
        response: assistantMessage,
        conversationId: newConversationId,
        codeBlocks,
        suggestedFollowups,
        tokensUsed,
      },
    })
  } catch (error) {
    console.error('Error in AI tutor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate suggested follow-up questions based on context
 */
function generateFollowups(userMessage: string, _assistantResponse: string): string[] {
  const followups: string[] = []

  // Basic follow-up patterns
  if (
    userMessage.toLowerCase().includes('neural') ||
    userMessage.toLowerCase().includes('neuron')
  ) {
    followups.push('Jak funguje backpropagation?')
    followups.push('Jaký je rozdíl mezi CNN a RNN?')
  }

  if (userMessage.toLowerCase().includes('python') || userMessage.toLowerCase().includes('kód')) {
    followups.push('Můžeš mi ukázat praktický příklad?')
    followups.push('Jak bych to optimalizoval?')
  }

  if (
    userMessage.toLowerCase().includes('machine learning') ||
    userMessage.toLowerCase().includes('ml')
  ) {
    followups.push('Jaký algoritmus bych měl použít pro můj problém?')
    followups.push('Jak připravím data pro trénování?')
  }

  // Default follow-ups
  if (followups.length === 0) {
    followups.push('Můžeš to vysvětlit jednodušeji?')
    followups.push('Jaké jsou praktické aplikace?')
  }

  return followups.slice(0, 3)
}
