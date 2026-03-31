# src/components/ui/ - AI Context

## 🎯 PURPOSE

Design system primitives and reusable UI components. Glass morphism aesthetic with animations. These are the building blocks for all other components.

## 📦 EXPORTS

| Component        | Description                         |
| ---------------- | ----------------------------------- |
| `Button`         | Primary action button with variants |
| `GlassSurface`   | Glass morphism container            |
| `FluidGlass`     | Animated glass with Three.js        |
| `Grid`           | CSS Grid wrapper                    |
| `Stack`          | Flexbox stack (vertical/horizontal) |
| `Box`            | Generic container with styling      |
| `StatCard`       | Statistics display card             |
| `ProfileCard`    | User profile display                |
| `SectionHeader`  | Section title with styling          |
| `DecryptedText`  | Text reveal animation               |
| `FuzzyText`      | Glitch text effect                  |
| `FallingText`    | Text animation                      |
| `LaserFlow`      | Animated border effect              |
| `Lightning`      | Lightning background effect         |
| `ElectricBorder` | Animated border                     |

## 🔗 DEPENDENCIES

- `@/lib/utils` - `cn()` function
- `framer-motion` - Animations
- `lucide-react` - Icons
- `three` - 3D effects (FluidGlass)
- `clsx` + `tailwind-merge` - Class merging

## 🏗️ PATTERNS

### Component Anatomy

```typescript
'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'base-styles',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### Glass Morphism Pattern

```typescript
// Standard glass effect
const glassClasses = cn('bg-black/30', 'backdrop-blur-md', 'border border-white/10', 'rounded-lg')
```

### Animation Pattern

```typescript
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

<motion.div {...fadeIn}>Content</motion.div>
```

## ⚠️ GOTCHAS

1. **'use client' required**: All interactive components need this directive
2. **FluidGlass is heavy**: Uses Three.js, always dynamic import
3. **forwardRef pattern**: Use for components that may need ref access
4. **displayName**: Add for better React DevTools debugging
5. **Tailwind purging**: Use full class names, not string interpolation
6. **Motion bundle**: Framer Motion adds ~25KB to bundle
7. **GlassSurface hydration**: ✅ FIXED (2026-02-08) - SVG filter detection deferred to client

## 🆕 GLASS-SURFACE FIX (2026-02-08)

GlassSurface now uses `useState` for SVG filter detection to avoid hydration mismatch:

- Server always renders `glass-surface--fallback`
- Client detects support via `useEffect` and may switch to `glass-surface--svg`
- SVG filter elements only render when `useSVGFilter` is true

## 📁 STRUCTURE

```
ui/
├── button.tsx           # Button component
├── button.stories.tsx   # Storybook stories
├── glass-surface.tsx    # Glass container
├── fluid-glass.tsx      # Animated 3D glass
├── fluid-glass-simple.tsx # Simplified glass
├── fluid-glass-fallback.tsx # No-JS fallback
├── grid.tsx             # Grid layout
├── stack.tsx            # Flex stack
├── box.tsx              # Box primitive
├── stat-card.tsx        # Stats display
├── profile-card.tsx     # Profile card
├── section-header.tsx   # Section titles
├── decrypted-text.tsx   # Text animation
├── fuzzy-text.tsx       # Glitch text
├── falling-text.tsx     # Falling animation
├── laser-flow.tsx       # Border animation
├── lightning.tsx        # Lightning effect
├── lightning-background.tsx # BG effect
├── electric-border.tsx  # Animated border
└── grey-surface.tsx     # Grey container
```

## 🔄 RELATED

- `src/lib/utils.ts` - `cn()` utility
- `tailwind.config.js` - Theme configuration
- `.storybook/` - Storybook configuration

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: button.tsx, glass-surface.tsx -->
