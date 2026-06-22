# src/components/layout/ - AI Context

## 🎯 PURPOSE

Core layout components for the application shell - sidebar navigation, topbar with user stats, and responsive main layout wrapper.

## 📦 EXPORTS

| Component    | Purpose                                                |
| ------------ | ------------------------------------------------------ |
| `MainLayout` | Full page wrapper with sidebar, topbar, error boundary |
| `Sidebar`    | Collapsible navigation sidebar with active indicators  |
| `Topbar`     | Header with hearts, XP, gems, notifications, avatar    |
| `MobileNav`  | Fixed bottom navigation for mobile (lg:hidden)         |

## 🔗 DEPENDENCIES

- `framer-motion` - Animations (sidebar toggle, mobile overlay)
- `next-auth/react` - Session data for user stats
- `@/components/gamification/hearts` - HeartDisplay, useHearts
- `@/components/gamification/streak` - StreakDisplay
- `@/components/gamification/xp` - XPCounter, LevelBadge
- `@/components/shared/ErrorBoundary` - Error catching

## 🏗️ PATTERNS

### Sidebar Navigation

```typescript
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Domů' },
  { href: '/learn', icon: BookOpen, label: 'Učení' },
  // ...
]

// Active detection
const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
```

### Mobile Responsiveness

```typescript
// Sidebar
<div className="hidden lg:block">
  <Sidebar />
</div>

// Mobile overlay
<AnimatePresence>
  {sidebarOpen && (
    <motion.div className="fixed inset-0 z-40 lg:hidden">
      ...
    </motion.div>
  )}
</AnimatePresence>
```

### Topbar Stats

```typescript
// Displays: Streak | XP | Level | Hearts | Gems | Notifications | Avatar
// Hearts use useHearts() hook for real-time updates
```

## ⚠️ GOTCHAS

1. **Collapsed state**: Sidebar stores collapsed in local state (no persistence)
2. **Hearts hook**: Topbar uses useHearts() which auto-fetches on mount
3. **Session data**: Falls back to 0/1 if session.user fields missing
4. **Mobile menu**: z-50 for sidebar, z-40 for backdrop

## 📁 STRUCTURE

```
layout/
├── _AI.md              # This file
├── index.ts            # Barrel exports
├── MainLayout.tsx      # Full page wrapper
├── Sidebar.tsx         # Navigation sidebar
└── Topbar.tsx          # Header bar
```

## 🔄 RELATED

- `src/app/(main)/layout.tsx` - Uses MainLayout
- `src/components/gamification/` - Stats components used in Topbar
- `src/components/shared/ErrorBoundary.tsx` - Wraps page content

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: MainLayout.tsx -->
