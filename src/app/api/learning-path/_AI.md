# src/app/api/learning-path/ - AI Context

## 🎯 PURPOSE

Provides skill tree data for the Duolingo-style learning path visualization. Returns nodes, edges, modules, and user progress.

## 📦 EXPORTS (API Routes)

| Route                | Methods | Purpose                                 |
| -------------------- | ------- | --------------------------------------- |
| `/api/learning-path` | GET     | Full skill tree data with user progress |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Node Status Calculation

```typescript
// Status determination
if (completion?.completedChapter) → "completed"
else if (index === firstIncompleteIndex) → "active"
else if (index < firstIncompleteIndex) → "active" // Previous incomplete
else → "locked"
```

### Snake Pattern Positioning

```typescript
const CONTAINER_WIDTH = 400
const CENTER_X = 200
const HORIZONTAL_OFFSET = 80
const VERTICAL_GAP = 120

// 5-position repeating pattern
const xPositions = [
  CENTER_X, // 0: center
  CENTER_X - HORIZONTAL_OFFSET, // 1: left
  CENTER_X - HORIZONTAL_OFFSET * 1.5, // 2: far-left
  CENTER_X + HORIZONTAL_OFFSET, // 3: right
  CENTER_X + HORIZONTAL_OFFSET * 1.5, // 4: far-right
]
```

### Response Structure

```typescript
{
  success: true,
  data: {
    nodes: SkillNodeData[],  // 40 chapters
    edges: { from, to }[],   // Connections
    modules: Module[],       // 8 modules
    userProgress: {
      totalCompleted,
      totalChapters,
      currentChapter,
      totalStars,
      maxStars,
      percentage
    }
  }
}
```

### Stars Calculation

```typescript
let stars = 0
if (completion?.completedChapter) stars++ // ⭐ Chapter done
if (completion?.answeredQuestions) stars++ // ⭐ Quiz done
if (completion?.submittedProject) stars++ // ⭐ Project submitted
```

## ⚠️ GOTCHAS

1. **Checkpoint gaps**: Module transitions add extra vertical spacing
2. **Module names**: Hardcoded array, should match DB modules
3. **Review cards**: Concept-based review counts prepared but not yet populated
4. **Prerequisites**: Linear (each chapter requires previous)

## 📁 STRUCTURE

```
learning-path/
├── _AI.md              # This file
└── route.ts            # GET learning path data
```

## 🔄 RELATED

- `src/components/learning/skill-tree/` - UI components
- `/app/dashboard/page.tsx` - Renders skill tree
- `prisma/schema.prisma` - Chapter, ChapterCompletion models

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: route.ts -->
