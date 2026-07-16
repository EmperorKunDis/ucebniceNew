# prisma/ - AI Context

## 🎯 PURPOSE

Database schema definition and migrations for PostgreSQL via Prisma ORM. The database is the runtime source of truth for published lesson content and user progress; repository Markdown/manifest files are deterministic import inputs.

## 📦 EXPORTS

Prisma generates types and client in `node_modules/.prisma/client`:

- `PrismaClient` - Database client class
- Model types: `User`, `Chapter`, `Achievement`, etc.

## 🔗 DEPENDENCIES

- `prisma` (dev) - CLI and schema parser
- `@prisma/client` - Generated client
- `@prisma/adapter-pg` - PostgreSQL driver adapter
- `pg` - PostgreSQL connection pool

## 🏗️ PATTERNS

### Schema Organization

```prisma
// 1. Generator & datasource config
generator client { ... }
datasource db { provider = "postgresql" }

// 2. NextAuth required models
model Account { ... }
model Session { ... }
model User { ... }
model VerificationToken { ... }

// 3. Application models
model Chapter { ... }
model CompletedChapter { ... }
model Achievement { ... }

// 4. Arena system models
model Hackathon { ... }
model Team { ... }
model GraduateProfile { ... }
```

### Index Strategy

```prisma
model User {
  // ... fields

  @@index([xp])        // Leaderboard queries
  @@index([level])     // Level filtering
  @@index([email])     // Auth lookups
  @@index([createdAt]) // Time-based queries
}
```

### Relation Patterns

```prisma
// One-to-many with cascade delete
model User {
  completedChapters CompletedChapter[]
}

model CompletedChapter {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

## ⚠️ GOTCHAS

1. **PostgreSQL only**: Using pg adapter, not SQLite (migrated 3 months ago)
2. **Cascade deletes**: Most relations cascade on user deletion
3. **JSON fields**: `prizes`, `judges`, `skills`, etc. use JSON type
4. **Compound unique**: Many models have `@@unique([userId, chapterId])` etc.
5. **Canonical progress**: `ChapterProgress` is the chapter-level source of truth. `CompletedChapter` and `ChapterCompletion` are legacy compatibility projections and must not grant rewards.
6. **Stable content keys**: Imported `MicroLesson.sourceKey` and `Exercise.sourceKey` are nullable only to admit pre-existing DB-only rows; canonical rows always receive deterministic keys.
7. **Reward idempotency**: `RewardLedger` owns the per-user dedupe constraint. Historical lesson, correct-answer, project, milestone, and achievement evidence receives zero-value migration claims that block replay rewards without changing balances.
8. **Migration deploy**: Production uses `prisma migrate deploy`, not `dev`. Never run production migrations without explicit approval.
9. **Historical test mapping**: Release A aggregates legacy module 1/2/3/4 into canonical milestone 10/20/30/40 using the best completed attempt. `ModuleTestAttempt` remains the full audit history; it must not be treated as a `FinalTest` because it has no mandatory final-project evidence.
10. **Historical achievements**: Backfill materializes eligible `UserAchievement` visibility and matching zero-value `ACHIEVEMENT_UNLOCK:*` ledger claims without changing user balances.

## 📁 STRUCTURE

```
prisma/
├── schema.prisma    # Database schema (CRITICAL)
├── migrations/      # Migration history
│   └── YYYYMMDD_*/ # Individual migrations
└── seed.ts         # Idempotent canonical content + quest seed
```

## 🔄 RELATED

- `src/lib/prisma.ts` - Client instantiation
- `src/lib/auth.ts` - Uses PrismaAdapter
- `src/app/api/` - API routes using Prisma

## 📊 MODEL REFERENCE

### Core Models

| Model                    | Purpose                              |
| ------------------------ | ------------------------------------ |
| `User`                   | User account with XP, level, streak  |
| `Account`                | OAuth provider accounts (NextAuth)   |
| `Session`                | User sessions (NextAuth)             |
| `Chapter`                | Chapter metadata                     |
| `ChapterProgress`        | Canonical 3-star chapter progress    |
| `MicroLessonProgress`    | Per-user lesson completion           |
| `ExerciseProgress`       | Aggregated per-user exercise state   |
| `ExerciseAttempt`        | Append-only answer attempt history   |
| `RewardLedger`           | Exactly-once XP/gem reward ledger    |
| `CourseMilestone`        | Tests/certificate milestone metadata |
| `CompletedChapter`       | Legacy compatibility tracking        |
| `ChapterCompletion`      | Legacy compatibility 3-star state    |
| `Achievement`            | Badge definitions                    |
| `UserAchievement`        | User-badge relationships             |
| `Question`               | Quiz questions                       |
| `QuestionAnswer`         | User answers                         |
| `ProjectSubmission`      | Project URLs                         |
| `ModuleTestAttempt`      | Test results                         |
| `CognitiveGlitchAttempt` | Glitch challenge results             |

### Canonical star semantics

- Star 1: `ChapterProgress.contentCompleted`; this unlocks the next chapter.
- Star 2: `ChapterProgress.exercisesCompleted`; all ten canonical exercises are complete.
- Star 3: `ChapterProgress.projectApproved`; the project review was approved.
- A canonical content import must be run before the progress backfill. Neither operation may lower progress or retroactively alter XP, gems, streaks, or claimed rewards.

### AI Review Metadata

`ProjectSubmission` stores provider observability fields for Gemini review:

- `aiReviewModel`
- `aiReviewPromptVersion`
- `aiReviewLatencyMs`
- `aiReviewTokenCount`
- `aiReviewFailureReason`
- `aiManualReviewRequired`
- `aiSafetyStatus`

Provider fallback/manual review must not grant XP, gems, or project completion.

### Arena Models

| Model              | Purpose            |
| ------------------ | ------------------ |
| `Hackathon`        | Competition events |
| `Team`             | Hackathon teams    |
| `TeamMember`       | Team membership    |
| `HackathonProject` | Submitted projects |
| `GraduateProfile`  | Alumni profiles    |

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: schema.prisma -->
