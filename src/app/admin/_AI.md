# src/app/admin/ - AI Context

## 🎯 PURPOSE

Admin dashboard for managing the platform. Requires `isAdmin` flag on user. Provides CRUD operations for chapters, achievements, hackathons, and user management.

## 📦 EXPORTS

No direct exports. Contains admin pages and layouts.

## 🔗 DEPENDENCIES

- `@/lib/admin-auth` - Admin authentication helpers
- `@/lib/prisma` - Database access
- `next-auth` - Session verification

## 🏗️ PATTERNS

### Admin Page Protection

```typescript
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user?.isAdmin) {
    redirect('/') // Not admin
  }

  // ... render admin UI
}
```

### Admin Layout

The `layout.tsx` provides consistent admin navigation sidebar.

## ⚠️ GOTCHAS

1. **isAdmin flag**: Must be set directly in database (no self-service admin)
2. **Server-side check**: Always verify admin status server-side, not just client
3. **API routes**: Admin API endpoints (`/api/admin/*`) have separate auth checks
4. **No role system**: Binary admin/non-admin only

## 📁 STRUCTURE

```
admin/
├── layout.tsx         # Admin layout with sidebar
├── page.tsx           # Admin dashboard home
├── achievements/
│   └── page.tsx       # Manage achievements
├── chapters/
│   └── page.tsx       # Manage chapters
├── hackathons/
│   ├── page.tsx       # List hackathons
│   ├── new/page.tsx   # Create hackathon
│   ├── [id]/
│   │   ├── page.tsx   # View hackathon
│   │   └── edit/page.tsx # Edit hackathon
│   └── components/
│       └── hackathon-form.tsx
├── users/
│   └── page.tsx       # User management
└── analytics/
    └── page.tsx       # Platform analytics
```

## 🔄 RELATED

- `src/app/api/admin/` - Admin API endpoints
- `src/lib/admin-auth.ts` - Admin auth helpers
- `prisma/schema.prisma` - `User.isAdmin` field

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: layout.tsx -->
