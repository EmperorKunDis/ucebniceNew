# Učebnice Codebase - AI Navigation Index

> **Last Updated:** 2025-02-05
> **Codebase Version:** v1.0.37
> **Total Files:** ~117 TypeScript/TSX files
> **Lines of Code:** ~25,000

## Quick Reference

| Task | Target Path | Critical Files |
|------|-------------|----------------|
| New API route | `src/app/api/` | `src/lib/api-middleware.ts`, `src/lib/auth.ts` |
| UI component | `src/components/ui/` | `src/lib/utils.ts` |
| Chapter component | `src/components/chapters/` | `src/data/chapters.ts` |
| Database changes | `prisma/` | `src/lib/prisma.ts` |
| Auth changes | `src/app/api/auth/` | `src/lib/auth.ts` |
| Gamification | `src/lib/gamification.ts` | `src/data/chapters.ts`, `prisma/schema.prisma` |
| State management | `src/store/` | - |
| Admin features | `src/app/admin/` | `src/lib/admin-auth.ts` |
| Arena/Hackathons | `src/app/arena/` | `prisma/schema.prisma` (Arena models) |

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
│  │  /api/auth/* /api/chapters/*        │                        │
│  │  /api/progress/* /api/user/*        │                        │
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
│  └──────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Domain Glossary

| Term | Description |
|------|-------------|
| **Chapter** | Educational unit with video, markdown content, and Colab notebook |
| **XP** | Experience points for gamification (level = sqrt(xp/100) + 1) |
| **Star** | Completion indicator: ⭐1=chapter done, ⭐2=questions answered, ⭐3=project submitted |
| **Streak** | Consecutive days of learning activity |
| **Badge/Achievement** | Unlockable rewards with XP bonuses (24 types) |
| **Module Test** | Assessment after every 10 chapters |
| **Arena** | Platform section for hackathons and graduate profiles |
| **Cognitive Glitch** | Random quiz challenges during learning |

## Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14.2.x |
| Language | TypeScript | 5.5.x |
| Database | PostgreSQL + Prisma | Prisma 7.2 |
| Auth | NextAuth.js | 4.24.x |
| State | Zustand + TanStack Query | - |
| Styling | Tailwind CSS | 3.4.x |
| 3D | Three.js | 0.181.x |
| Rate Limit | Upstash Redis | - |
| Monitoring | Sentry | 10.17.x |
| Deployment | K8s + ArgoCD + Helm | - |

## Directory Structure

```
ucebniceNew/
├── prisma/                 # Database schema & migrations
│   └── _AI.md
├── src/
│   ├── app/               # Next.js App Router pages & API
│   │   ├── api/          # Backend API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── arena/        # Hackathons & graduates
│   │   ├── auth/         # Auth pages
│   │   ├── chapters/     # Chapter pages
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/           # Design system primitives
│   │   ├── chapters/     # Chapter-specific components
│   │   ├── layout/       # Layout components
│   │   └── ...
│   ├── lib/              # Utilities & configuration
│   ├── store/            # Zustand state management
│   ├── data/             # Static data (chapters, questions)
│   └── types/            # TypeScript type definitions
├── argocd/               # Kubernetes deployment configs
├── helm/                 # Helm charts
└── scripts/              # Deployment & migration scripts
```

## Key Patterns

### API Route Pattern
All API routes follow this structure:
1. Session validation via `getServerSession(authOptions)`
2. Rate limiting via `applyRateLimit(request, limiter, userId)`
3. Request validation via Zod schemas
4. Business logic with Prisma transactions
5. Cache invalidation
6. Standardized JSON response

### Component Pattern
- Server Components by default (no 'use client')
- Client Components only for interactivity
- Tailwind CSS with `cn()` utility for class merging
- Glass morphism design system

### State Pattern
- **Server State**: TanStack Query (with 60s stale time)
- **Client State**: Zustand with localStorage persistence
- **Auth State**: NextAuth SessionProvider

## Security Considerations

1. **Auth**: JWT-based sessions with NextAuth
2. **Rate Limiting**: Upstash Redis on all sensitive endpoints
3. **CSP**: Strict Content-Security-Policy headers
4. **Admin**: `isAdmin` flag check on admin routes
5. **Validation**: Zod schemas for all API inputs

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

---

*This index is maintained by AI agents. Update when adding new major features or patterns.*
