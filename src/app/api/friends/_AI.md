# src/app/api/friends/ - AI Context

## 🎯 PURPOSE

Social features - friend management, friend requests, and friend leaderboards for competitive motivation.

## 📦 EXPORTS (API Routes)

| Route                  | Methods | Purpose                                |
| ---------------------- | ------- | -------------------------------------- |
| `/api/friends`         | GET     | List friends with activity & weekly XP |
| `/api/friends/request` | POST    | Send a friend request                  |
| `/api/friends/respond` | POST    | Accept or reject a request             |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Friendship States

```typescript
enum FriendshipStatus {
  PENDING, // Request sent, awaiting response
  ACCEPTED, // Friends
  BLOCKED, // Blocked (cannot send requests)
}
```

### Activity Status

```typescript
function getActivityStatus(lastActive: Date | null): string {
  if (!lastActive) return 'inactive'
  const hours = (Date.now() - lastActive.getTime()) / 3600000

  if (hours < 1) return 'online' // Active in last hour
  if (hours < 24) return 'today' // Active today
  if (hours < 168) return 'this_week' // Active this week
  return 'inactive'
}
```

### Friend Lookup

```typescript
// Search by username OR email (case insensitive)
const receiver = await prisma.user.findFirst({
  where: {
    OR: [
      { username: { equals: username, mode: 'insensitive' } },
      { email: { equals: username, mode: 'insensitive' } },
    ],
  },
})
```

### Response Format - Friends List

```typescript
{
  friends: [{
    friendshipId,
    id, username, avatar, level, streak,
    weeklyXP,  // For friend leaderboard
    lastActiveAt,
    status: "online" | "today" | "this_week" | "inactive"
  }],
  pendingReceived: [{ friendshipId, user, createdAt }],
  pendingSent: [{ friendshipId, user, createdAt }],
  totalFriends
}
```

### Response Format - Request

```typescript
// Success
{ success: true, friendshipId, message: "Žádost odeslána" }

// Errors
{ error: "Uživatel nenalezen" }
{ error: "Už jste přátelé" }
{ error: "Žádost již existuje" }
```

## ⚠️ GOTCHAS

1. **Bidirectional check**: When checking for existing friendship, check both directions
2. **Self-request**: Prevent user from sending request to themselves
3. **Blocked status**: If blocked, silently fail (don't reveal block status)
4. **Notifications**: Create notifications for both request and acceptance

## 📁 STRUCTURE

```
friends/
├── _AI.md              # This file
├── route.ts            # GET friends list
├── request/route.ts    # POST send request
└── respond/route.ts    # POST accept/reject
```

## 🔄 RELATED

- `/api/notifications` - Friend-related notifications
- `/api/leagues/leaderboard` - Similar leaderboard pattern
- `src/components/social/friends/` - Friends UI (TODO)

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: route.ts, request/route.ts -->
