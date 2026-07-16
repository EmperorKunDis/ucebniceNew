# src/app/api/exercises/ - AI Context

## 🎯 PURPOSE

Canonical server-authoritative answer submission for v2 exercises.

## 📦 EXPORTS (API Routes)

| Route                        | Methods | Purpose                         |
| ---------------------------- | ------- | ------------------------------- |
| `/api/exercises/[id]/answer` | POST    | Submit an answer to an exercise |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/learning-service` - Serializable attempt, progress and reward workflow
- `@/lib/exercise-contract` - Private server-side answer evaluation

## 🏗️ PATTERNS

### Write contract

```typescript
POST /api/exercises/:id/answer
Idempotency-Key: <stable key for this explicit attempt>

{ answer, hintsUsed?, timeSpentSeconds?, idempotencyKey? }
```

`ExercisePlayer` reuses the same key for a network retry. Reusing a key with a different exercise or answer returns `409`.

### Canonical transaction

```typescript
attempt -> server evaluation -> ExerciseProgress -> ChapterProgress
        -> RewardLedger -> XP/streak/quests/league
```

The transaction uses `Serializable` isolation and retries Prisma `P2034`. `RewardLedger` grants the first correct answer only; later correct attempts remain recorded with `xpEarned: 0`.

### Response

```typescript
{
  ;(correct,
    xpEarned,
    replayed,
    hearts,
    heartLost,
    outOfHearts,
    totalXP,
    level,
    leveledUp,
    exercisesCompleted,
    stars,
    questProgress)
}
```

The response never contains `correctAnswer`, `correctIndex`, ordered correct pairs or any other answer key.

## ⚠️ GOTCHAS

1. **Idempotency is mandatory**: Reject writes without a stable attempt key.
2. **Internal chapter ids only**: `ChapterProgress.chapterId` receives `Chapter.id`, never public slug `"01"`.
3. **Content gate**: The lesson content must be completed before its exercises accept answers.
4. **No answer key**: Evaluation stays in `learning-service.ts` and `exercise-contract.ts`.

## 📁 STRUCTURE

```
exercises/
├── _AI.md                    # This file
└── [id]/
    └── answer/route.ts       # POST answer submission
```

## 🔄 RELATED

- `/api/user/hearts` - Hearts management
- `/api/micro-lessons/` - Lesson/exercise source
- `src/components/learning/exercise/` - Exercise UI

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: [id]/answer/route.ts -->
