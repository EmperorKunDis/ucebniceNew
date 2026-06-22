# src/app/api/review/ - AI Context

## 🎯 PURPOSE

Spaced Repetition System (SRS) API using the SM-2 algorithm for long-term retention of learned concepts.

## 📦 EXPORTS (API Routes)

| Route                 | Methods | Purpose                  |
| --------------------- | ------- | ------------------------ |
| `/api/review/session` | GET     | Get cards due for review |
| `/api/review/answer`  | POST    | Submit review rating     |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access
- `@/lib/streak-manager` - Streak updates
- `@/lib/quest-tracker` - Quest progress

## 🏗️ PATTERNS

### SM-2 Algorithm

```typescript
// SuperMemo 2 spaced repetition algorithm
// Quality: 0 = blackout, 5 = perfect recall

if (quality < 3) {
  // Failed - reset
  newRepetitions = 0
  newInterval = 1
} else {
  // Success - increase interval
  if (repetitions === 0) newInterval = 1
  else if (repetitions === 1) newInterval = 6
  else newInterval = Math.round(interval * easeFactor)
  newRepetitions++
}

// Ease factor adjustment
newEaseFactor = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
newEaseFactor = Math.max(1.3, newEaseFactor)
```

### Rating to Quality Mapping

```typescript
const qualityMap = {
  AGAIN: 0, // Complete blackout
  HARD: 2, // Significant difficulty
  GOOD: 4, // Correct with effort
  EASY: 5, // Perfect recall
}
```

### Response Format - Session

```typescript
{
  totalDue: 15,
  cards: [{
    id, conceptId, conceptName, conceptDescription,
    chapterTitle, chapterId,
    exercise: { type, question, data, hints },
    difficulty: { easeFactor, interval, repetitions, lastRating }
  }],
  stats: {
    totalCards, averageEaseFactor,
    masteredCards,  // interval >= 21 days
    learningCards,  // 0 < interval < 21
    newCards        // repetitions === 0
  }
}
```

### Response Format - Answer

```typescript
{
  newInterval: 6,
  newEaseFactor: 2.6,
  newRepetitions: 2,
  nextReviewAt: "2026-02-12T00:00:00Z",
  xpEarned: 5,
  correct: true
}
```

### Card Maturity Levels

| State    | Condition         | Description         |
| -------- | ----------------- | ------------------- |
| New      | repetitions = 0   | Never reviewed      |
| Learning | 0 < interval < 21 | Still being learned |
| Mastered | interval >= 21    | Long-term memory    |

## ⚠️ GOTCHAS

1. **Minimum ease factor**: Never goes below 1.3
2. **XP only on success**: quality >= 3 to earn XP
3. **Card ordering**: Due cards sorted by `nextReviewAt` ascending
4. **Concept exercises**: Each concept links to exercises for review content

## 📁 STRUCTURE

```
review/
├── _AI.md              # This file
├── session/route.ts    # GET due cards
└── answer/route.ts     # POST rating
```

## 🔄 RELATED

- `prisma/schema.prisma` - ReviewCard, Concept models
- `src/components/learning/review/` - Review UI (TODO)
- `/api/quests` - REVIEW_SESSIONS quest category

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: answer/route.ts (SM-2 algorithm) -->
