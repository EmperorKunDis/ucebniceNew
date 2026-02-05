# src/lib/ - AI Context

## 🎯 PURPOSE
Core utility functions, configuration, and business logic shared across the application. This is the "brain" of the backend logic.

## 📦 EXPORTS

| File | Exports | Usage |
|------|---------|-------|
| `prisma.ts` | `prisma` client | Database access everywhere |
| `auth.ts` | `authOptions` | NextAuth configuration |
| `gamification.ts` | XP/level functions, BADGES | Progress & achievements |
| `api-middleware.ts` | `applyRateLimit`, `addRateLimitHeaders` | API route protection |
| `rate-limit.ts` | Rate limiters | Per-endpoint rate limits |
| `utils.ts` | `cn()`, `generateColabUrl()` | CSS merging, URL generation |
| `constants.ts` | App-wide constants | XP values, routes, messages |
| `cache.ts` | `CacheInvalidation` | Cache management |
| `validations.ts` | Zod schemas | API request validation |
| `validation-schemas.ts` | Extended Zod schemas | Complex validation |
| `achievement-checker.ts` | `checkAndAwardAchievements()` | Achievement logic |
| `admin-auth.ts` | Admin auth helpers | Admin route protection |
| `glitch-challenges.ts` | Cognitive glitch data | Quiz challenges |
| `theme.ts` | Theme configuration | UI theming |
| `swagger.ts` | OpenAPI spec | API documentation |
| `env.ts` | Environment helpers | Env var access |
| `api-client.ts` | API client functions | Frontend API calls |

## 🔗 DEPENDENCIES
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `@upstash/ratelimit` - Rate limiting
- `zod` - Schema validation
- `bcryptjs` - Password hashing
- `clsx` + `tailwind-merge` - CSS utilities

## 🏗️ PATTERNS

### Prisma Client Singleton
```typescript
// prisma.ts uses global singleton pattern to avoid connection exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
```

### Rate Limiting Pattern
```typescript
// In API route:
const rateLimitResponse = await applyRateLimit(request, progressLimiter, session.user.id)
if (rateLimitResponse) return rateLimitResponse
```

### Level Calculation
```typescript
// Quadratic growth formula
level = Math.floor(Math.sqrt(xp / 100)) + 1
```

## ⚠️ GOTCHAS

1. **Prisma connection pool**: Uses pg adapter with pool of 20 connections
2. **Auth imports**: Use dynamic imports in api-middleware to avoid circular deps
3. **BADGES object**: Exists in both `gamification.ts` and `constants.ts` - use from `gamification.ts` for logic
4. **Rate limit bypass**: Rate limiting returns null when UPSTASH not configured (dev mode)
5. **Cache invalidation**: Fire-and-forget pattern, don't await in API responses

## 📁 STRUCTURE
```
lib/
├── prisma.ts           # Database client (CRITICAL)
├── auth.ts             # NextAuth config (CRITICAL)
├── gamification.ts     # XP/level/badge logic (CRITICAL)
├── api-middleware.ts   # Rate limiting middleware
├── rate-limit.ts       # Rate limiter instances
├── utils.ts            # General utilities
├── constants.ts        # App constants & messages
├── cache.ts            # Cache invalidation
├── validations.ts      # Zod schemas
├── validation-schemas.ts # Extended schemas
├── achievement-checker.ts # Achievement detection
├── admin-auth.ts       # Admin authentication
├── glitch-challenges.ts # Cognitive glitch data
├── theme.ts            # Theme config
├── swagger.ts          # API docs
├── env.ts              # Environment helpers
└── api-client.ts       # Frontend API client
```

## 🔄 RELATED
- `prisma/schema.prisma` - Database schema definition
- `src/app/api/` - API routes using these utilities
- `src/store/` - Client-side state (uses api-client.ts)

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: prisma.ts, auth.ts, gamification.ts, api-middleware.ts -->
