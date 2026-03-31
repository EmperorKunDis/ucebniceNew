# src/app/api/leagues/ - AI Context

## 🎯 PURPOSE

Weekly competitive league system - users compete for XP within tiers, with promotion/demotion based on ranking.

## 📦 EXPORTS (API Routes)

| Route                      | Methods | Purpose                            |
| -------------------------- | ------- | ---------------------------------- |
| `/api/leagues/current`     | GET     | User's current league status       |
| `/api/leagues/leaderboard` | GET     | Full leaderboard for user's league |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access

## 🏗️ PATTERNS

### Tier Progression

```typescript
const TIER_ORDER = [
  'BRONZE', // Entry tier
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'OBSIDIAN', // Top tier
]
```

### Promotion/Demotion Zones

```typescript
// Based on position in leaderboard
const promotionZone = Math.ceil(totalMembers * 0.33) // Top 33%
const demotionZone = Math.floor(totalMembers * 0.83) // Bottom 17%

zone = rank <= promotionZone ? 'promotion' : rank > demotionZone ? 'demotion' : 'safe'
```

### Week Boundaries

```typescript
// Week starts on Sunday 00:00
const weekStart = new Date()
weekStart.setDate(weekStart.getDate() - weekStart.getDay())
weekStart.setHours(0, 0, 0, 0)

const weekEnd = new Date(weekStart)
weekEnd.setDate(weekEnd.getDate() + 7)
```

### Auto-Join Logic

```typescript
// If user has no membership for current week, auto-create in Bronze
if (!membership) {
  // Find/create Bronze league for this week
  // Create membership with weeklyXP: 0
}
```

### Response Format - Current

```typescript
{
  currentTier: "GOLD",
  weeklyXP: 450,
  rank: 7,
  totalMembers: 30,
  promotionZone: 10,
  demotionZone: 25,
  daysRemaining: 3,
  nextTier: "PLATINUM",
  previousTier: "SILVER",
  zone: "promotion" | "safe" | "demotion"
}
```

### Response Format - Leaderboard

```typescript
{
  tier: "GOLD",
  weekStart, weekEnd,
  members: [{
    rank, userId, username, avatar, level, streak, weeklyXP,
    isCurrentUser: boolean,
    zone: "promotion" | "safe" | "demotion"
  }],
  promotionCutoff, demotionCutoff, totalMembers
}
```

## ⚠️ GOTCHAS

1. **Auto-join**: Users automatically join Bronze league if no membership exists
2. **Week boundary**: Sunday 00:00 server time (consider timezone handling)
3. **XP tracking**: weeklyXP on LeagueMembership, updated when user earns XP
4. **Promotion processing**: Needs cron job to run at week end

## 📁 STRUCTURE

```
leagues/
├── _AI.md                 # This file
├── current/route.ts       # GET user's league status
└── leaderboard/route.ts   # GET full leaderboard
```

## 🔄 RELATED

- XP earning endpoints - Should update `leagueMembership.weeklyXP`
- Cron job (TODO) - Process promotions/demotions at week end
- `src/components/gamification/leagues/` - League UI (TODO)

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: current/route.ts -->
