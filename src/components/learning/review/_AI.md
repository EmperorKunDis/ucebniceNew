# src/components/learning/review/ - AI Context

## 🎯 PURPOSE

Spaced repetition review session UI components - flashcard-style concept review with SM-2 difficulty rating.

## 📦 EXPORTS

| Component        | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `ReviewSession`  | Main session controller, fetches cards, tracks stats |
| `ReviewCard`     | Individual card with reveal/rate interaction         |
| `ReviewComplete` | Session completion screen with stats                 |

## 🔗 DEPENDENCIES

- `framer-motion` - Card flip animation, transitions
- `@/components/learning/exercise` - ExercisePlayer for practice mode
- `@/components/gamification/celebrations` - Confetti on completion
- `/api/review/session` - Fetch due cards
- `/api/review/answer` - Submit ratings

## 🏗️ PATTERNS

### Review Flow

```
ReviewSession
  ├── Fetch due cards from /api/review/session
  ├── Display ReviewCard one at a time
  │   ├── Show concept name (front)
  │   ├── "Ukázat odpověď" → reveal description
  │   ├── Optional: "Procvičit s cvičením" → ExercisePlayer
  │   └── Rate: AGAIN | HARD | GOOD | EASY
  ├── Track session stats (reviewed, correct, xpEarned)
  └── Show ReviewComplete when all cards done
```

### Rating System

```typescript
const ratings = [
  { rating: 'AGAIN', interval: '1d' }, // Reset
  { rating: 'HARD', interval: interval * 0.8 }, // Shorter
  { rating: 'GOOD', interval: interval * EF }, // Normal
  { rating: 'EASY', interval: interval * EF * 1.3 }, // Longer
]
```

### Stats Tracking

```typescript
const sessionStats = {
  reviewed: number, // Total cards reviewed
  correct: number, // Non-AGAIN ratings
  xpEarned: number, // Sum of XP from API responses
}
```

## ⚠️ GOTCHAS

1. **Exercise mode**: If card has exercise, "Procvičit" button shows ExercisePlayer
2. **Auto-rate**: Exercise result auto-rates card (correct→GOOD, wrong→AGAIN)
3. **Interval preview**: Rating buttons show predicted next interval
4. **Card flip**: Uses 3D transform but doesn't actually flip (simplified)

## 📁 STRUCTURE

```
review/
├── _AI.md              # This file
├── index.ts            # Barrel exports
├── ReviewSession.tsx   # Main controller
├── ReviewCard.tsx      # Single card UI
└── ReviewComplete.tsx  # Completion screen
```

## 🔄 RELATED

- `/api/review/session` - Data source
- `/api/review/answer` - Rating submission
- `src/lib/streak-manager.ts` - Updates streak on correct answers
- `src/components/learning/exercise/` - Practice mode

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: ReviewSession.tsx -->
