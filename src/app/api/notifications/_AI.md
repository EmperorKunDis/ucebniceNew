# src/app/api/notifications/ - AI Context

## 🎯 PURPOSE

In-app notification system for achievements, friend requests, streak alerts, shop purchases, and system messages.

## 📦 EXPORTS (API Routes)

| Route                     | Methods | Purpose                            |
| ------------------------- | ------- | ---------------------------------- |
| `/api/notifications`      | GET     | List notifications with pagination |
| `/api/notifications/read` | POST    | Mark notifications as read         |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Notification Types

```typescript
enum NotificationType {
  FRIEND_REQUEST,
  FRIEND_ACCEPTED,
  ENCOURAGEMENT,
  ACHIEVEMENT_UNLOCKED,
  LEAGUE_PROMOTION,
  LEAGUE_DEMOTION,
  STREAK_ENDANGERED,
  STREAK_LOST,
  STREAK_MILESTONE,
  QUEST_COMPLETED,
  LEVEL_UP,
  HEART_REFILL,
  SHOP_PURCHASE,
  SYSTEM,
}
```

### Creating Notifications

```typescript
// Throughout the codebase, create notifications like:
await prisma.notification.create({
  data: {
    userId,
    type: 'ACHIEVEMENT_UNLOCKED',
    title: '🏆 Nový achievement!',
    message: 'Získal jsi badge "Streak Master"',
    data: { badgeId: 'streak_master', xpReward: 100 },
  },
})
```

### Response Format - List

```typescript
{
  notifications: [{
    id, type, title, message, data,
    read: boolean,
    readAt: string | null,
    createdAt: string
  }],
  unreadCount: 5,
  totalCount: 42,
  hasMore: boolean
}
```

### Marking Read

```typescript
// Mark specific IDs
POST { ids: ["id1", "id2"] }

// Mark all
POST { ids: "all" }
```

## ⚠️ GOTCHAS

1. **Ownership check**: Always verify `userId` when marking read
2. **Pagination**: Default limit 20, max 50
3. **Data field**: JSON field for type-specific metadata
4. **No push notifications**: This is in-app only (push requires separate service)

## 📁 STRUCTURE

```
notifications/
├── _AI.md              # This file
├── route.ts            # GET notifications list
└── read/route.ts       # POST mark as read
```

## 🔄 RELATED

- Achievement system - Creates ACHIEVEMENT_UNLOCKED notifications
- Friends API - Creates FRIEND_REQUEST, FRIEND_ACCEPTED
- Streak manager - Creates STREAK\_\* notifications
- Quest tracker - Creates QUEST_COMPLETED notifications

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: route.ts -->
