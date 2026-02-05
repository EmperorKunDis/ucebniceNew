# src/store/ - AI Context

## 🎯 PURPOSE
Client-side state management using Zustand. Handles local user state that persists across page navigations and sessions via localStorage.

## 📦 EXPORTS

| Export | Description |
|--------|-------------|
| `useUserStore` | Main user state store hook |

## 🔗 DEPENDENCIES
- `zustand` - State management
- `zustand/middleware` - Persistence middleware

## 🏗️ PATTERNS

### Store Structure
```typescript
interface UserState {
  // Data
  userId: string | null
  username: string | null
  xp: number
  level: number
  streak: number
  badges: Badge[]
  
  // Actions
  setUser: (user: User) => void
  addXP: (amount: number) => void
  reset: () => void
}
```

### Usage in Components
```typescript
'use client'
import { useUserStore } from '@/store/user-store'

function MyComponent() {
  const { xp, level, addXP } = useUserStore()
  // ...
}
```

### Persistence
Store is persisted to localStorage under key `'user-storage'`.
Data survives page refreshes but is client-only.

## ⚠️ GOTCHAS

1. **Client-only**: Store only works in Client Components (`'use client'`)
2. **Hydration mismatch**: Initial server render won't have localStorage data
3. **Sync with server**: Store is local cache; server is source of truth
4. **Reset on logout**: Call `reset()` when user logs out
5. **Level calculation**: Duplicated from `lib/gamification.ts` - keep in sync

## 📁 STRUCTURE
```
store/
└── user-store.ts    # Main user state store
```

## 🔄 RELATED
- `src/lib/gamification.ts` - Level calculation logic (should match)
- `src/lib/api-client.ts` - API calls that update store
- `src/components/providers.tsx` - Store is available after providers mount

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: user-store.ts -->
