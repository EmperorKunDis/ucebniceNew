# src/app/ - AI Context

## 🎯 PURPOSE

Next.js 14 App Router directory containing all pages, layouts, and API routes. This is the routing backbone of the application.

## 📦 EXPORTS

No direct exports. This folder defines:

- Page routes (via `page.tsx` files)
- Layouts (via `layout.tsx` files)
- API endpoints (via `route.ts` in `/api/`)

## 🔗 DEPENDENCIES

- `@/lib/auth` - Authentication
- `@/lib/prisma` - Database access
- `@/components/*` - UI components
- `@/data/*` - Static data

## 🏗️ PATTERNS

### Route Groups

- `(auth)` - Authentication related pages
- Dynamic routes: `[chapterId]`, `[id]`, `[hackathonId]`

### Page Structure

```typescript
// Server Component page (default)
export default async function Page() {
  const session = await getServerSession(authOptions)
  // ...render
}

// With params
export default async function Page({ params }: { params: { id: string } }) {
  // ...
}
```

### Layout Pattern

```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>
}
```

## ⚠️ GOTCHAS

1. **Server Components default**: Pages are Server Components unless `'use client'` is added
2. **API route file names**: Must be `route.ts`, not `index.ts`
3. **Dynamic imports**: Heavy components (Three.js, PDF) should use `next/dynamic`
4. **Metadata**: Export `metadata` object for SEO
5. **Loading states**: Use `loading.tsx` for Suspense boundaries

## 📁 STRUCTURE

```
app/
├── layout.tsx          # Root layout (providers, fonts)
├── page.tsx            # Landing page (/)
├── api/                # API routes
│   ├── auth/          # NextAuth endpoints
│   ├── chapters/      # Chapter progress
│   ├── progress/      # XP & completion
│   ├── user/          # User profile
│   ├── admin/         # Admin endpoints
│   ├── questions/     # Quiz answers
│   ├── projects/      # Project submissions
│   ├── tests/         # Module tests
│   ├── hackathons/    # Arena hackathons
│   ├── teams/         # Team management
│   ├── graduates/     # Graduate profiles
│   └── ...
├── auth/              # Auth pages (signin, signup)
├── chapters/          # Chapter listing & detail
│   └── [chapterId]/   # Dynamic chapter page
├── admin/             # Admin dashboard
│   ├── achievements/
│   ├── chapters/
│   ├── hackathons/
│   ├── users/
│   └── analytics/
├── arena/             # Hackathon & graduate section
│   ├── hackathon/[hackathonId]/
│   └── graduate/[graduateId]/
├── profile/           # User profile page
├── leaderboard/       # XP leaderboard
├── achievements/      # Badge showcase
├── certificate/       # Completion certificate
├── onboarding/        # New user onboarding
├── demo/              # Demo/showcase page
└── api-docs/          # Swagger API documentation
```

## 🔄 RELATED

- `src/components/` - Components used by pages
- `src/lib/auth.ts` - Auth configuration
- `public/` - Static assets for pages

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: layout.tsx, api/ -->
