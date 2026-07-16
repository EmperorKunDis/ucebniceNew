# src/app/(main)/learn/ - AI Context

## 🎯 PURPOSE

Learning flow pages - chapter overview, micro-lessons, and practice sessions. This is the core Duolingo-style learning experience.

## 📄 PAGES

| Path                                   | Purpose                            |
| -------------------------------------- | ---------------------------------- |
| `/learn`                               | Redirects to `/dashboard`          |
| `/learn/[chapterId]`                   | Chapter overview with lesson list  |
| `/learn/[chapterId]/lesson/[lessonId]` | Content-first lesson and exercises |
| `/learn/[chapterId]/practice`          | Random exercises for practice      |

## 🔗 DEPENDENCIES

- `@/components/learning/exercise` - ExercisePlayer
- `@/components/gamification/hearts` - useHearts for life system
- `@/components/gamification/celebrations` - Confetti, XPGainAnimation
- `/api/micro-lessons/[chapterId]` - Chapter data
- `/api/micro-lessons/lesson/[lessonId]` - Lesson exercises

## 🏗️ PATTERNS

### Learning Flow

```
/dashboard (skill tree)
    ↓ click chapter
/learn/[chapterId] (overview)
    ↓ click lesson
/learn/[chapterId]/lesson/[lessonId] (Markdown, video and resources)
    ↓ explicit "Pokračovat na cvičení"
server-authoritative exercises
    ↓ complete
back to chapter overview
```

### Lesson content contract

The lesson UI accepts `content`, `videoFile`, `notebookLMUrl`, `colabNotebook`,
`projectDescription` and `progress.contentCompleted`. Content is raw Markdown
from the database. The page always presents content before exercises and never
derives answer correctness in the browser.

### Exercise Session

```typescript
// Common pattern across lesson and practice
const [currentIndex, setCurrentIndex] = useState(0)
const [score, setScore] = useState({ correct: 0, total: 0 })
const [xpEarned, setXpEarned] = useState(0)
const [isComplete, setIsComplete] = useState(false)

const handleExerciseComplete = (isCorrect: boolean, earnedXP: number) => {
  // Update score
  // Lose heart if wrong
  // Move to next or complete
}
```

### Lesson Completion

- Shows Confetti animation
- Displays stars (1-3 based on accuracy)
- Shows XP earned
- Navigate back to chapter

## ⚠️ GOTCHAS

1. **Lesson locking**: Lessons unlock sequentially (previous must be completed)
2. **Hearts consumed**: Wrong answers call `loseHeart()` from useHearts
3. **Exercise undefined check**: Must check `currentExercise` exists before render
4. **Practice mode**: `/practice` fetches random exercises from all lessons
5. **Answer keys**: Exercise DTOs contain display fields only; feedback comes from the answer API
6. **Projects**: The chapter overview and lesson completion screen render `ProjectSubmission`

## 📁 STRUCTURE

```
learn/
├── _AI.md                    # This file
├── page.tsx                  # Redirect to /dashboard
└── [chapterId]/
    ├── page.tsx              # Chapter overview
    ├── lesson/
    │   └── [lessonId]/
    │       └── page.tsx      # Lesson player
    └── practice/
        └── page.tsx          # Practice session
```

## 🔄 RELATED

- `/api/micro-lessons/` - Data endpoints
- `/api/exercises/[id]/answer` - Answer submission
- `src/components/learning/exercise/` - Exercise components

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes (nested dynamic routes) -->
<!-- DEPTH: 3 -->
<!-- CRITICAL: lesson/[lessonId]/page.tsx -->
