# src/types/ - AI Context

## 🎯 PURPOSE
TypeScript type definitions and declaration files for the application. Extends library types and defines domain-specific interfaces.

## 📦 EXPORTS

| File | Exports | Description |
|------|---------|-------------|
| `next-auth.d.ts` | Extended Session/User types | Adds custom fields to NextAuth |
| `arena.ts` | Hackathon, Team, Graduate types | Arena feature types |
| `skills.ts` | SkillNode, SkillEdge types | Skill graph types |

## 🔗 DEPENDENCIES
- `next-auth` - Type augmentation
- TypeScript built-in types

## 🏗️ PATTERNS

### NextAuth Type Extension
```typescript
// next-auth.d.ts
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      xp: number
      level: number
      currentStreak: number
      longestStreak: number
      username: string | null
    }
  }
}
```

### Domain Types
```typescript
// arena.ts
export interface Hackathon {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'active' | 'completed'
  // ...
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
  // ...
}
```

## ⚠️ GOTCHAS

1. **NextAuth session**: Custom fields must be added in both `auth.ts` callbacks AND type declaration
2. **Module augmentation**: Use `declare module` syntax for extending library types
3. **Import types**: Use `import type` for type-only imports
4. **Prisma types**: Generated types are in `node_modules/.prisma/client` - don't duplicate

## 📁 STRUCTURE
```
types/
├── next-auth.d.ts   # NextAuth type extensions (CRITICAL)
├── arena.ts         # Arena/hackathon types
└── skills.ts        # Skill visualization types
```

## 🔄 RELATED
- `src/lib/auth.ts` - NextAuth config (must match type extensions)
- `prisma/schema.prisma` - Database types (Prisma generates its own)

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: next-auth.d.ts -->
