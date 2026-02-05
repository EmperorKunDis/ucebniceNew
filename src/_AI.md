# src/ - AI Context

## 🎯 PURPOSE
Main source directory containing all application code: pages, components, utilities, state management, and static data.

## 📦 EXPORTS
This folder does not export directly. Subfolders export:
- `app/` → Pages, layouts, API routes
- `components/` → React components
- `lib/` → Utilities, auth, gamification logic
- `store/` → Zustand state management
- `data/` → Static chapter/question data
- `types/` → TypeScript definitions

## 🔗 DEPENDENCIES
- Next.js 14 framework
- React 18
- TypeScript 5.5
- All npm dependencies from package.json

## 🏗️ PATTERNS
- **File colocation**: Related files grouped by feature
- **Path aliases**: `@/*` maps to `./src/*`
- **Server-first**: Components are Server Components by default
- **Client directive**: `'use client'` only when needed for interactivity

## ⚠️ GOTCHAS
1. **Middleware**: `middleware.ts` at src root handles auth protection
2. **Server vs Client**: Be aware of React Server Component boundaries
3. **Import paths**: Always use `@/` alias, never relative paths crossing folders

## 📁 STRUCTURE
```
src/
├── middleware.ts      # NextAuth middleware for route protection
├── app/              # Next.js App Router (pages + API)
├── components/       # React components organized by feature
├── lib/              # Utilities, config, business logic
├── store/            # Zustand state management
├── data/             # Static data files (chapters, questions)
└── types/            # TypeScript type definitions
```

## 🔄 RELATED
- `prisma/` - Database schema (src/lib/prisma.ts imports from here)
- `public/` - Static assets referenced by components
- `tailwind.config.js` - Styling configuration

---
<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: middleware.ts -->
