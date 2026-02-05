# prisma/ - AI Context

## 🎯 PURPOSE
Database schema definition and migrations for PostgreSQL via Prisma ORM. This is the single source of truth for data structure.

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
5. **Two chapter tracking systems**: `CompletedChapter` (legacy) + `ChapterCompletion` (3-star)
6. **Migration deploy**: Production uses `prisma migrate deploy`, not `dev`

## 📁 STRUCTURE
```
prisma/
├── schema.prisma    # Database schema (CRITICAL)
├── migrations/      # Migration history
│   └── YYYYMMDD_*/ # Individual migrations
└── seed.ts         # Database seeding script
```

## 🔄 RELATED
- `src/lib/prisma.ts` - Client instantiation
- `src/lib/auth.ts` - Uses PrismaAdapter
- `src/app/api/` - API routes using Prisma

## 📊 MODEL REFERENCE

### Core Models
| Model | Purpose |
|-------|---------|
| `User` | User account with XP, level, streak |
| `Account` | OAuth provider accounts (NextAuth) |
| `Session` | User sessions (NextAuth) |
| `Chapter` | Chapter metadata |
| `CompletedChapter` | Legacy completion tracking |
| `ChapterCompletion` | 3-star completion system |
| `Achievement` | Badge definitions |
| `UserAchievement` | User-badge relationships |
| `Question` | Quiz questions |
| `QuestionAnswer` | User answers |
| `ProjectSubmission` | Project URLs |
| `ModuleTestAttempt` | Test results |
| `CognitiveGlitchAttempt` | Glitch challenge results |

### Arena Models
| Model | Purpose |
|-------|---------|
| `Hackathon` | Competition events |
| `Team` | Hackathon teams |
| `TeamMember` | Team membership |
| `HackathonProject` | Submitted projects |
| `GraduateProfile` | Alumni profiles |

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: schema.prisma -->
