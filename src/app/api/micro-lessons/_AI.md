# src/app/api/micro-lessons/ - AI Context

## 🎯 PURPOSE

API endpoints for the micro-lesson system - short, focused learning units within chapters.

## 📦 EXPORTS (API Routes)

| Route                                  | Methods | Purpose                              |
| -------------------------------------- | ------- | ------------------------------------ |
| `/api/micro-lessons/[chapterId]`       | GET     | List all micro-lessons in a chapter  |
| `/api/micro-lessons/lesson/[lessonId]` | GET     | Get a specific lesson with exercises |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Lesson Status Determination

```typescript
// Based on user's lessonsCompleted count
const completedLessons = chapterProgress?.lessonsCompleted ?? 0

lessons.map((lesson, index) => {
  if (index < completedLessons) return 'completed'
  if (index === completedLessons) return 'active'
  return 'locked'
})
```

### Response Format - Chapter Lessons

```typescript
{
  chapterId: "05",
  chapterTitle: "Datové struktury",
  lessons: [{
    id, order, title,
    status: "completed" | "active" | "locked",
    exerciseCount, xpReward, estimatedMinutes
  }],
  progress: { completed, total, percentage }
}
```

### Response Format - Lesson Detail

```typescript
{
  id, order, title, content, summary, xpReward,
  chapter: { chapterId, title },
  exercises: [{
    id, order, type, difficulty, question, data, hints, xpReward
  }],
  totalExercises, estimatedMinutes
}
```

## ⚠️ GOTCHAS

1. **Only published lessons**: Query filters by `isPublished: true`
2. **Linear progression**: Lessons unlock sequentially, no skipping
3. **Estimated time**: Calculated as `max(3, exercises.length + 2)` minutes

## 📁 STRUCTURE

```
micro-lessons/
├── _AI.md                    # This file
├── [chapterId]/route.ts      # List lessons for chapter
└── lesson/
    └── [lessonId]/route.ts   # Get lesson detail
```

## 🔄 RELATED

- `/api/exercises/[id]/answer` - Submit exercise answers
- `src/components/learning/exercise/` - Exercise UI components
- `prisma/schema.prisma` - MicroLesson, Exercise models

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: [chapterId]/route.ts -->
