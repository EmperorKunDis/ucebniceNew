# src/app/arena/ - AI Context

## 🎯 PURPOSE

"Apex Arena" - Platform section for hackathons and graduate showcases. Users can participate in hackathons, form teams, submit projects, and graduates can showcase their profiles to potential employers.

## 📦 EXPORTS

No direct exports. Contains arena pages.

## 🔗 DEPENDENCIES

- `@/lib/prisma` - Database access
- `next-auth` - User session
- Arena-related API routes

## 🏗️ PATTERNS

### Arena Page Structure

```typescript
// Main arena page - lists hackathons and graduates
export default async function ArenaPage() {
  const hackathons = await prisma.hackathon.findMany({
    orderBy: { startDate: 'desc' },
  })
  const graduates = await prisma.graduateProfile.findMany({
    include: { user: true },
  })
  // ...
}
```

### Hackathon States

- `upcoming` - Registration open
- `active` - Competition in progress
- `completed` - Results available

### Team Flow

1. User creates team for hackathon
2. Team members join via invite
3. Team submits project before deadline
4. Judges score projects
5. Winners announced

## ⚠️ GOTCHAS

1. **Auth required**: Most arena features require authentication
2. **Team limits**: `maxTeamSize` on hackathon defines member limit
3. **One team per hackathon**: User can only be in one team per hackathon
4. **Graduate profile**: Created after completing all chapters

## 📁 STRUCTURE

```
arena/
├── layout.tsx              # Arena section layout
├── page.tsx                # Main arena page
├── hackathon/
│   └── [hackathonId]/
│       └── page.tsx        # Hackathon detail & registration
└── graduate/
    └── [graduateId]/
        └── page.tsx        # Graduate profile page
```

## 🔄 RELATED

- `src/app/api/hackathons/` - Hackathon API endpoints
- `src/app/api/teams/` - Team management API
- `src/app/api/graduates/` - Graduate profile API
- `prisma/schema.prisma` - Arena models
- `src/types/arena.ts` - TypeScript types

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: page.tsx -->
