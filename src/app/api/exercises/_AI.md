# src/app/api/exercises/ - AI Context

## 🎯 PURPOSE

API endpoints for interactive exercises - answer submission, hint requests, and progress tracking.

## 📦 EXPORTS (API Routes)

| Route                        | Methods | Purpose                         |
| ---------------------------- | ------- | ------------------------------- |
| `/api/exercises/[id]/answer` | POST    | Submit an answer to an exercise |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access
- `@/lib/streak-manager` - Streak updates on correct answers
- `@/lib/quest-tracker` - Quest progress updates

## 🏗️ PATTERNS

### Answer Evaluation

```typescript
// Different evaluation logic per exercise type
switch (type) {
  case 'MULTIPLE_CHOICE':
    return answer === data.correctIndex
  case 'TRUE_FALSE':
    return answer === data.isTrue
  case 'FILL_IN_BLANK': // Check all blanks with alternatives
  case 'CODE_OUTPUT':
    return answer === data.correctIndex
  case 'MATCH_PAIRS': // Verify all pairs match
}
```

### Heart System Integration

```typescript
// Check hearts before allowing answer
if (!hasUnlimitedHearts && user.hearts <= 0) {
  return { error: 'Nemáš žádná srdce', outOfHearts: true }
}

// Lose heart on wrong answer
if (!isCorrect && !hasUnlimitedHearts) {
  await prisma.user.update({ hearts: { decrement: 1 } })
}
```

### XP Multiplier Check

```typescript
// Check for active double XP boost
const xpBoost = await prisma.userPurchase.findFirst({
  where: {
    userId,
    expiresAt: { gt: new Date() },
    item: { key: 'double_xp' },
  },
})
if (xpBoost) xpEarned *= 2
```

### Response Format - Correct

```typescript
{
  correct: true,
  xpEarned: 10,
  leveledUp: null | newLevel,
  questProgress: [{ questId, newProgress, target }],
  hearts: 5,
  heartLost: false
}
```

### Response Format - Incorrect

```typescript
{
  correct: false,
  correctAnswer: { index: 2, text: "Správná odpověď" },
  explanation: "Vysvětlení proč...",
  hearts: 4,
  heartLost: true,
  outOfHearts: false
}
```

## ⚠️ GOTCHAS

1. **Hearts check first**: Always verify hearts before processing answer
2. **XP boost stacking**: Only one boost type active at a time
3. **Level calculation**: `level = floor(sqrt(xp/100)) + 1`
4. **Chapter progress**: Updates both correct and total counts

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
