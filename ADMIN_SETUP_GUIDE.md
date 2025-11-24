# Admin Setup Guide

## Overview

This guide explains the database refactoring and admin system that has been implemented for your learning platform.

## What Was Changed

### 1. Database Schema Refactoring

**Problem**: The database used "Lesson" terminology while the application used "Chapter"

**Solution**: Renamed all database models for consistency

- `Lesson` → `Chapter`
- `CompletedLesson` → `CompletedChapter`
- `LessonProgress` → `ChapterProgress`
- Added `isAdmin` boolean field to User model

**Files Modified**:

- `prisma/schema.prisma` - Updated all model definitions
- `prisma/seed.ts` - Changed to use `prisma.chapter`
- `src/app/api/progress/complete-chapter/route.ts` - Updated database calls
- `src/app/api/user/stats/route.ts` - Updated database calls

**Legacy Files Archived**:

- `prisma/dev.db` → `old_deprecated/dev.db.backup`

### 2. Admin System Implementation

#### Backend (API Routes)

Created admin-protected API endpoints:

**Admin Middleware**: `/src/lib/admin-auth.ts`

- `requireAdmin()` - Checks if user has isAdmin=true
- `isAdmin()` - Returns boolean for admin status

**User Management APIs**:

- `GET /api/admin/users` - List all users with pagination/search
- `GET /api/admin/users/[id]` - Get single user details
- `PUT /api/admin/users/[id]` - Update user (XP, level, isAdmin, etc.)
- `DELETE /api/admin/users/[id]` - Delete user

**Chapter Management APIs**:

- `GET /api/admin/chapters` - List all chapters with stats
- `POST /api/admin/chapters` - Create new chapter
- `GET /api/admin/chapters/[id]` - Get chapter details
- `PUT /api/admin/chapters/[id]` - Update chapter
- `DELETE /api/admin/chapters/[id]` - Delete chapter

**Achievement Management APIs**:

- `GET /api/admin/achievements` - List all achievements
- `POST /api/admin/achievements` - Create new achievement

**Analytics API**:

- `GET /api/admin/analytics` - Comprehensive platform statistics

#### Frontend (Admin Dashboard)

Created admin interface at `/admin`:

- `/admin` - Dashboard overview with key metrics
- `/admin/users` - User management table
- `/admin/chapters` - Chapter management table
- `/admin/achievements` - Achievement viewer
- `/admin/analytics` - Detailed analytics and charts

**Features**:

- Protected routes (requires isAdmin=true)
- Navigation sidebar
- Pagination and search
- Real-time data fetching
- Delete functionality

## Next Steps - IMPORTANT

### Step 1: Set Up Your Database

The migration has been prepared but NOT YET APPLIED to your database.

**Option A: Using PostgreSQL (Recommended)**

1. Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://ucebnice_user:changeme123@localhost:5432/ucebnice_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
```

2. Start your PostgreSQL database (if using Docker):

```bash
docker-compose up -d
```

3. Run the migration:

```bash
npx prisma migrate dev
```

4. Seed the database with chapters:

```bash
npm run db:seed
```

**Option B: Using SQLite (For Development)**

1. Temporarily change `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Run migration and seed:

```bash
npx prisma migrate dev
npm run db:seed
```

### Step 2: Make Yourself an Admin

After the database is set up and you've created your account, you need to set `isAdmin=true` for your user.

**Method 1: Using Prisma Studio** (Easiest)

```bash
npx prisma studio
```

- Navigate to the User table
- Find your user record
- Set `isAdmin` to `true`
- Save

**Method 2: Using SQL**

PostgreSQL:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

SQLite:

```sql
UPDATE User SET isAdmin = 1 WHERE email = 'your@email.com';
```

**Method 3: Create a one-time script**

Create `scripts/make-admin.ts`:

```typescript
import { prisma } from '../src/lib/prisma'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: tsx scripts/make-admin.ts your@email.com')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  })

  console.log(`✅ ${user.email} is now an admin!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run it:

```bash
tsx scripts/make-admin.ts your@email.com
```

### Step 3: Access the Admin Panel

1. Start your development server:

```bash
npm run dev
```

2. Sign in to your account

3. Navigate to: `http://localhost:3000/admin`

You should now see the admin dashboard!

## Folder Structure

```
src/
├── app/
│   ├── admin/                      # Admin pages
│   │   ├── layout.tsx              # Admin layout with nav
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── users/page.tsx          # User management
│   │   ├── chapters/page.tsx       # Chapter management
│   │   ├── achievements/page.tsx   # Achievement viewer
│   │   └── analytics/page.tsx      # Analytics page
│   └── api/
│       └── admin/                  # Admin API routes
│           ├── users/route.ts
│           ├── users/[id]/route.ts
│           ├── chapters/route.ts
│           ├── chapters/[id]/route.ts
│           ├── achievements/route.ts
│           └── analytics/route.ts
├── lib/
│   └── admin-auth.ts               # Admin middleware
└── prisma/
    ├── schema.prisma               # Updated schema
    └── seed.ts                     # Updated seed script
```

## Understanding the Prisma Folder

### `prisma/schema.prisma`

**Purpose**: Defines your database structure

**Key sections**:

- `datasource db` - Database connection config
- `generator client` - Prisma Client generation
- `model User` - User table with isAdmin field
- `model Chapter` - Renamed from Lesson
- `model CompletedChapter` - Tracks completions
- `model ChapterCompletion` - 3-star system
- Other models for achievements, progress, etc.

### `prisma/migrations/`

**Purpose**: Version control for database changes

Each migration folder contains SQL commands that modify the database schema.

### `prisma/seed.ts`

**Purpose**: Populate database with initial data

Run with: `npm run db:seed`

### `prisma/dev.db` (if using SQLite)

**Purpose**: Local development database file

This is the actual database (archived to old_deprecated/ in your case).

## Viewing Database Data

### Option 1: Prisma Studio (GUI)

```bash
npx prisma studio
```

Opens a browser interface to view/edit all tables.

### Option 2: Admin Dashboard

Navigate to `http://localhost:3000/admin` to view data through your new admin interface.

### Option 3: Direct Database Access

PostgreSQL:

```bash
psql -U ucebnice_user -d ucebnice_db
```

SQLite:

```bash
sqlite3 prisma/dev.db
```

## Updating Database Data

### Through Admin Interface

- **Users**: `/admin/users` - View, delete users
- **Chapters**: `/admin/chapters` - View, delete chapters
- **Achievements**: `/admin/achievements` - View achievements
- **Analytics**: `/admin/analytics` - View statistics

### Through Prisma Studio

```bash
npx prisma studio
```

Full CRUD operations on all tables.

### Through API

Use the admin API endpoints documented above.

### Direct Database Queries

Use SQL commands through `psql` or `sqlite3`.

## Common Tasks

### Add a New Chapter

1. Add to `src/data/chapters.ts`
2. Run `npm run db:seed`
3. Or use `/admin/chapters` to create via UI (future feature)

### Reset User Progress

```typescript
// Delete all completions for a user
await prisma.completedChapter.deleteMany({
  where: { userId: 'user-id-here' },
})

await prisma.chapterCompletion.deleteMany({
  where: { userId: 'user-id-here' },
})

// Reset XP and level
await prisma.user.update({
  where: { id: 'user-id-here' },
  data: { xp: 0, level: 1 },
})
```

### Make Another User Admin

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'another@email.com';
```

### View Top Users by XP

```sql
SELECT name, email, xp, level
FROM "User"
ORDER BY xp DESC
LIMIT 10;
```

## Troubleshooting

### "User is not admin" error

- Verify `isAdmin` is set to `true` in database
- Check you're signed in with the correct account
- Clear cookies and sign in again

### Migration fails

- Ensure DATABASE_URL is correct in `.env`
- Check database is running (for PostgreSQL)
- Try `npx prisma migrate reset` (WARNING: deletes all data)

### Pages show "Loading..." forever

- Check browser console for errors
- Verify API routes are working: `curl http://localhost:3000/api/admin/users`
- Ensure you're signed in as admin

## Security Notes

- **IMPORTANT**: Never commit your `.env` file to Git
- Keep your `NEXTAUTH_SECRET` secure
- Only give admin access to trusted users
- Admin API routes are protected by middleware
- Frontend pages check admin status on server-side

## Future Enhancements

Potential features to add:

- [ ] Edit user modal (change XP, level, etc.)
- [ ] Create/edit chapters through UI
- [ ] Award achievements manually
- [ ] View individual user progress details
- [ ] Export data to CSV
- [ ] Activity logs and audit trail
- [ ] Role-based permissions (admin, teacher, moderator)
- [ ] Bulk operations (delete multiple users)
- [ ] Advanced filtering and sorting
- [ ] Charts and graphs for analytics

## Summary

You now have:

- ✅ Consistent database naming (Chapter instead of Lesson)
- ✅ Admin authentication system
- ✅ Full-featured admin API
- ✅ Admin dashboard interface
- ✅ User management capabilities
- ✅ Chapter and achievement viewing
- ✅ Analytics and statistics

**Next**: Follow Step 1, 2, and 3 above to get your admin panel running!
