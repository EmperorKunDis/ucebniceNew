# src/app/api/ - AI Context

## 🎯 PURPOSE
RESTful API endpoints for the application. Handles all server-side business logic, database operations, and authentication.

## 📦 EXPORTS
No exports. Each `route.ts` file defines HTTP handlers:
- `GET` - Fetch data
- `POST` - Create/action
- `PUT/PATCH` - Update
- `DELETE` - Remove

## 🔗 DEPENDENCIES
- `next-auth` - Session management
- `@/lib/prisma` - Database client
- `@/lib/api-middleware` - Rate limiting
- `@/lib/validation-schemas` - Request validation
- `@/lib/gamification` - XP/achievement logic

## 🏗️ PATTERNS

### Standard API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/api-middleware'
import { someLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Rate limiting
    const rateLimitResponse = await applyRateLimit(request, someLimiter, session.user.id)
    if (rateLimitResponse) return rateLimitResponse

    // 3. Validate request
    const body = await request.json()
    // ... zod validation

    // 4. Business logic with Prisma
    const result = await prisma.$transaction(async (tx) => {
      // ... database operations
    })

    // 5. Return response
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Admin Route Pattern
```typescript
// Check admin flag before processing
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
if (!user?.isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## ⚠️ GOTCHAS

1. **Session access**: Use `getServerSession(authOptions)`, not client-side hooks
2. **Rate limit bypass**: Returns null in dev mode without Upstash config
3. **Transactions**: Use `prisma.$transaction()` for multi-step operations
4. **Error messages**: Return generic messages to client, log details server-side
5. **Cache invalidation**: Call `CacheInvalidation.invalidate*()` after mutations
6. **Swagger docs**: Add JSDoc comments for `/api-docs` generation

## 📁 STRUCTURE
```
api/
├── auth/
│   ├── [...nextauth]/route.ts   # NextAuth handler
│   └── register/route.ts        # User registration
├── chapters/
│   ├── progress/route.ts        # Get chapter progress
│   └── all-progress/route.ts    # Get all progress
├── progress/
│   └── complete-chapter/route.ts # Mark chapter complete
├── questions/
│   ├── route.ts                 # Get questions
│   └── answer/route.ts          # Submit answers
├── projects/
│   └── submit/route.ts          # Submit project URL
├── tests/
│   └── submit/route.ts          # Submit module test
├── user/
│   ├── stats/route.ts           # User statistics
│   ├── profile-image/route.ts   # Upload avatar
│   └── graduate-profile/route.ts # Graduate profile
├── admin/
│   ├── achievements/route.ts    # Manage achievements
│   ├── chapters/route.ts        # Manage chapters
│   ├── hackathons/route.ts      # Manage hackathons
│   ├── users/route.ts           # Manage users
│   └── analytics/route.ts       # View analytics
├── hackathons/
│   ├── route.ts                 # List hackathons
│   └── [id]/route.ts            # Hackathon detail
├── teams/
│   ├── route.ts                 # Create team
│   └── [id]/
│       ├── route.ts             # Team detail
│       ├── join/route.ts        # Join team
│       └── project/route.ts     # Submit project
├── graduates/
│   ├── route.ts                 # List graduates
│   └── [id]/route.ts            # Graduate detail
├── leaderboard/route.ts         # XP rankings
├── onboarding/complete/route.ts # Complete onboarding
├── video/[filename]/route.ts    # Serve video files
├── health/route.ts              # Health check
└── swagger/route.ts             # API documentation
```

## 🔄 RELATED
- `src/lib/auth.ts` - Authentication configuration
- `src/lib/prisma.ts` - Database client
- `src/lib/api-middleware.ts` - Rate limiting
- `src/lib/validation-schemas.ts` - Request validation
- `prisma/schema.prisma` - Database schema

---
<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: auth/[...nextauth]/route.ts, progress/complete-chapter/route.ts -->
