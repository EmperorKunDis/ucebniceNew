# src/app/api/analytics/ - AI Context

## 🎯 PURPOSE

Event tracking and analytics dashboard for understanding user behavior, engagement metrics, and learning patterns.

## 📦 EXPORTS (API Routes)

| Route                      | Methods | Auth     | Purpose               |
| -------------------------- | ------- | -------- | --------------------- |
| `/api/analytics/event`     | POST    | Optional | Track analytics event |
| `/api/analytics/dashboard` | GET     | Admin    | Get dashboard stats   |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Event Types

```typescript
enum AnalyticsEventType {
  PAGE_VIEW,
  LESSON_START,
  LESSON_COMPLETE,
  EXERCISE_ANSWER,
  EXERCISE_HINT_USED,
  REVIEW_SESSION_START,
  REVIEW_SESSION_COMPLETE,
  SHOP_VIEW,
  SHOP_PURCHASE,
  FRIEND_REQUEST_SENT,
  AI_TUTOR_MESSAGE,
  ACHIEVEMENT_VIEW,
  LEAGUE_VIEW,
  STREAK_CHECK,
  HEART_LOST,
  HEART_REFILL,
  SESSION_START,
  SESSION_END,
  ERROR,
}
```

### Event Tracking (Client-side)

```typescript
// Track an event from anywhere in the app
await fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'EXERCISE_ANSWER',
    data: { exerciseId, correct: true, timeSpent: 15 },
    page: '/learn/05/practice',
    sessionId: 'sess_abc123',
  }),
})
```

### Dashboard Response

```typescript
{
  period: { days: 7, startDate: "2026-02-01" },
  overview: {
    totalUsers,
    activeUsers,      // Active in period
    newUsers,         // Registered in period
    lessonsCompleted,
    exercisesAnswered,
  },
  charts: {
    dailyActiveUsers: [{ date, count }],
    eventsByType: [{ type, count }],
    topChapters: [{ chapterId, title, completions }],
  }
}
```

### Metadata Capture

```typescript
// Automatically captured on each event
const userAgent = request.headers.get('user-agent')
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
```

## ⚠️ GOTCHAS

1. **Optional auth**: Event tracking works for anonymous users too
2. **Silent failure**: Analytics never fails the request (returns success even on error)
3. **Admin only**: Dashboard requires isAdmin or role=ADMIN
4. **Raw SQL**: DAU query uses $queryRaw for date grouping
5. **IP privacy**: Consider GDPR - may need to hash or not store IP

## 📁 STRUCTURE

```
analytics/
├── _AI.md              # This file
├── event/route.ts      # POST track event
└── dashboard/route.ts  # GET admin dashboard
```

## 🔄 RELATED

- `prisma/schema.prisma` - AnalyticsEvent, AnalyticsEventType
- `/admin/analytics` - Admin analytics page (TODO)
- All user actions - Should trigger event tracking

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: dashboard/route.ts -->
