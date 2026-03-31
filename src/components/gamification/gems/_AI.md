# src/components/gamification/gems/ - AI Context

## 🎯 PURPOSE

Gem (premium currency) display and management components for the shop and topbar.

## 📦 EXPORTS

| Export       | Purpose                         |
| ------------ | ------------------------------- |
| `GemDisplay` | Shows gem count with 💎 icon    |
| `useGems`    | Hook for fetching/spending gems |

## 🔗 DEPENDENCIES

- `next-auth/react` - Session for user ID
- `/api/user/stats` - Fetch current gems

## 🏗️ PATTERNS

### useGems Hook

```typescript
const { gems, loading, spend, add, refetch } = useGems()

// Optimistic spend (returns false if not enough)
const success = await spend(100)

// Manual add (e.g., after purchase reward)
add(50)
```

### GemDisplay Component

```typescript
<GemDisplay gems={gems} size="md" />
<GemDisplay gems={gems} size="lg" showIcon={false} />
```

## ⚠️ GOTCHAS

1. **Optimistic spending**: spend() decrements locally but doesn't call API - shop purchase handles that
2. **Stats endpoint**: Uses /api/user/stats which returns { gems, xp, level, ... }
3. **No persistence**: Hook fetches on mount only, call refetch() after shop purchases

## 📁 STRUCTURE

```
gems/
├── _AI.md          # This file
├── index.ts        # Barrel exports
├── GemDisplay.tsx  # Visual display
└── useGems.ts      # State management hook
```

## 🔄 RELATED

- `src/app/(main)/shop/page.tsx` - Uses gems for purchases
- `src/components/layout/Topbar.tsx` - Shows gems in header
- `/api/shop/purchase` - Deducts gems

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 1 -->
