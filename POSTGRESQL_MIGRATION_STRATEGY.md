# PostgreSQL Migration Strategy

## Executive Summary

This document outlines the complete strategy for migrating from SQLite to PostgreSQL for production deployment. PostgreSQL is essential for scalability, performance, and production-grade features.

**Migration Timeline:** 2-3 weeks
**Risk Level:** Medium
**Priority:** High (Critical for production)

---

## Table of Contents

1. [Why PostgreSQL](#why-postgresql)
2. [Migration Options](#migration-options)
3. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
4. [Schema Changes Required](#schema-changes-required)
5. [Data Migration Strategy](#data-migration-strategy)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Plan](#rollback-plan)
8. [Post-Migration Optimizations](#post-migration-optimizations)
9. [Cost Analysis](#cost-analysis)
10. [Timeline & Milestones](#timeline--milestones)

---

## Why PostgreSQL

### Critical Limitations of SQLite in Production

1. **Concurrency Issues**
   - SQLite locks the entire database on writes
   - No connection pooling support
   - Poor performance with >100 concurrent users
   - Risk of database corruption under high load

2. **Missing Features**
   - No full-text search (needed for future features)
   - Limited JSON operations
   - No built-in replication
   - No point-in-time recovery

3. **Scalability Concerns**
   - Single file = single point of failure
   - No horizontal scaling
   - Limited to single server
   - Performance degrades with data growth

### PostgreSQL Advantages

✅ **Excellent concurrency** with MVCC (Multi-Version Concurrency Control)
✅ **Advanced indexing** (GiST, GIN, BRIN, partial indexes)
✅ **Full-text search** built-in
✅ **JSON/JSONB** support for flexible data
✅ **Point-in-time recovery** and replication
✅ **Connection pooling** with PgBouncer
✅ **Horizontal scaling** with read replicas
✅ **Cloud-native** with managed services

---

## Migration Options

### Option 1: Neon (Recommended) ⭐

**Pros:**

- Serverless PostgreSQL (pay per use)
- Instant branching for development
- Auto-scaling compute
- Generous free tier (10GB)
- Built-in connection pooling
- Vercel integration

**Cons:**

- Relatively new service
- Less established than AWS/GCP

**Cost:** Free tier → $19/month (Pro) → $69/month (Scale)

### Option 2: Supabase

**Pros:**

- Full PostgreSQL database
- Built-in Auth, Storage, Realtime
- Good free tier (500MB)
- Excellent dashboard
- Strong community

**Cons:**

- More features than needed
- Tied to Supabase ecosystem

**Cost:** Free tier → $25/month (Pro)

### Option 3: Railway

**Pros:**

- Simple deployment
- Good developer experience
- Integrated with Git
- Automatic backups

**Cons:**

- Smaller free tier
- Less features than alternatives

**Cost:** $5/month minimum

### Option 4: Vercel Postgres (Powered by Neon)

**Pros:**

- Native Vercel integration
- Same infrastructure as Neon
- Unified billing

**Cons:**

- Requires Vercel Pro ($20/month)
- More expensive long-term

**Cost:** $0.20/GB-month + compute

### Recommendation: **Neon**

Best balance of features, cost, and reliability.

---

## Step-by-Step Migration Plan

### Phase 1: Preparation (Week 1)

#### 1.1 Set Up PostgreSQL Instance

```bash
# Sign up for Neon at https://neon.tech
# Create a new project
# Get connection string from dashboard

# Example connection string:
postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
```

#### 1.2 Update Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# For local development with Docker
DATABASE_URL_LOCAL="postgresql://postgres:postgres@localhost:5432/ucebnice_dev"
```

#### 1.3 Install PostgreSQL Locally (Optional for Dev)

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Or use Docker
docker run -d \
  --name ucebnice-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ucebnice_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

### Phase 2: Schema Migration (Week 1-2)

#### 2.1 Update Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  // Before
  // provider = "sqlite"

  // After
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  // Add for better performance
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}
```

#### 2.2 Schema Adjustments for PostgreSQL

Key changes needed:

1. **Replace @default(cuid()) with UUID**

```prisma
model User {
  // Before (SQLite)
  id String @id @default(cuid())

  // After (PostgreSQL) - Better performance
  id String @id @default(uuid())
}
```

2. **Add Database Extensions**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [uuid_ossp, pg_trgm] // For UUID and full-text search
}
```

3. **Optimize Text Fields**

```prisma
model Lesson {
  description String? @db.Text  // Use TEXT for long content
  title       String  @db.VarChar(255)  // VARCHAR for short text
}
```

#### 2.3 Generate Migration

```bash
# Create migration
npx prisma migrate dev --name postgresql_migration

# This will:
# 1. Generate SQL migration file
# 2. Apply to your database
# 3. Regenerate Prisma Client
```

### Phase 3: Data Migration (Week 2)

#### 3.1 Export Data from SQLite

Create migration script:

```typescript
// scripts/export-sqlite-data.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db', // SQLite database
    },
  },
})

async function exportData() {
  // Export all tables
  const users = await prisma.user.findMany({
    include: {
      completedLessons: true,
      achievements: true,
      chapterCompletions: true,
      questionAnswers: true,
      projectSubmissions: true,
      moduleTestAttempts: true,
    },
  })

  const lessons = await prisma.lesson.findMany()
  const achievements = await prisma.achievement.findMany()

  // Save to JSON
  fs.writeFileSync(
    'migration-data.json',
    JSON.stringify(
      {
        users,
        lessons,
        achievements,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
  )

  console.log('✅ Data exported successfully')
  await prisma.$disconnect()
}

exportData().catch(console.error)
```

#### 3.2 Import Data to PostgreSQL

```typescript
// scripts/import-postgres-data.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // PostgreSQL
    },
  },
})

async function importData() {
  const data = JSON.parse(fs.readFileSync('migration-data.json', 'utf-8'))

  await prisma.$transaction(async tx => {
    // Import in order (respecting foreign keys)

    // 1. Lessons (no dependencies)
    for (const lesson of data.lessons) {
      await tx.lesson.upsert({
        where: { id: lesson.id },
        create: lesson,
        update: lesson,
      })
    }

    // 2. Achievements
    for (const achievement of data.achievements) {
      await tx.achievement.upsert({
        where: { id: achievement.id },
        create: achievement,
        update: achievement,
      })
    }

    // 3. Users (with all relations)
    for (const user of data.users) {
      const {
        completedLessons,
        achievements,
        chapterCompletions,
        questionAnswers,
        projectSubmissions,
        moduleTestAttempts,
        ...userData
      } = user

      // Create user
      await tx.user.upsert({
        where: { id: userData.id },
        create: userData,
        update: userData,
      })

      // Create relations
      for (const cl of completedLessons || []) {
        await tx.completedLesson.create({ data: cl })
      }

      for (const ua of achievements || []) {
        await tx.userAchievement.create({ data: ua })
      }

      // ... similar for other relations
    }
  })

  console.log('✅ Data imported successfully')
  await prisma.$disconnect()
}

importData().catch(console.error)
```

#### 3.3 Verify Data Integrity

```typescript
// scripts/verify-migration.ts
import { PrismaClient } from '@prisma/client'

const sqlitePrisma = new PrismaClient({ datasources: { db: { url: 'file:./prisma/dev.db' } } })
const postgresPrisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })

async function verify() {
  // Count records in both databases
  const checks = [
    {
      table: 'user',
      sqlite: await sqlitePrisma.user.count(),
      postgres: await postgresPrisma.user.count(),
    },
    {
      table: 'lesson',
      sqlite: await sqlitePrisma.lesson.count(),
      postgres: await postgresPrisma.lesson.count(),
    },
    {
      table: 'achievement',
      sqlite: await sqlitePrisma.achievement.count(),
      postgres: await postgresPrisma.achievement.count(),
    },
    // ... more tables
  ]

  console.table(checks)

  const allMatch = checks.every(c => c.sqlite === c.postgres)

  if (allMatch) {
    console.log('✅ All data migrated successfully!')
  } else {
    console.error('❌ Data mismatch detected!')
    process.exit(1)
  }

  await sqlitePrisma.$disconnect()
  await postgresPrisma.$disconnect()
}

verify().catch(console.error)
```

### Phase 4: Testing (Week 2-3)

#### 4.1 Test Checklist

- [ ] User authentication works
- [ ] Chapter completion updates correctly
- [ ] XP and leveling calculations accurate
- [ ] Leaderboard displays correctly
- [ ] Achievements unlock properly
- [ ] Question answering works
- [ ] Project submissions save
- [ ] Module tests function
- [ ] Concurrent user testing (50+ users)
- [ ] Load testing (100+ req/s)

#### 4.2 Performance Testing

```bash
# Install k6 for load testing
brew install k6

# Run load test
k6 run scripts/load-test.js
```

```javascript
// scripts/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50, // 50 virtual users
  duration: '5m',
}

export default function () {
  // Test leaderboard endpoint
  const res = http.get('https://your-app.vercel.app/api/leaderboard')

  check(res, {
    'status is 200': r => r.status === 200,
    'response time < 500ms': r => r.timings.duration < 500,
  })

  sleep(1)
}
```

### Phase 5: Deployment (Week 3)

#### 5.1 Staging Deployment

```bash
# Create Vercel preview deployment
vercel --env DATABASE_URL="postgresql://..."

# Run smoke tests
npm run test:e2e
```

#### 5.2 Production Deployment

```bash
# Update production environment variable
vercel env add DATABASE_URL production

# Deploy to production
vercel --prod

# Monitor for 24 hours
```

#### 5.3 Monitoring Setup

Add to your monitoring:

```typescript
// Monitor database connections
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
})

prisma.$on('query', e => {
  if (e.duration > 1000) {
    console.warn('Slow query detected:', e.query, e.duration, 'ms')
  }
})
```

---

## Schema Changes Required

### Complete Updated Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [uuid_ossp, pg_trgm]
}

model User {
  id            String   @id @default(uuid()) @db.Uuid
  email         String?  @unique @db.VarChar(255)
  emailVerified DateTime? @db.Timestamptz
  name          String?  @db.VarChar(100)
  image         String?  @db.Text
  password      String?  @db.VarChar(255)
  username      String?  @unique @db.VarChar(50)

  xp            Int      @default(0)
  level         Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)

  createdAt     DateTime @default(now()) @db.Timestamptz
  updatedAt     DateTime @updatedAt @db.Timestamptz

  accounts              Account[]
  sessions              Session[]
  completedLessons      CompletedLesson[]
  achievements          UserAchievement[]
  lessonProgress        LessonProgress[]
  cognitiveGlitches     CognitiveGlitchAttempt[]
  chapterCompletions    ChapterCompletion[]
  questionAnswers       QuestionAnswer[]
  projectSubmissions    ProjectSubmission[]
  moduleTestAttempts    ModuleTestAttempt[]

  @@index([xp])
  @@index([level])
  @@index([email])
  @@index([username])
}

model Lesson {
  id          String   @id @default(uuid()) @db.Uuid
  chapterId   String   @db.VarChar(20)
  title       String   @db.VarChar(255)
  description String?  @db.Text
  xpReward    Int      @default(100)
  difficulty  String   @db.VarChar(20)
  order       Int

  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz

  completedBy CompletedLesson[]
  progress    LessonProgress[]

  @@index([chapterId])
  @@index([difficulty])
  @@index([order])
}

// ... rest of models with similar optimizations
```

---

## Rollback Plan

### If Migration Fails

#### Option 1: Immediate Rollback (< 1 hour after deploy)

```bash
# Revert environment variable
vercel env rm DATABASE_URL production

# Restore SQLite connection
vercel env add DATABASE_URL production
# Value: file:./prisma/dev.db

# Redeploy previous version
vercel rollback
```

#### Option 2: Data Recovery (> 1 hour after deploy)

```bash
# Restore from PostgreSQL backup
pg_restore -d ucebnice_prod backup.dump

# Or restore from Neon point-in-time recovery
# (Available in Neon dashboard)
```

#### Option 3: Dual-Database Period

Run both databases in parallel for 1 week:

- PostgreSQL: Primary (write + read)
- SQLite: Backup (read-only, sync every hour)

---

## Post-Migration Optimizations

### 1. Add PostgreSQL-Specific Indexes

```sql
-- Full-text search on lessons
CREATE INDEX lesson_title_fts ON "Lesson" USING gin(to_tsvector('english', title));

-- Partial index for active users
CREATE INDEX active_users_idx ON "User" (xp) WHERE xp > 0;

-- Composite index for leaderboard
CREATE INDEX leaderboard_idx ON "User" (xp DESC, level DESC, "currentStreak" DESC);
```

### 2. Enable Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
}).$extends({
  client: {
    $pool: pool,
  },
})
```

### 3. Set Up Read Replicas (Optional for High Traffic)

```typescript
// lib/prisma-read.ts
export const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL,
    },
  },
})

// Use for read-heavy operations
const leaderboard = await prismaRead.user.findMany({
  orderBy: { xp: 'desc' },
  take: 100,
})
```

---

## Cost Analysis

### Current (SQLite)

- **Cost:** $0/month
- **Limits:** Single file, single server, no redundancy
- **Risk:** Data loss, poor performance, no scalability

### Neon Free Tier

- **Storage:** 10GB (enough for ~1M users)
- **Compute:** 100 hours/month
- **Branches:** 10 (for dev/staging)
- **Cost:** $0/month
- **Limits:** Shared compute, basic support

### Neon Pro ($19/month)

- **Storage:** 100GB
- **Compute:** Unlimited, auto-scaling
- **Branches:** Unlimited
- **Backups:** 30 days retention
- **Support:** Email support
- **Recommended for:** 1K-10K users

### Neon Scale ($69/month)

- **Storage:** 1TB
- **Compute:** Dedicated, auto-scaling
- **Branches:** Unlimited
- **Backups:** Point-in-time recovery
- **Support:** Priority support
- **Recommended for:** 10K+ users

---

## Timeline & Milestones

### Week 1: Preparation & Setup

- **Day 1-2:** Sign up for Neon, update schema
- **Day 3-4:** Test migrations locally
- **Day 5-7:** Create migration scripts

### Week 2: Migration & Testing

- **Day 8-9:** Export SQLite data
- **Day 10-11:** Import to PostgreSQL
- **Day 12-14:** Comprehensive testing

### Week 3: Deployment

- **Day 15-16:** Staging deployment
- **Day 17-18:** Production deployment
- **Day 19-21:** Monitoring & optimization

---

## Success Criteria

✅ All data migrated without loss
✅ Zero downtime during migration
✅ API response times < 200ms (p95)
✅ Support for 100+ concurrent users
✅ Automated backups configured
✅ Monitoring & alerting in place
✅ Documentation updated
✅ Team trained on new setup

---

## Next Steps

1. **Approve this migration plan**
2. **Create Neon account**
3. **Schedule migration window**
4. **Execute Phase 1**
5. **Regular status updates**

---

_Document Version: 1.0_
_Last Updated: October 26, 2025_
_Author: Claude Code AI_
