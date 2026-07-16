# src/app/api/micro-lessons/ - AI Context

## 🎯 PURPOSE

API endpoints for the micro-lesson system - short, focused learning units within chapters.

## 📦 EXPORTS (API Routes)

| Route                                           | Methods | Purpose                              |
| ----------------------------------------------- | ------- | ------------------------------------ |
| `/api/micro-lessons/[chapterId]`                | GET     | List all micro-lessons in a chapter  |
| `/api/micro-lessons/lesson/[lessonId]`          | GET     | Get a specific lesson with exercises |
| `/api/micro-lessons/lesson/[lessonId]/complete` | POST    | Complete lesson content              |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Canonical database content and progress reads
- `@/lib/exercise-contract` - Removes private answer keys
- `@/lib/learning-service` - Transactional lesson completion and reward dedupe

## 🏗️ PATTERNS

### Progress and ids

```typescript
public URL slug "01" -> Chapter.chapterId
canonical progress key -> Chapter.id
lesson completion -> MicroLessonProgress(userId, microLessonId)
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
  chapter: { chapterId, title }, content,
  videoFile, notebookLmUrl, colabUrl,
  projectTitle, projectDescription, projectRequirements,
  exercises: [{
    id, order, type, difficulty, question, data, hints, xpReward
  }],
  totalExercises, estimatedMinutes
}
```

## ⚠️ GOTCHAS

1. **Only published lessons**: Query filters by `isPublished: true`.
2. **Canonical unlock**: A chapter unlocks only after the previous chapter has `contentCompleted`.
3. **Private answer keys**: Every exercise payload passes through `toPublicExerciseData()`; review sessions use the same filter.
4. **Completion replay**: `RewardLedger` grants lesson XP once and preserves the first `completedAt` timestamp.
5. **First star**: All published lessons complete sets `ChapterProgress.contentCompleted` and increments the chapter quest once.

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
