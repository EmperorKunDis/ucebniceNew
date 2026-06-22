# src/app/api/user/ - AI Context

## 🎯 PURPOSE

User-related API endpoints for profile, stats, hearts system, streak tracking, and gamification features.

## 📦 EXPORTS (API Routes)

| Route                      | Methods   | Purpose                               |
| -------------------------- | --------- | ------------------------------------- |
| `/api/user/stats`          | GET       | User statistics (XP, level, progress) |
| `/api/user/profile-image`  | PUT       | Profile image upload                  |
| `/api/user/achievements`   | GET       | User's unlocked achievements          |
| `/api/user/hearts`         | GET, POST | Hearts status and lose heart          |
| `/api/user/hearts/refill`  | POST      | Refill hearts using gems              |
| `/api/user/streak-history` | GET       | Streak calendar data                  |

## 🔗 DEPENDENCIES

- `@/lib/auth` - `authOptions` for session
- `@/lib/prisma` - Database access
- `@/lib/streak-manager` - Streak logic

## 🏗️ PATTERNS

### Hearts Regeneration

```typescript
// 240 minutes (4 hours) per heart
// Max 5 hearts by default
// Unlimited hearts from shop purchase have expiry
const minutesSinceRegen = (Date.now() - lastRegen) / 60000
const heartsToAdd = Math.floor(minutesSinceRegen / HEART_REGEN_MINUTES)
```

### Response Format

```typescript
// Hearts endpoint
{
  hearts: number,
  maxHearts: number,
  nextRegenAt: string | null,  // ISO timestamp
  unlimitedUntil: string | null,
  regenRateMinutes: number
}
```

## ⚠️ GOTCHAS

1. **Heart loss**: POST /hearts with `action: "lose"` decrements hearts
2. **Regen on read**: GET /hearts updates DB if hearts regenerated
3. **Unlimited bypass**: Check `unlimitedHeartsUntil` before any heart logic
4. **Streak freeze**: Used automatically on missed day, not manually triggered

## 📁 STRUCTURE

```
user/
├── _AI.md                    # This file
├── stats/route.ts            # GET user stats
├── profile-image/route.ts    # PUT profile image
├── achievements/route.ts     # GET achievements
├── hearts/
│   ├── route.ts              # GET/POST hearts
│   └── refill/route.ts       # POST refill
└── streak-history/route.ts   # GET streak calendar
```

## 🔄 RELATED

- `src/lib/streak-manager.ts` - Streak update logic
- `src/components/gamification/hearts/` - Hearts UI
- `/api/shop/purchase` - Buying heart refills

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: hearts/route.ts, streak-history/route.ts -->
