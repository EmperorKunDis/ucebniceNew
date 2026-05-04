# Deep Analysis - Učebnice Platform

**Analysis Date:** 2025-02-05  
**Codebase:** v1.0.37  
**Total LOC Analyzed:** ~25,000 lines  
**Files Inspected:** 117 TypeScript/TSX

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [Code Quality Analysis](#3-code-quality-analysis)
4. [Security Analysis](#4-security-analysis)
5. [Performance Analysis](#5-performance-analysis)
6. [Database Analysis](#6-database-analysis)
7. [API Analysis](#7-api-analysis)
8. [Frontend Analysis](#8-frontend-analysis)
9. [Issues & Bugs Found](#9-issues--bugs-found)
10. [Technical Debt](#10-technical-debt)
11. [Recommendations](#11-recommendations)
12. [Risk Assessment](#12-risk-assessment)

---

## 1. Executive Summary

### Overall Health: **B+ (85/100)**

Platforma je solidně postavená s dobrými fundamenty. Hlavní silné stránky jsou v architektuře a DevOps. Slabiny jsou v konzistenci kódu a bundle size.

### Quick Stats

| Metric              | Value      | Assessment           |
| ------------------- | ---------- | -------------------- |
| Lines of Code       | ~25,000    | Medium-sized project |
| TypeScript Coverage | 100%       | ✅ Excellent         |
| API Routes          | 25+        | Well-organized       |
| React Components    | 46         | Modular structure    |
| Database Models     | 18         | Comprehensive        |
| Test Coverage       | ~30% (E2E) | ⚠️ Needs unit tests  |

---

## 2. Architecture Deep Dive

### 2.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Pages     │ │  Layouts    │ │ Components  │           │
│  │ (app/*.tsx) │ │(layout.tsx) │ │(components/)│           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │               │               │                   │
│         └───────────────┼───────────────┘                   │
│                         │                                   │
├─────────────────────────┼───────────────────────────────────┤
│                    STATE LAYER                              │
│  ┌─────────────────────┴─────────────────────┐             │
│  │  Zustand Store     │  TanStack Query      │             │
│  │  (user-store.ts)   │  (server state)      │             │
│  └─────────────────────┬─────────────────────┘             │
│                        │                                    │
├────────────────────────┼────────────────────────────────────┤
│                    API LAYER                                │
│  ┌─────────────────────┴─────────────────────┐             │
│  │           Next.js API Routes              │             │
│  │  (/api/auth, /api/chapters, /api/user)    │             │
│  └─────────────────────┬─────────────────────┘             │
│                        │                                    │
├────────────────────────┼────────────────────────────────────┤
│                 BUSINESS LOGIC LAYER                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │   Auth     │ │Gamification│ │ Validation │              │
│  │ (auth.ts)  │ │(.ts)       │ │ (zod)      │              │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘              │
│        │              │              │                      │
│        └──────────────┼──────────────┘                      │
│                       │                                     │
├───────────────────────┼─────────────────────────────────────┤
│                  DATA ACCESS LAYER                          │
│  ┌────────────────────┴────────────────────┐               │
│  │           Prisma ORM Client             │               │
│  │  Connection Pool (20) + Transactions    │               │
│  └────────────────────┬────────────────────┘               │
│                       │                                     │
├───────────────────────┼─────────────────────────────────────┤
│                  INFRASTRUCTURE                             │
│  ┌────────────────────┴────────────────────┐               │
│  │  PostgreSQL │ Upstash Redis │ Sentry    │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Analysis

**Chapter Completion Flow:**

```
User clicks "Dokončit kapitolu"
    │
    ▼
ChapterLayout.handleCompleteChapter()
    │
    ▼
POST /api/progress/complete-chapter
    │
    ├── Rate limit check (applyRateLimit)
    ├── Session validation (getServerSession)
    ├── Zod validation (completeChapterSchema)
    │
    ▼
Prisma Transaction
    │
    ├── Create CompletedChapter record
    ├── Upsert ChapterCompletion (3-star)
    ├── Check achievements
    ├── Award XP
    ├── Update streak
    │
    ▼
Cache Invalidation (fire-and-forget)
    │
    ▼
Return JSON response
    │
    ▼
Client updates UI + Toast notification
```

### 2.3 Component Hierarchy

```
RootLayout (app/layout.tsx)
└── Providers
    ├── ErrorBoundary
    ├── SessionProvider (NextAuth)
    ├── QueryClientProvider (TanStack)
    └── AuthProvider
        └── Page Content
            └── PageLayout
                ├── Navigation (fixed)
                └── Main Content
                    ├── ChapterLayout
                    │   ├── ChapterHeader
                    │   ├── VideoPlayer
                    │   ├── ChapterContent (Markdown)
                    │   ├── QuestionCard[]
                    │   ├── ProjectSubmission
                    │   └── ChapterNavigation
                    │
                    ├── ProfilePage
                    │   └── StatCard[]
                    │
                    └── ArenaPage
                        ├── HackathonCard[]
                        └── GraduateCard[]
```

---

## 3. Code Quality Analysis

### 3.1 TypeScript Configuration

**tsconfig.json Analysis:**

```json
{
  "strict": true, // ✅ Good
  "noUnusedLocals": true, // ✅ Good
  "noUnusedParameters": true, // ✅ Good
  "noImplicitReturns": true, // ✅ Good
  "noUncheckedIndexedAccess": true // ✅ Excellent (rare!)
}
```

**BUT in next.config.js:**

```javascript
typescript: {
  ignoreBuildErrors: true
} // ⚠️ BAD
eslint: {
  ignoreDuringBuilds: true
} // ⚠️ BAD
```

**Impact:** Strict TS config negated by ignoring build errors.

### 3.2 Code Patterns Audit

**✅ Good Patterns Found:**

1. **Consistent API Route Structure**

```typescript
// Every API route follows this pattern:
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return 401

  const validation = await validateAPIRequest(request, schema)
  if (!validation.success) return validation.response

  // Business logic...
  return NextResponse.json({ success: true })
}
```

2. **Zod Validation Schemas**

```typescript
// Comprehensive validation with Czech error messages
export const passwordSchema = z
  .string()
  .min(8, 'Heslo musí mít alespoň 8 znaků')
  .regex(/[A-Z]/, 'Heslo musí obsahovat velké písmeno')
```

3. **Memoization for Performance**

```typescript
// ChapterLayout.tsx
const MemoizedVideoPlayer = memo(VideoPlayer)
const MemoizedChapterContent = memo(ChapterContent)
```

**⚠️ Problematic Patterns Found:**

1. **Inconsistent Session Checking**

```typescript
// Some routes check session.user.id
if (!session?.user?.id) { ... }

// Others check session.user.email
if (!session?.user?.email) { ... }  // ⚠️ Inconsistent
```

2. **Type Assertion Hacks**

```typescript
// auth.ts
adapter: PrismaAdapter(prisma) as any // ⚠️ Hides type mismatch
```

3. **Duplicate BADGES Objects**

```typescript
// lib/gamification.ts
export const BADGES = { ... }  // 24 badges

// lib/constants.ts
export const BADGES = { ... }  // Different 12 badges! ⚠️
```

### 3.3 Code Complexity Metrics

| File                      | Lines | Cyclomatic Complexity | Assessment        |
| ------------------------- | ----- | --------------------- | ----------------- |
| ChapterLayout.tsx         | 450+  | High (many states)    | ⚠️ Needs refactor |
| gamification.ts           | 424   | Medium                | OK                |
| validation-schemas.ts     | 451   | Low (declarative)     | ✅ Good           |
| complete-chapter/route.ts | 290   | Medium                | OK                |

**Recommendation:** Split ChapterLayout into smaller components:

- ChapterProgress (state management)
- ChapterCompletion (completion UI)
- ChapterStars (star display)

---

## 4. Security Analysis

### 4.1 Authentication

**Strengths:**

- ✅ JWT-based sessions (stateless)
- ✅ bcrypt password hashing
- ✅ Rate limiting on auth endpoints (10 attempts / 15 min)
- ✅ PrismaAdapter for user management

**Weaknesses:**

```typescript
// auth.ts - Error messages leak info
if (!user) throw new Error('Uživatel nenalezen') // ⚠️ Reveals user exists
if (!isValid) throw new Error('Neplatné heslo') // ⚠️ Reveals user exists
```

**Fix:**

```typescript
// Use generic error
throw new Error('Neplatné přihlašovací údaje')
```

### 4.2 Authorization

**Admin Check Pattern:**

```typescript
// Correct pattern used in admin routes
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
if (!user?.isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Missing:** RBAC for hackathon judges, team leaders.

### 4.3 Input Validation

**Comprehensive Zod Schemas:**

```typescript
// Chapter ID validation - prevents injection
export const chapterIdSchema = z.string().regex(/^(0[1-9]|[1-3][0-9]|40)$/, 'Neplatné ID kapitoly')
```

**Missing Validation:**

- File upload size limits (profile photo)
- URL validation depth (project URLs)

### 4.4 Rate Limiting

| Endpoint     | Limit    | Assessment |
| ------------ | -------- | ---------- |
| Auth (login) | 10/15min | ✅ Good    |
| Progress     | 100/hour | ✅ Good    |
| API general  | 100/hour | ✅ Good    |
| Achievements | 200/hour | ✅ Good    |
| XP updates   | 50/hour  | ✅ Good    |

**Note:** Rate limiting returns `null` when Redis not configured (dev mode).

---

## 5. Performance Analysis

### 5.1 Bundle Size

**Current State:**

```
Build output: ~565MB
Main contributors:
├── Three.js: ~500KB (gzipped: ~150KB)
├── Framer Motion: ~25KB (gzipped: ~10KB)
├── D3.js: ~200KB (gzipped: ~70KB)
├── react-markdown: ~50KB
└── Next.js runtime: ~100KB
```

**Dynamic Imports Used:**

```typescript
// HomePage - ProfileCard lazy loaded
const ProfileCard = dynamic(() => import('@/components/ui/profile-card'), { ssr: false })
```

**Missing Dynamic Imports:**

- Three.js FluidGlass component
- Certificate generator (uses jspdf + html2canvas)
- D3 skill visualization

### 5.2 Database Query Optimization

**Good:**

```typescript
// Selective field fetching
const user = await prisma.user.findUnique({
  where: { id },
  select: { xp: true, level: true }, // Not select *
})
```

**Potential N+1 Issues:**

```typescript
// user/stats/route.ts
const recentCompletions = await Promise.all(
  recentCompletionsRaw.map(async completion => {
    const chapter = await prisma.chapter.findFirst({...})  // ⚠️ N+1
    return { ...completion, chapterTitle: chapter?.title }
  })
)
```

**Fix:**

```typescript
// Use include instead of separate queries
const completions = await prisma.chapterCompletion.findMany({
  where: { userId },
  include: {
    chapter: { select: { title: true } }, // Single query with join
  },
})
```

### 5.3 Caching Strategy

**Implemented:**

- Redis cache with TTL (5 min default)
- Stale-while-revalidate pattern
- Cache invalidation on mutations

**Cache Keys:**

```typescript
CacheKeys = {
  leaderboard: period => `leaderboard:${period}`,
  userStats: userId => `user:${userId}:stats`,
  chapterProgress: (userId, chapterId) => `user:${userId}:chapter:${chapterId}:progress`,
}
```

---

## 6. Database Analysis

### 6.1 Schema Assessment

**Models Count:** 18 total

- Core: User, Account, Session, VerificationToken (NextAuth)
- Learning: Chapter, CompletedChapter, ChapterCompletion, ChapterProgress
- Gamification: Achievement, UserAchievement, Question, QuestionAnswer
- Projects: ProjectSubmission, ModuleTestAttempt, CognitiveGlitchAttempt
- Arena: Hackathon, Team, TeamMember, HackathonProject, GraduateProfile

### 6.2 Index Coverage

**Well-Indexed:**

```prisma
model User {
  @@index([xp])         // Leaderboard
  @@index([level])      // Filtering
  @@index([email])      // Auth
  @@index([createdAt])  // Analytics
}
```

**Missing Indexes:**

```prisma
// ChapterCompletion - frequently queried but missing compound index
model ChapterCompletion {
  // Should add:
  @@index([userId, completedChapter])  // For progress queries
}
```

### 6.3 Data Integrity Issues

**Dual Completion Tracking:**

```prisma
// OLD system (should deprecate)
model CompletedChapter {
  userId    String
  chapterId String  // References Chapter.id (UUID)
}

// NEW system (primary)
model ChapterCompletion {
  userId    String
  chapterId String  // Stores "01", "02" etc (string ID)
}
```

**Problem:** Different `chapterId` formats between tables.

### 6.4 JSON Fields

```prisma
model Hackathon {
  prizes   Json  // [{place, title, value}]
  judges   Json  // [{name, company, bio}]
  sponsors Json  // ["Sponsor1", "Sponsor2"]
}
```

**Issue:** No GIN indexes for JSON query optimization.

---

## 7. API Analysis

### 7.1 Endpoint Inventory

| Category  | Endpoints | Auth Required                 |
| --------- | --------- | ----------------------------- |
| Auth      | 3         | No (register) / Yes (profile) |
| Chapters  | 4         | Mixed                         |
| Progress  | 2         | Yes                           |
| Questions | 2         | Yes                           |
| Projects  | 1         | Yes                           |
| Tests     | 1         | Yes                           |
| User      | 3         | Yes                           |
| Admin     | 6         | Yes (isAdmin)                 |
| Arena     | 8         | Mixed                         |
| Other     | 3         | No                            |

### 7.2 API Design Quality

**RESTful Compliance:**

- ✅ Proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Consistent response structure
- ⚠️ Some endpoints mix REST with RPC (`/api/progress/complete-chapter`)

**Response Consistency:**

```typescript
// Success responses
{ success: true, data: {...}, xpEarned: 100 }

// Error responses
{ error: 'Error message', details?: {...} }
```

### 7.3 Swagger Documentation

**Partial coverage:**

- `/api/progress/complete-chapter` - Documented ✅
- `/api/user/stats` - Documented ✅
- Most other endpoints - Missing ⚠️

---

## 8. Frontend Analysis

### 8.1 Component Architecture

**Design System:**

- Glass morphism aesthetic
- Custom UI primitives in `components/ui/`
- Consistent use of `cn()` utility

**Component Patterns:**

```typescript
// Good: Compound component pattern
<Stack direction="row" gap={4}>
  <Box className="...">
    <Button variant="primary" />
  </Box>
</Stack>
```

### 8.2 State Management

**Zustand Store:**

```typescript
interface UserState {
  userId
  username
  email
  avatar // Identity
  xp
  level
  streak
  badges // Gamification
  onboardingCompleted // Flow state
}
```

**Issue:** Store duplicates level calculation logic from `lib/gamification.ts`:

```typescript
// store/user-store.ts
const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1

// lib/gamification.ts
export function calculateLevel(xp: number) { ... }  // Same logic duplicated
```

### 8.3 Client-Side Data Fetching

**TanStack Query Config:**

```typescript
{
  staleTime: 60 * 1000,       // 60 seconds
  refetchOnWindowFocus: false  // Good for learning app
}
```

### 8.4 Animations

**Framer Motion Usage:**

- Page transitions
- Section expand/collapse
- Stagger animations on lists

**Performance Impact:** ~25KB bundle addition.

---

## 9. Issues & Bugs Found

### Critical Issues 🔴

1. **Build Errors Ignored**
   - Location: `next.config.js`
   - Impact: Unknown TypeScript errors in production
   - Fix: Remove `ignoreBuildErrors: true`, fix all errors

2. **Duplicate BADGES Objects**
   - Location: `lib/gamification.ts` vs `lib/constants.ts`
   - Impact: Inconsistent achievement system
   - Fix: Single source of truth in `gamification.ts`

### High Priority Issues 🟠

3. **N+1 Query in User Stats**
   - Location: `/api/user/stats/route.ts`
   - Impact: Slow response for users with many completions
   - Fix: Use Prisma includes

4. **Inconsistent Session Checks**
   - Location: Multiple API routes
   - Impact: Potential auth bypass
   - Fix: Standardize on `session?.user?.id`

5. **Chapter ID Format Mismatch**
   - Location: `CompletedChapter` vs `ChapterCompletion`
   - Impact: Data integrity issues
   - Fix: Migrate to consistent format

### Medium Priority Issues 🟡

6. **Missing Error Boundaries**
   - Location: Individual pages
   - Impact: Full page crash on component error
   - Fix: Add error boundaries per route

7. **Hydration Mismatch Risk**
   - Location: `store/user-store.ts`
   - Impact: React hydration warnings
   - Fix: Use `useEffect` for localStorage reads

8. **Profile Photo No Size Limit**
   - Location: `/api/user/profile-image`
   - Impact: Potential storage abuse
   - Fix: Add file size validation

---

## 10. Technical Debt

### Debt Inventory

| Item                           | Effort | Impact | Priority |
| ------------------------------ | ------ | ------ | -------- |
| Remove build error suppression | Medium | High   | P1       |
| Consolidate BADGES             | Low    | Medium | P1       |
| Fix N+1 queries                | Medium | High   | P1       |
| Add unit tests                 | High   | High   | P2       |
| Deprecate CompletedChapter     | Medium | Medium | P2       |
| Dynamic import Three.js        | Low    | Medium | P2       |
| Add Swagger docs               | Medium | Low    | P3       |
| Implement RBAC                 | High   | Medium | P3       |

### Debt Ratio

```
Technical Debt Score: 6/10 (Moderate)

Areas:
├── Code Quality: 7/10 (Good, some inconsistencies)
├── Testing: 4/10 (Needs work)
├── Documentation: 6/10 (Improved with _AI.md)
├── Architecture: 8/10 (Solid)
└── Performance: 6/10 (Bundle size concerns)
```

---

## 11. Recommendations

### Immediate (This Week)

1. **Fix TypeScript Build**

   ```javascript
   // next.config.js - REMOVE:
   typescript: {
     ignoreBuildErrors: true
   }
   eslint: {
     ignoreDuringBuilds: true
   }
   ```

   Then fix all errors that surface.

2. **Consolidate BADGES**

   ```typescript
   // Delete BADGES from constants.ts
   // Use only lib/gamification.ts as source
   ```

3. **Standardize Session Checks**
   ```typescript
   // Create helper:
   export function requireAuth(session: Session | null) {
     if (!session?.user?.id) {
       throw new AuthError('Unauthorized')
     }
     return session.user
   }
   ```

### Short-term (This Month)

4. **Fix N+1 Queries**

   ```typescript
   // Use includes instead of sequential queries
   const completions = await prisma.chapterCompletion.findMany({
     include: { chapter: { select: { title: true } } },
   })
   ```

5. **Add Unit Tests for lib/**

   ```bash
   # Priority files:
   src/lib/gamification.ts
   src/lib/achievement-checker.ts
   src/lib/validation-schemas.ts
   ```

6. **Dynamic Import Heavy Components**
   ```typescript
   const FluidGlass = dynamic(() => import('@/components/ui/fluid-glass'), { ssr: false })
   ```

### Medium-term (This Quarter)

7. **Deprecate Old Completion System**
   - Create migration to move all CompletedChapter → ChapterCompletion
   - Update all references
   - Drop CompletedChapter table

8. **Implement Proper RBAC**

   ```prisma
   enum Role {
     USER
     JUDGE
     TEAM_LEADER
     ADMIN
   }

   model User {
     role Role @default(USER)
   }
   ```

9. **Add Performance Monitoring**
   - Web Vitals tracking
   - API response time logging
   - Database query timing

---

## 12. Risk Assessment

### Business Risks

| Risk                    | Probability | Impact   | Mitigation           |
| ----------------------- | ----------- | -------- | -------------------- |
| Data loss (DB)          | Low         | Critical | Regular backups, PVC |
| Auth bypass             | Low         | Critical | Security audit       |
| Performance degradation | Medium      | High     | Monitoring, caching  |
| User frustration (bugs) | Medium      | Medium   | E2E tests            |

### Technical Risks

| Risk                  | Probability | Impact | Mitigation            |
| --------------------- | ----------- | ------ | --------------------- |
| Bundle size explosion | High        | Medium | Dynamic imports       |
| Type errors in prod   | Medium      | High   | Remove TS suppression |
| Cache inconsistency   | Low         | Medium | TTL + invalidation    |
| Rate limit bypass     | Low         | Medium | Redis monitoring      |

### Operational Risks

| Risk                   | Probability | Impact | Mitigation           |
| ---------------------- | ----------- | ------ | -------------------- |
| K8s deployment failure | Low         | High   | ArgoCD rollback      |
| Video storage full     | Medium      | Medium | PVC monitoring       |
| Redis downtime         | Low         | Low    | Graceful degradation |

---

## Summary

Učebnice je **solidní platforma s dobrými fundamenty**. Architektura je čistá, DevOps setup je profesionální, a gamifikační systém je komplexní.

**Top 3 věci k okamžité opravě:**

1. Odstranit `ignoreBuildErrors` a opravit TS chyby
2. Sjednotit BADGES do jednoho místa
3. Opravit N+1 queries v user stats

**Celkové hodnocení:** Platforma je production-ready, ale potřebuje údržbu technického dluhu před dalším škálováním.

---

_Analysis by Bobby. Bez bullshitu, jenom fakta._ 🔥
