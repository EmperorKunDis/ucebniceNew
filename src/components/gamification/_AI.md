# src/components/gamification/ - AI Context

## 🎯 PURPOSE

Gamification UI components for Duolingo-style engagement features: hearts, streaks, XP display, shop items, celebrations, and achievements.

## 📦 EXPORTS

| Subfolder       | Components                                                 | Purpose         |
| --------------- | ---------------------------------------------------------- | --------------- |
| `hearts/`       | HeartDisplay, HeartRefillModal, useHearts                  | Lives system    |
| `streak/`       | StreakDisplay, StreakCalendar                              | Streak tracking |
| `celebrations/` | Confetti, LevelUpModal, XPGainAnimation, AchievementUnlock | Reward feedback |
| `xp/`           | XPCounter, XPProgressBar, LevelBadge                       | XP display      |
| `shop/`         | ShopItemCard, ShopCategory, ShopModal                      | Gem shop UI     |

## 🔗 DEPENDENCIES

- `framer-motion` - All animations
- `lucide-react` - Icons (Heart, Flame, Star, etc.)
- `@/lib/utils` - `cn()` class merging

## 🏗️ PATTERNS

### Heart Regeneration Display

```typescript
// Timer countdown updates every second
useEffect(() => {
  const interval = setInterval(() => {
    const diff = regenTime - Date.now()
    setTimeUntilRegen(formatTime(diff))
  }, 1000)
  return () => clearInterval(interval)
}, [regenTime])
```

### Celebration Triggers

```typescript
// Celebrations are triggered by parent components
<LevelUpModal isOpen={showLevelUp} onClose={...} newLevel={5} />
<Confetti isActive={showConfetti} />
<XPGainAnimation amount={50} isVisible={showXP} />
```

### Hook Pattern (useHearts)

```typescript
const { hearts, maxHearts, loseHeart, refillHearts, isLoading } = useHearts()

// Automatically refetches when regen time passes
// Provides optimistic updates for better UX
```

## ⚠️ GOTCHAS

1. **framer-motion SSR**: Use `AnimatePresence` with proper exit animations
2. **Confetti performance**: Limit pieceCount on mobile (30-50)
3. **Heart timer**: Cleanup interval on unmount to prevent memory leaks
4. **Modal z-index**: Celebrations use z-50, ensure backdrop covers everything

## 📁 STRUCTURE

```
gamification/
├── _AI.md              # This file
├── hearts/
│   ├── index.ts
│   ├── HeartDisplay.tsx      # Heart icons with timer
│   ├── HeartRefillModal.tsx  # Refill purchase modal
│   └── useHearts.ts          # Hearts state hook
├── streak/
│   ├── index.ts
│   ├── StreakDisplay.tsx     # Flame icon + count
│   └── StreakCalendar.tsx    # 7-week activity grid
├── celebrations/
│   ├── index.ts
│   ├── Confetti.tsx          # Falling confetti particles
│   ├── LevelUpModal.tsx      # Level up celebration
│   ├── XPGainAnimation.tsx   # Floating +XP indicator
│   └── AchievementUnlock.tsx # Achievement popup
├── xp/                       # TODO
│   ├── XPCounter.tsx
│   ├── XPProgressBar.tsx
│   └── LevelBadge.tsx
└── shop/                     # TODO
    ├── ShopItemCard.tsx
    ├── ShopCategory.tsx
    └── ShopModal.tsx
```

## 🔄 RELATED

- `/api/user/hearts` - Hearts data source
- `/api/user/streak-history` - Streak calendar data
- `/api/shop` - Shop items data
- `src/lib/gamification.ts` - XP/level calculations

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: hearts/useHearts.ts, celebrations/Confetti.tsx -->
