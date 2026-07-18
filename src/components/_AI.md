# src/components/ - AI Context

## 🎯 PURPOSE

Reusable React components organized by feature. Contains UI primitives, chapter-specific components, layout helpers, and specialized feature components.

## 📦 EXPORTS

Components are exported individually from their files:

- `ui/` - Design system primitives (Button, Card, etc.)
- `chapters/` - Chapter-related components
- `layout/` - Layout building blocks
- `certificate/` - PDF certificate generation
- `tests/` - Module test modal
- `cognitive-glitch/` - Quiz challenge modal
- `profile/` - Profile components
- `skills/` - Skill visualization
- `onboarding/` - Onboarding flow components

## 🔗 DEPENDENCIES

- `@/lib/utils` - `cn()` for class merging
- `react` / `react-dom`
- `framer-motion` - Animations
- `lucide-react` - Icons
- `three` / `@react-three/fiber` - 3D (selective)
- `jspdf` / `html2canvas` - PDF generation (selective)

## 🏗️ PATTERNS

### Component File Pattern

```typescript
// my-component.tsx
'use client' // Only if needs interactivity

import { cn } from '@/lib/utils'

interface MyComponentProps {
  className?: string
  children?: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  )
}
```

### Design System - Glass Morphism

```typescript
// Standard glass effect classes
className = 'bg-black/30 backdrop-blur-md border border-white/10 rounded-lg'
```

### Dynamic Import Pattern (Heavy Components)

```typescript
// In page or parent component
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('@/components/heavy-component'),
  { ssr: false, loading: () => <Skeleton /> }
)
```

## ⚠️ GOTCHAS

1. **Server vs Client**: Most UI components need `'use client'` for interactivity
2. **Three.js components**: Always use dynamic imports with `ssr: false`
3. **PDF generation**: Certificate generator is heavy, dynamic import it
4. **Icon imports**: Import specific icons, not entire lucide-react
5. **Tailwind classes**: Use `cn()` from `@/lib/utils` for conditional classes
6. **Storybook**: Components in `ui/` may have `.stories.tsx` files

## 📁 STRUCTURE

```
components/
├── providers.tsx          # App-level providers (CRITICAL)
├── auth-provider.tsx      # Auth context provider
├── ErrorBoundary.tsx      # Error boundary component
├── landing/               # Public Učebnice AI 1.0 scroll story and static fallback
├── ui/                    # Design system primitives
│   ├── button.tsx        # Button component
│   ├── glass-surface.tsx # Glass effect wrapper
│   ├── fluid-glass.tsx   # Animated glass (Three.js)
│   ├── grid.tsx          # Grid layout
│   ├── stack.tsx         # Flex stack
│   ├── box.tsx           # Box primitive
│   ├── stat-card.tsx     # Statistics card
│   ├── profile-card.tsx  # Profile display
│   ├── section-header.tsx # Section titles
│   ├── decrypted-text.tsx # Text animation
│   └── ...               # More UI components
├── chapters/              # Chapter feature
│   ├── ChapterCard.tsx   # Chapter list item
│   ├── VideoPlayer.tsx   # Video playback
│   └── ProjectSubmission.tsx # Project form
├── layout/                # Layout components
│   ├── MainLayout.tsx    # Authenticated app shell
│   ├── PublicShell.tsx   # Public shell with partner footer
│   └── AdminShell.tsx    # Admin navigation shell
├── certificate/           # Certificate generation
│   └── certificate-generator.tsx # PDF export
├── cognitive-glitch/      # Random quizzes
│   └── cognitive-glitch-modal.tsx
├── profile/               # User profile
│   └── ProfilePhotoUpload.tsx
├── skills/                # Skill visualization
│   └── skill-tree.tsx    # D3 skill graph
└── onboarding/            # Onboarding flow
    └── onboarding-wizard.tsx
```

## 🔄 RELATED

- `src/lib/utils.ts` - `cn()` utility
- `src/lib/theme.ts` - Theme configuration
- `tailwind.config.js` - Tailwind setup
- `src/app/` - Pages using these components

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: providers.tsx, ui/button.tsx -->
