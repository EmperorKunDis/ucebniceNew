# src/app/api/shop/ - AI Context

## 🎯 PURPOSE

XP Shop API for purchasing power-ups, streak freezes, heart refills, and cosmetics using gems.

## 📦 EXPORTS (API Routes)

| Route                | Methods | Purpose                                  |
| -------------------- | ------- | ---------------------------------------- |
| `/api/shop`          | GET     | List all shop items with purchase status |
| `/api/shop/purchase` | POST    | Purchase an item                         |

## 🔗 DEPENDENCIES

- `@/lib/auth` - Session authentication
- `@/lib/prisma` - Database access
- `prisma/schema.prisma` - ShopItem, UserPurchase models

## 🏗️ PATTERNS

### Shop Item Categories

```typescript
enum ShopItemCategory {
  STREAK, // Streak freezes
  HEART, // Heart refills, unlimited hearts
  XP_BOOST, // XP multipliers
  POWER_UP, // Other power-ups
  COSMETIC, // Visual items
}
```

### Effect Data Structure

```typescript
// Stored as JSON in ShopItem.effectData
{
  type: "heart_refill" | "unlimited_hearts" | "streak_freeze" | "xp_multiplier",
  durationMinutes?: number,  // For timed effects
  amount?: number,           // For quantity-based
  multiplier?: number        // For XP boosts
}
```

### Weekly Purchase Limits

```typescript
// Some items have maxPerWeek limit
const weeklyPurchases = await prisma.userPurchase.count({
  where: {
    userId,
    itemId: item.id,
    createdAt: { gte: weekStart },
  },
})
```

## ⚠️ GOTCHAS

1. **Transaction**: Purchase uses `$transaction` for atomic gem deduction + purchase creation
2. **Streak freeze storage**: Purchased but `usedAt: null` until automatically consumed
3. **Weekly reset**: Counted from Sunday 00:00
4. **Effect application**: Different items have different effect types handled in switch

## 📁 STRUCTURE

```
shop/
├── _AI.md              # This file
├── route.ts            # GET shop items list
└── purchase/
    └── route.ts        # POST purchase item
```

## 🔄 RELATED

- `prisma/seed-duolingo.ts` - Seeds shop items
- `/api/user/hearts/refill` - Alternative heart refill endpoint
- `src/components/gamification/shop/` - Shop UI (TODO)

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: purchase/route.ts -->
