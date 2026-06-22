# src/app/api/quests/ - AI Context

## 🎯 PURPOSE

Daily and weekly quest system API - tracks progress, serves quests, handles reward claiming.

## 📦 EXPORTS (API Routes)

| Route               | Methods | Purpose                                |
| ------------------- | ------- | -------------------------------------- |
| `/api/quests`       | GET     | List daily/weekly quests with progress |
| `/api/quests/claim` | POST    | Claim rewards for completed quest      |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access
- `@/lib/quest-tracker` - Quest progress & claiming logic

## 🏗️ PATTERNS

### Quest Types & Categories

```typescript
enum QuestType {
  DAILY, // Resets at midnight
  WEEKLY, // Resets on Monday
  SPECIAL, // Event-based, custom validity
}

enum QuestCategory {
  LESSONS_COMPLETED,
  XP_EARNED,
  STREAK_MAINTAINED,
  EXERCISES_PERFECT,
  REVIEW_SESSIONS,
  // ... more in schema
}
```

### Quest Progress Flow

```
User action → updateQuestProgress(category, increment)
           → Check all active quests with that category
           → Update UserQuest.progress
           → If completed, create notification
           → User claims via /api/quests/claim
           → Award XP + gems
```

### Response Format

```typescript
{
  daily: {
    resetAt: "2025-02-07T00:00:00Z",
    quests: [{
      id, title, description, icon,
      targetValue: 5,
      currentProgress: 3,
      percentage: 60,
      completed: false,
      claimed: false,
      rewards: { xp: 50, gems: 10 }
    }],
    bonusQuest: { allCompleted: false, rewards: {...} }
  },
  weekly: {...}
}
```

## ⚠️ GOTCHAS

1. **Reset timing**: Daily at midnight, weekly on Monday - both local server time
2. **Bonus quest**: Extra rewards when ALL daily quests completed
3. **Claim only once**: `claimed` flag prevents double claiming
4. **Progress update**: Called from various places (exercise complete, lesson done, etc.)

## 📁 STRUCTURE

```
quests/
├── _AI.md              # This file
├── route.ts            # GET quests list
└── claim/
    └── route.ts        # POST claim rewards
```

## 🔄 RELATED

- `src/lib/quest-tracker.ts` - Core quest logic
- `prisma/seed-duolingo.ts` - Seeds quest definitions
- Exercise/lesson completion handlers - Call updateQuestProgress

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: route.ts, claim/route.ts -->
