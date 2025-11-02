# UcebniceNew - Complete Setup & Stabilization Guide

**Project Owner:** Martin Svanda
**Last Updated:** October 2025
**Status:** ✅ Production Ready (with optional enhancements)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Required vs Optional Features](#required-vs-optional-features)
4. [Database Configuration](#database-configuration)
5. [Security Features](#security-features)
6. [Performance Optimizations](#performance-optimizations)
7. [Testing & Verification](#testing--verification)
8. [Deployment Checklist](#deployment-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- SQLite (default) or PostgreSQL for production

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env .env.local
# Edit .env.local with your actual values

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run dev
```

The application will be running at `http://localhost:3000`

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following **required** variables:

```bash
# Database (Required)
DATABASE_URL="file:./dev.db"  # SQLite for development

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long"  # Generate: openssl rand -base64 32
```

### Optional Environment Variables

These variables enable additional features but are **not required** for the app to function:

#### OAuth Providers (Optional)

Enable Google and/or GitHub authentication:

```bash
# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**How to get OAuth credentials:**

1. **Google:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **GitHub:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - New OAuth App
   - Add callback URL: `http://localhost:3000/api/auth/callback/github`

#### Rate Limiting with Upstash Redis (Highly Recommended)

Enable rate limiting to protect your API from abuse:

```bash
# Upstash Redis (Optional but HIGHLY recommended for production)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

**How to get Upstash Redis:**

1. Go to [Upstash.com](https://upstash.com/)
2. Create a free account
3. Create a new Redis database
4. Copy the REST URL and token from the database details

**Without Redis:**

- App will work normally
- Rate limiting will be disabled
- Console will show warnings
- Production use is NOT recommended without rate limiting

#### Error Tracking with Sentry (Optional)

Enable error monitoring and logging:

```bash
# Sentry (Optional)
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-auth-token"
```

**How to set up Sentry:**

1. Go to [Sentry.io](https://sentry.io/)
2. Create a free account
3. Create a new Next.js project
4. Copy the DSN from project settings

---

## Required vs Optional Features

### ✅ Features that WORK OUT OF THE BOX (without any optional config):

- ✅ User registration and login (email/password)
- ✅ Protected routes and authentication
- ✅ Chapter progression and completion
- ✅ XP and leveling system
- ✅ Achievement system
- ✅ Streak tracking
- ✅ Leaderboard
- ✅ User profiles and statistics
- ✅ Error boundaries and error handling
- ✅ Security headers and CSP
- ✅ Input validation (Zod schemas)
- ✅ Database indexes for performance
- ✅ Responsive design

### ⚠️ Features that require optional setup:

- ⚠️ **Google/GitHub OAuth** - Requires OAuth credentials
- ⚠️ **Rate Limiting** - Requires Upstash Redis (highly recommended)
- ⚠️ **Error Monitoring** - Requires Sentry (recommended)

---

## Database Configuration

### Development (SQLite)

SQLite is perfect for development and testing:

```bash
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL - Recommended)

For production, migrate to PostgreSQL:

```bash
# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"  # Changed from "sqlite"
  url      = env("DATABASE_URL")
}

# Set PostgreSQL URL
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Run migration
npx prisma migrate deploy
```

**PostgreSQL hosting options:**

- Vercel Postgres (recommended for Vercel deployments)
- Railway.app
- Supabase
- AWS RDS
- Neon.tech

### Database Indexes

The following indexes have been added for optimal performance:

**User table:**

- `xp` - for leaderboard queries
- `level` - for level-based filtering
- `createdAt` - for user registration analytics

**Lesson table:**

- `chapterId` - for chapter lookups
- `difficulty` - for difficulty filtering
- `order` - for ordered lesson retrieval

**CompletedLesson table:**

- `userId` - for user progress queries
- `lessonId` - for lesson completion stats
- `completedAt` - for recent activity

**LessonProgress table:**

- `userId` - for user progress tracking
- `lessonId` - for lesson-specific progress
- `lastUpdated` - for recent activity

**UserAchievement table:**

- `userId` - for user achievements
- `achievementId` - for achievement stats
- `unlockedAt` - for recent unlocks

**CognitiveGlitchAttempt table:**

- `userId` - for user attempts
- `challengeId` - for challenge stats
- `attemptedAt` - for recent attempts

---

## Security Features

### ✅ Implemented Security Measures:

1. **Authentication & Authorization**
   - NextAuth.js with secure session handling
   - JWT-based sessions (stateless)
   - Password hashing with bcrypt (12 rounds)
   - Protected routes via middleware

2. **Input Validation**
   - Zod schemas for all API inputs
   - Type-safe validation
   - Comprehensive error messages
   - SQL injection protection via Prisma ORM

3. **Security Headers** (automatically applied in production)
   - `Strict-Transport-Security` (HSTS)
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Content-Security-Policy` (CSP)
   - `Referrer-Policy: origin-when-cross-origin`
   - `Permissions-Policy`

4. **Rate Limiting** (when Redis is configured)
   - Auth endpoints: 10 requests / 15 minutes
   - Progress API: 100 requests / hour
   - General API: 100 requests / hour
   - XP updates: 50 requests / hour
   - Achievement checks: 200 requests / hour

5. **Error Handling**
   - Error boundaries for React errors
   - Sentry integration for error tracking
   - Sanitized error messages for users
   - Detailed logging in development

6. **HTTPS Enforcement**
   - Required in production
   - HSTS header for browser enforcement

---

## Performance Optimizations

### ✅ Implemented Optimizations:

1. **Database**
   - Comprehensive indexing strategy
   - Optimized queries with proper `select` statements
   - Prisma connection pooling
   - Pagination for large datasets

2. **Frontend**
   - React Server Components (RSC)
   - Client components only where needed
   - Next.js Image optimization
   - Bundle analyzer available (`npm run analyze`)

3. **Caching**
   - Static page generation where possible
   - API route optimization
   - Image optimization

4. **Code Splitting**
   - Automatic code splitting by route
   - Dynamic imports for heavy components
   - Optimized package imports (Lucide, Framer Motion, Radix UI)

5. **Build Optimizations**
   - SWC minification
   - Console removal in production (errors/warnings kept)
   - Compressed assets
   - Production source maps disabled

---

## Testing & Verification

### Manual Testing Checklist

Test these critical user flows:

- [ ] **Registration**
  - Register with email/password
  - Verify password requirements enforced
  - Check duplicate email/username prevention

- [ ] **Authentication**
  - Login with credentials
  - Protected routes redirect to login
  - Session persists across page reloads
  - Logout works correctly

- [ ] **Chapter Progression**
  - View chapters list
  - Complete a chapter
  - Verify XP gained
  - Check level up if applicable
  - Verify streak incremented

- [ ] **Achievements**
  - Complete first chapter (should unlock achievement)
  - View achievements page
  - Verify achievement notifications

- [ ] **Leaderboard**
  - View leaderboard
  - Filter by period (daily, weekly, monthly, all-time)
  - Verify correct ranking

- [ ] **User Profile**
  - View profile stats
  - Check XP and level display
  - Verify streak count
  - View completed chapters

### Automated Testing

```bash
# Run tests (if configured)
npm run test

# Run E2E tests (if configured)
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All required environment variables set
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database migrated (if using PostgreSQL)
- [ ] OAuth providers configured (if using)
- [ ] Upstash Redis configured (highly recommended)
- [ ] Sentry configured (recommended)

### Vercel Deployment

1. **Connect Repository**

   ```bash
   vercel login
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set `DATABASE_URL` to PostgreSQL connection string

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] Registration works
- [ ] Login works
- [ ] Protected routes require authentication
- [ ] OAuth works (if configured)
- [ ] Rate limiting works (if configured)
- [ ] Error tracking works (if configured)
- [ ] HTTPS is enforced
- [ ] Security headers present (check with securityheaders.com)

---

## Troubleshooting

### Common Issues

#### "Invalid environment variables"

**Solution:** Check that all required variables are set:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET` (min 32 characters)

#### "Prisma Client not generated"

**Solution:**

```bash
npx prisma generate
```

#### "Database connection failed"

**Solution:**

```bash
# Verify DATABASE_URL format
# For SQLite: file:./dev.db
# For PostgreSQL: postgresql://user:pass@host:5432/db

# Re-run migrations
npx prisma migrate dev
```

#### "Rate limiting not working"

**Solution:** Check if Upstash Redis is configured:

```bash
# If not set, rate limiting will be disabled (development mode)
UPSTASH_REDIS_REST_URL="your-url"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

#### "OAuth providers not showing"

**Solution:** Verify OAuth credentials are set in `.env.local`:

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
# and/or
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

#### "Build errors during deployment"

**Solution:**

```bash
# Check TypeScript errors
npm run type-check

# Check linting
npm run lint

# Build locally first
npm run build
```

---

## Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

### Package Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:debug        # Start with debugging

# Building
npm run build            # Production build
npm run start            # Start production server
npm run analyze          # Analyze bundle size

# Database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma migrate dev   # Create and apply migration
npx prisma generate      # Generate Prisma Client

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:debug   # Debug E2E tests

# Storybook
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook
```

---

## Status Summary

### ✅ Completed & Verified

1. ✅ **Database Schema** - Optimized with proper indexes
2. ✅ **Authentication** - NextAuth with multi-provider support
3. ✅ **Input Validation** - Zod schemas implemented
4. ✅ **Error Handling** - Error boundaries and Sentry integration
5. ✅ **Security Headers** - Full CSP and security headers
6. ✅ **Rate Limiting** - Implemented (requires Redis)
7. ✅ **Gamification** - XP, levels, achievements, streaks all working
8. ✅ **API Documentation** - Swagger documentation in place
9. ✅ **Performance** - Database indexes and optimizations
10. ✅ **Error Logging** - Sentry integration ready

### ⚠️ Optional Enhancements

- Configure Upstash Redis for rate limiting (recommended for production)
- Configure Sentry for error tracking (recommended)
- Set up OAuth providers (optional)
- Migrate to PostgreSQL for production (recommended)
- Add E2E test coverage (optional)
- Set up CI/CD pipeline (optional)

---

**The application is production-ready with core features fully functional!**
Optional enhancements can be added as needed based on requirements.
