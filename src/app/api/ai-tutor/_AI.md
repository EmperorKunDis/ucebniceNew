# src/app/api/ai-tutor/ - AI Context

## 🎯 PURPOSE

AI-powered tutoring system using OpenAI GPT to help students understand AI/ML concepts with context-aware responses. This is AI-readiness only, not a model training pipeline.

## 📦 EXPORTS (API Routes)

| Route                   | Methods | Purpose                       |
| ----------------------- | ------- | ----------------------------- |
| `/api/ai-tutor/chat`    | POST    | Send message, get AI response |
| `/api/ai-tutor/history` | GET     | Retrieve chat history         |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access
- OpenAI API - GPT model

## 🏗️ PATTERNS

### Environment Variables

```env
OPENAI_API_KEY=sk-...
AI_TUTOR_MODEL=gpt-4o-mini  # Default model
```

### System Prompt

```typescript
const SYSTEM_PROMPT = `Jsi AI tutor pro kurz "Programování AI"...`

// Includes:
// - Language preference (Czech)
// - Teaching style guidelines
// - Course topic boundaries
// - Code formatting instructions
```

### Chapter Context Injection

```typescript
// When chapterId provided, adds context:
if (chapterId) {
  const chapter = await prisma.chapter.findUnique(...)
  chapterContext = `Student se právě učí kapitolu: "${chapter.title}"`
}
```

### Rate Limiting

```typescript
// 30 messages per hour per user
const recentMessages = await prisma.aIChatHistory.count({
  where: {
    userId,
    role: 'user',
    createdAt: { gte: oneHourAgo },
  },
})
```

### Request Format

```typescript
POST /api/ai-tutor/chat
{
  message: string,        // User's question (max 2000 chars)
  chapterId?: string,     // For context
  conversationId?: string // Continue conversation
}
```

### Response Format

```typescript
{
  response: string,           // AI response (markdown)
  conversationId: string,     // For follow-ups
  codeBlocks: [{              // Extracted code blocks
    language: string,
    code: string
  }],
  suggestedFollowups: string[], // AI-suggested questions
  tokensUsed: number
}
```

### History Grouping

```typescript
// Messages within 30 min grouped as one conversation
if (msgTime - lastTimestamp > 1800000) {
  // New conversation
}
```

## ⚠️ GOTCHAS

1. **API Key required**: Returns 503 if OPENAI_API_KEY not set
2. **Rate limit**: 30 messages/hour enforced in DB, not Redis
3. **Context window**: Only last 10 messages included in conversation
4. **Token counting**: Stored for cost tracking, but not billed to user
5. **Helpful flag**: Exists in schema for feedback, not yet implemented
6. **Readiness docs**: See `docs/AI_READINESS.md` for eval smoke scenarios and prompt/versioning expectations

## 📁 STRUCTURE

```
ai-tutor/
├── _AI.md              # This file
├── chat/route.ts       # POST send message
└── history/route.ts    # GET chat history
```

## 🔄 RELATED

- `prisma/schema.prisma` - AIChatHistory model
- `src/app/(main)/ai-tutor/` - AI Tutor UI page (TODO)
- Chapter pages - Can launch tutor with chapter context

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: chat/route.ts (OpenAI integration) -->
