# Učebnice Codebase - AI Navigation Index

> **Last Updated:** 2026-02-08
> **Codebase Version:** v2.0 VPS Docker Compose migration (uncommitted)
> **Total Files:** ~230+ TypeScript/TSX files (62 API routes, 75 components, 42 pages)
> **Lines of Code:** ~58,000+
> **Build Status:** pending local verification after v2.0 migration
> **TS Errors:** 0 ✅
> **Changed Files:** v2.0 production infra, CI, hooks, AI readiness

## v2.0 Production Direction (June 2026)

- Active production target: VPS + Docker Compose.
- Runtime services: Next.js app, PostgreSQL 16, Caddy reverse proxy/SSL, persistent media volume.
- Deployment entry points: `docker-compose.yml`, `docker-compose.prod.yml`, `Makefile`, `scripts/deploy-vps.sh`.
- CI gates: format check, type check, lint, unit tests, build, Compose config validation.
- Security gates: npm audit high/critical, dependency review, CodeQL, Gitleaks, OpenSSF Scorecard.
- AI readiness: no model training/MLOps pipeline; existing AI Tutor and Gemini review record provider metadata and fall back to manual review.

### Recent Fixes (2026-02-08)

- ✅ Removed duplicate `/certificate` route (kept `/(main)/certificate/`, deleted `/certificate/`)
- ✅ Fixed `/verify-email` missing Suspense boundary for `useSearchParams()`
- ✅ **Hydration fix**: Added `useUserStoreHydrated` hook in `store/user-store.ts`
- ✅ **ChapterLayout refactor**: Split into hooks (`hooks/useChapterProgress.ts`, `hooks/useChapterQuestions.ts`) + smaller components
- ✅ **Chapter ID mismatch**: Consolidated API routes to use `ChapterCompletion` model, created migration script (`scripts/migrate-chapter-completions.ts`)
- ✅ **GlassSurface hydration fix**: SVG filter detection now deferred to client via `useState` to prevent className mismatch

### Key \_AI.md Updates (2026-02-08)

- `src/components/chapters/_AI.md` — Added hooks documentation
- `src/store/_AI.md` — Added hydration fix documentation
- `src/components/ui/_AI.md` — Added glass-surface fix documentation

## 🚀 Duolingo Transformation Status (Feb 2026)

### Branch: `feature/duolingo-transformation`

⚠️ **DO NOT COMMIT OR PUSH** (Martin's explicit rule)

### Phase Progress

| Phase                   | Status  | Notes                                              |
| ----------------------- | ------- | -------------------------------------------------- |
| Phase 1: Critical Fixes | ✅ Done | 0 TS errors in src/                                |
| Phase 2: Tech Debt      | ✅ Done | Unit tests, DB indexes, validation                 |
| Phase 3: Duolingo Core  | ✅ Done | All 7 features implemented                         |
| Phase 4: Advanced       | ✅ Done | Leagues, Quests, Social, AI Tutor, RBAC, Analytics |

### Phase 3 Detailed Progress

| Feature               | Status  | Files Created                                              |
| --------------------- | ------- | ---------------------------------------------------------- |
| 3.1 Skill Tree        | ✅ Done | SkillTreeContainer, SkillNode, SkillPath, SkillCheckpoint  |
| 3.2 Enhanced Streak   | ✅ Done | streak-manager.ts, StreakDisplay, StreakCalendar           |
| 3.3 XP Shop           | ✅ Done | /api/shop/\*, ShopPage                                     |
| 3.4 Micro-lessons     | ✅ Done | ExercisePlayer, 5 exercise types, API endpoints            |
| 3.5 Spaced Repetition | ✅ Done | /api/review/\*, SM-2 algorithm                             |
| 3.6 Hearts/Lives      | ✅ Done | /api/user/hearts/\*, HeartDisplay, HeartRefillModal        |
| 3.7 Celebrations      | ✅ Done | Confetti, LevelUpModal, XPGainAnimation, AchievementUnlock |

### Phase 4 Detailed Progress

| Feature            | Status  | Files Created                    |
| ------------------ | ------- | -------------------------------- |
| 4.1 Leagues        | ✅ Done | /api/leagues/\*, LeaguesPage     |
| 4.2 Quests         | ✅ Done | /api/quests/\*, QuestsPage       |
| 4.3 Social/Friends | ✅ Done | /api/friends/\*, FriendsPage     |
| 4.4 AI Tutor       | ✅ Done | /api/ai-tutor/\*, AITutorPage    |
| 4.5 RBAC           | ✅ Done | src/lib/rbac.ts                  |
| 4.6 Notifications  | ✅ Done | /api/notifications/\*            |
| 4.7 Analytics      | ✅ Done | /api/analytics/event, /dashboard |

### New API Endpoints (24 new endpoints)

| Endpoint                         | Purpose                  |
| -------------------------------- | ------------------------ |
| `/api/learning-path`             | Skill tree data          |
| `/api/user/hearts`               | Hearts system (GET/POST) |
| `/api/user/hearts/refill`        | Refill hearts            |
| `/api/user/streak-history`       | Streak calendar          |
| `/api/shop`                      | Shop items list          |
| `/api/shop/purchase`             | Purchase items           |
| `/api/quests`                    | Daily/weekly quests      |
| `/api/quests/claim`              | Claim quest rewards      |
| `/api/micro-lessons/[chapterId]` | Chapter lessons          |
| `/api/micro-lessons/lesson/[id]` | Lesson detail            |
| `/api/exercises/[id]/answer`     | Submit answer            |
| `/api/review/session`            | Due review cards         |
| `/api/review/answer`             | SM-2 rating              |
| `/api/leagues/current`           | League status            |
| `/api/leagues/leaderboard`       | Rankings                 |
| `/api/notifications`             | List notifications       |
| `/api/notifications/read`        | Mark as read             |
| `/api/friends`                   | Friends list             |
| `/api/friends/request`           | Send request             |
| `/api/friends/respond`           | Accept/reject            |
| `/api/ai-tutor/chat`             | AI chat message          |
| `/api/ai-tutor/history`          | Chat history             |
| `/api/analytics/event`           | Track event              |
| `/api/analytics/dashboard`       | Admin stats              |

### New Component Folders

| Path                                    | Components                                                 |
| --------------------------------------- | ---------------------------------------------------------- |
| `components/learning/skill-tree/`       | SkillTreeContainer, SkillNode, SkillPath, SkillCheckpoint  |
| `components/learning/exercise/`         | ExercisePlayer + 5 exercise types                          |
| `components/gamification/hearts/`       | HeartDisplay, HeartRefillModal, useHearts                  |
| `components/gamification/streak/`       | StreakDisplay, StreakCalendar                              |
| `components/gamification/celebrations/` | Confetti, LevelUpModal, XPGainAnimation, AchievementUnlock |
| `components/gamification/xp/`           | XPCounter, XPProgressBar, LevelBadge                       |

### New Pages

| Path                                          | Purpose                   |
| --------------------------------------------- | ------------------------- |
| `/dashboard`                                  | Skill tree view           |
| `/(main)/shop`                                | Gem shop                  |
| `/(main)/leagues`                             | Weekly leagues            |
| `/(main)/quests`                              | Daily/weekly quests       |
| `/(main)/friends`                             | Friend management         |
| `/(main)/ai-tutor`                            | AI chat tutor             |
| `/(main)/review`                              | Spaced repetition session |
| `/(main)/profile`                             | User profile & stats      |
| `/(main)/settings`                            | User preferences          |
| `/(main)/notifications`                       | Notification center       |
| `/(main)/learn`                               | Redirect to dashboard     |
| `/(main)/learn/[chapterId]`                   | Chapter overview          |
| `/(main)/learn/[chapterId]/lesson/[lessonId]` | Lesson player             |
| `/(main)/learn/[chapterId]/practice`          | Practice exercises        |

### New Layout Components

| Component       | Purpose                               |
| --------------- | ------------------------------------- |
| `MainLayout`    | Full page wrapper (sidebar + topbar)  |
| `Sidebar`       | Collapsible navigation                |
| `Topbar`        | Header with hearts, XP, notifications |
| `ErrorBoundary` | Error catching with analytics         |

### New Review Components

| Component        | Purpose                  |
| ---------------- | ------------------------ |
| `ReviewSession`  | Session controller       |
| `ReviewCard`     | Flashcard UI with rating |
| `ReviewComplete` | Completion screen        |

### New Gems Components

| Component    | Purpose                   |
| ------------ | ------------------------- |
| `GemDisplay` | Shows gem count with icon |
| `useGems`    | Hook for gems state       |

### New Libraries

| File                    | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `lib/streak-manager.ts` | Streak logic, freeze handling, milestones |
| `lib/quest-tracker.ts`  | Quest progress, claiming, reset           |

---

## Quick Reference

| Task               | Target Path                                    | Critical Files                                 |
| ------------------ | ---------------------------------------------- | ---------------------------------------------- |
| New API route      | `src/app/api/`                                 | `src/lib/api-middleware.ts`, `src/lib/auth.ts` |
| UI component       | `src/components/ui/`                           | `src/lib/utils.ts`                             |
| Learning component | `src/components/learning/`                     | Exercise types, skill tree                     |
| Gamification       | `src/components/gamification/`                 | Hearts, streak, celebrations                   |
| Database changes   | `prisma/`                                      | `src/lib/prisma.ts`                            |
| Auth changes       | `src/app/api/auth/`                            | `src/lib/auth.ts`                              |
| VPS deployment     | `docker-compose*.yml`, `scripts/deploy-vps.sh` | `docs/VPS_DOCKER_DEPLOYMENT.md`                |
| AI readiness       | `src/lib/gemini.ts`, `src/app/api/ai-tutor/`   | `docs/AI_READINESS.md`                         |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Pages   │  │Components│  │  Store   │  │  Hooks   │        │
│  │(App Dir) │  │   (UI)   │  │(Zustand) │  │(Queries) │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴─────────────┴─────────────┘                │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                     API LAYER                                    │
│  ┌──────────────────┴──────────────────┐                        │
│  │           API Routes                 │                        │
│  │  /api/auth/*  /api/chapters/*       │                        │
│  │  /api/shop/*  /api/quests/*         │  ← NEW                 │
│  │  /api/user/*  /api/learning-path    │  ← NEW                 │
│  └──────────────────┬──────────────────┘                        │
│                     │                                            │
├─────────────────────┼────────────────────────────────────────────┤
│                 BACKEND                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Prisma  │  │NextAuth │  │  Rate   │  │ Sentry  │            │
│  │   ORM   │  │  Auth   │  │ Limit   │  │ Errors  │            │
│  └────┬────┘  └─────────┘  └─────────┘  └─────────┘            │
│       │                                                          │
│  ┌────┴────────────────────────────────────────────┐            │
│  │              PostgreSQL Database                 │            │
│  │  + Duolingo models (hearts, quests, shop, etc.) │            │
│  └──────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Domain Glossary (Extended)

| Term           | Description                                                                           |
| -------------- | ------------------------------------------------------------------------------------- |
| **Chapter**    | Educational unit with video, markdown content, and Colab notebook                     |
| **XP**         | Experience points for gamification (level = sqrt(xp/100) + 1)                         |
| **Star**       | Completion indicator: ⭐1=chapter done, ⭐2=questions answered, ⭐3=project submitted |
| **Streak**     | Consecutive days of learning activity                                                 |
| **Hearts**     | Lives system - lose on wrong answers, regenerate over time                            |
| **Gems**       | Currency for shop purchases                                                           |
| **Quest**      | Daily/weekly challenges for XP/gem rewards                                            |
| **Skill Tree** | Visual learning path with snake pattern layout                                        |
| **Exercise**   | Interactive quiz (multiple choice, fill blank, code output, etc.)                     |

## Tech Stack Summary

| Layer      | Technology               | Version    |
| ---------- | ------------------------ | ---------- |
| Framework  | Next.js (App Router)     | 14.2.x     |
| Language   | TypeScript               | 5.5.x      |
| Database   | PostgreSQL + Prisma      | Prisma 7.2 |
| Auth       | NextAuth.js              | 4.24.x     |
| State      | Zustand + TanStack Query | -          |
| Styling    | Tailwind CSS             | 3.4.x      |
| Animations | Framer Motion            | 11.x       |
| 3D         | Three.js                 | 0.181.x    |
| Rate Limit | Upstash Redis            | -          |
| Monitoring | Sentry                   | 10.17.x    |
| Deployment | Docker Compose + Caddy   | v2.0       |

## Directory Structure (Updated)

```
ucebniceNew/
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Extended with Duolingo models
│   ├── seed-duolingo.ts    # Shop items & quests seed
│   └── migrations/
│       └── 20250206090000_duolingo_features/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── learning-path/  # NEW: Skill tree data
│   │   │   ├── shop/           # NEW: XP shop
│   │   │   ├── quests/         # NEW: Daily/weekly quests
│   │   │   └── user/
│   │   │       ├── hearts/     # NEW: Hearts system
│   │   │       └── streak-history/  # NEW
│   │   ├── dashboard/          # NEW: Skill tree page
│   │   └── ...
│   ├── components/
│   │   ├── learning/           # NEW: Learning components
│   │   │   ├── skill-tree/
│   │   │   └── exercise/
│   │   ├── gamification/       # NEW: Gamification UI
│   │   │   ├── hearts/
│   │   │   ├── streak/
│   │   │   ├── celebrations/
│   │   │   └── xp/
│   │   └── ...
│   ├── lib/
│   │   ├── streak-manager.ts   # NEW
│   │   ├── quest-tracker.ts    # NEW
│   │   └── ...
│   └── ...
└── ...
```

## AI Agent Instructions

### When reading this codebase:

1. **Always start here** - read this index first
2. **Navigate to target** - read `_AI.md` files on the path
3. **On the path**: Read only PURPOSE, EXPORTS, GOTCHAS sections
4. **At target**: Read full `_AI.md` file
5. **Before changes**: Check CRITICAL files and RELATED folders

### Before making changes:

- [ ] Check if existing pattern exists
- [ ] Verify auth requirements
- [ ] Consider rate limiting needs
- [ ] Update relevant `_AI.md` if adding new patterns
- [ ] Run `npm run lint` and `npm run type-check`

### Key \_AI.md Locations

| Path                                 | Content                         |
| ------------------------------------ | ------------------------------- |
| `src/lib/_AI.md`                     | Core utilities, Prisma, auth    |
| `src/components/learning/_AI.md`     | Skill tree, exercises           |
| `src/components/gamification/_AI.md` | Hearts, streak, celebrations    |
| `src/app/api/learning-path/_AI.md`   | Skill tree API                  |
| `src/app/api/user/_AI.md`            | User endpoints (hearts, streak) |
| `src/app/api/shop/_AI.md`            | Shop API                        |
| `src/app/api/quests/_AI.md`          | Quest API                       |

---

_This index is maintained by AI agents. Update when adding new major features or patterns._
