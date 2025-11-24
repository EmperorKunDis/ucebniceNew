# Quick Start - Get Your Admin Panel Running

## 🚀 3 Simple Steps

### Step 1: Create `.env` File

Create a file named `.env` in the project root:

```bash
# Database
DATABASE_URL="postgresql://ucebnice_user:changeme123@localhost:5432/ucebnice_db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Generate a secure NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### Step 2: Setup Database

```bash
# Apply the database migration
npx prisma migrate dev

# Seed with chapters
npm run db:seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 3: Make Yourself Admin

**Option A: Using the script** (Easiest)

```bash
# First, create your account on the website
npm run dev
# Go to http://localhost:3000 and register

# Then run the script
tsx scripts/make-admin.ts your@email.com
```

**Option B: Using Prisma Studio**

```bash
npx prisma studio
```

1. Click on "User" table
2. Find your user
3. Set `isAdmin` to `true`
4. Save

**Option C: Using SQL**

```bash
# Connect to your database
psql -U ucebnice_user -d ucebnice_db

# Run this SQL
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

### Step 4: Access Admin Panel 🎉

```bash
npm run dev
```

Then visit: **http://localhost:3000/admin**

## 📁 What Was Built

### Database Changes

- ✅ Renamed `Lesson` → `Chapter` (fixed naming issue)
- ✅ Added `isAdmin` field to User model
- ✅ Updated all API routes

### Admin Features

- 📊 Dashboard with platform statistics
- 👥 User management (view, search, delete)
- 📚 Chapter management (view, delete)
- 🏆 Achievement viewer
- 📈 Analytics with completion rates

### API Endpoints

All at `/api/admin/*`:

- Users CRUD
- Chapters CRUD
- Achievements list
- Analytics data

## 🔍 Quick Tour

### Admin Dashboard (`/admin`)

Shows:

- Total users & active users
- Chapter & achievement counts
- Completion statistics
- Top 10 users by XP
- Quick navigation links

### Users Page (`/admin/users`)

- Search by email/name/username
- View XP, level, progress
- See admin status
- Delete users

### Chapters Page (`/admin/chapters`)

- View all chapters in order
- See completion statistics
- Delete chapters

### Analytics Page (`/admin/analytics`)

- Chapter completion rates
- Most popular achievements
- Visual progress bars

## 📝 Understanding Your Database

### View Data

**Prisma Studio** (Visual Interface):

```bash
npx prisma studio
```

**Admin Dashboard** (Your New Interface):

```
http://localhost:3000/admin
```

### Update Data

**Add Chapters**:

1. Edit `src/data/chapters.ts`
2. Run `npm run db:seed`

**Make User Admin**:

```bash
tsx scripts/make-admin.ts email@example.com
```

**Reset User Progress**:

```bash
npx prisma studio
# Delete from CompletedChapter and ChapterCompletion tables
```

## 🐛 Troubleshooting

### "Cannot access /admin"

→ Make sure `isAdmin = true` in database

### "User not found" in admin script

→ Create account on website first

### Migration fails

→ Check DATABASE_URL in `.env`
→ Ensure PostgreSQL is running

### API returns 500 error

→ Check terminal for error messages
→ Verify Prisma Client is generated: `npx prisma generate`

## 📖 Full Documentation

For complete details, see:

- **ADMIN_SETUP_GUIDE.md** - Comprehensive guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details

## 🎯 Common Tasks

**Add another admin:**

```bash
tsx scripts/make-admin.ts other@email.com
```

**View database:**

```bash
npx prisma studio
```

**Reset database:**

```bash
npx prisma migrate reset
npm run db:seed
```

**Check if user is admin:**

```bash
npx prisma studio
# Look at User table, check isAdmin column
```

## ✨ What's Next

Your admin panel is fully functional! Consider adding:

- Edit user modal (change XP/level)
- Create chapter form
- Bulk operations
- Advanced charts
- Export to CSV
- Activity logs

---

**Questions?** Check ADMIN_SETUP_GUIDE.md for detailed explanations.

**Ready?** Follow the 3 steps above and you'll have your admin panel running in minutes! 🚀
