# src/components/learning/exercise/ - AI Context

## 🎯 PURPOSE

Interactive exercise components for the micro-lesson system. Supports multiple exercise types with hints, feedback, and XP rewards.

## 📦 EXPORTS

| File                           | Component      | Purpose                                         |
| ------------------------------ | -------------- | ----------------------------------------------- |
| `ExercisePlayer.tsx`           | ExercisePlayer | Main wrapper that renders correct exercise type |
| `exercises/MultipleChoice.tsx` | MultipleChoice | A/B/C/D choice questions                        |
| `exercises/FillInBlank.tsx`    | FillInBlank    | Text with \_\_\_ blanks to fill                 |
| `exercises/TrueFalse.tsx`      | TrueFalse      | True/False statement evaluation                 |
| `exercises/CodeOutput.tsx`     | CodeOutput     | "What does this code print?"                    |
| `exercises/MatchPairs.tsx`     | MatchPairs     | Connect left items to right items               |

## 🔗 DEPENDENCIES

- `framer-motion` - Animations and transitions
- `lucide-react` - Icons
- `@/lib/utils` - `cn()` class merging

## 🏗️ PATTERNS

### Exercise Data Structure

```typescript
interface Exercise {
  id: string
  type: ExerciseType // 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | etc.
  question: string
  data: Record<string, unknown> // Type-specific data
  explanation?: string
  hints?: string[]
  xpReward: number
}

// Example data for each type:
// MULTIPLE_CHOICE: { options: string[], correctIndex: number }
// FILL_IN_BLANK: { text: string, answers: string[], alternatives?: string[][] }
// TRUE_FALSE: { isTrue: boolean }
// CODE_OUTPUT: { code: string, language: string, options: string[], correctIndex: number }
// MATCH_PAIRS: { pairs: { left: string, right: string }[] }
```

### Callback Pattern

```typescript
// All exercise types call onAnswer(userAnswer, isCorrect)
// ExercisePlayer wraps this to handle hearts, XP, etc.

onComplete: (isCorrect: boolean, xpEarned: number) => void
onHeartLost?: () => void  // Called when wrong answer
```

### Hint System

```typescript
// Hints reduce XP reward by 2 each
const xpEarned = Math.max(1, exercise.xpReward - hintsUsed * 2)
```

## ⚠️ GOTCHAS

1. **MatchPairs shuffle**: Right column is shuffled once on mount using useState initializer
2. **FillInBlank alternatives**: Case-insensitive by default, supports multiple correct answers
3. **Auto-submit**: MatchPairs auto-submits when all pairs connected
4. **Disabled state**: All exercises accept `disabled` prop to prevent interaction after answer

## 📁 STRUCTURE

```
exercise/
├── _AI.md              # This file
├── index.ts            # Barrel exports
├── ExercisePlayer.tsx  # Main player component
└── exercises/
    ├── index.ts
    ├── MultipleChoice.tsx
    ├── FillInBlank.tsx
    ├── TrueFalse.tsx
    ├── CodeOutput.tsx
    └── MatchPairs.tsx
```

## 🔄 RELATED

- `/api/exercises/[id]/answer` - Submit answer API
- `src/components/gamification/hearts/` - Heart loss handling
- `src/components/gamification/celebrations/` - XP gain animations
- `prisma/schema.prisma` - Exercise model with ExerciseType enum

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: ExercisePlayer.tsx -->
