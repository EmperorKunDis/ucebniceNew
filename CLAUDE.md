# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive AI-powered programming education platform built with Next.js 14, PostgreSQL, and modern web technologies. Features gamification, video lessons, 3D visualizations, and comprehensive tracking of student progress.

## Common Development Commands

### Development
```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Create production build
npm start                # Run production server
```

### Code Quality
```bash
npm run lint             # Run ESLint checks
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:debug   # Debug E2E tests
```

### Database Operations
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations in development
npx prisma migrate deploy # Run migrations in production
npx prisma studio        # Open database GUI
npx prisma migrate reset # Reset database (CAUTION: deletes all data)
npm run db:seed          # Seed database with initial data
```

### Kubernetes Deployment (via Makefile)
```bash
make build               # Build Docker image
make push                # Push to Harbor registry
make deploy-staging      # Deploy to staging environment
make deploy-production   # Deploy to production
make logs-staging        # View staging logs
make logs-production     # View production logs
```

## Architecture & Key Concepts

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, NextAuth.js for authentication
- **Database**: PostgreSQL with Prisma ORM
- **State**: Zustand for client state, TanStack Query for server state
- **3D**: Three.js with React Three Fiber for interactive visualizations
- **Testing**: Jest for unit tests, Playwright for E2E
- **Monitoring**: Sentry for error tracking
- **Rate Limiting**: Upstash Redis

### Core Data Models

**User System**: User authentication with NextAuth, supporting email/password and OAuth. Users have XP, levels, streaks, and achievement tracking.

**Chapter System**: Educational content organized into chapters with:
- Video lessons (stored in `data/videa/`)
- Markdown content (in `public/prednasky/`)
- Questions with multiple choice answers
- Project submissions
- XP rewards and difficulty ratings

**Gamification**: 
- XP and level progression
- Achievement/badge system with different rarities
- Streak tracking for daily engagement
- Module tests every 10 chapters
- 3-star completion system per chapter (completion, questions, project)

### API Architecture

All API routes follow RESTful patterns under `/app/api/`:
- Authentication endpoints use NextAuth.js
- Admin endpoints require `isAdmin` flag
- Rate limiting via Upstash Redis on sensitive endpoints
- Validation with Zod schemas
- Consistent error handling with API middleware

### Key Environment Variables

Required for development:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Session encryption key
- `NEXTAUTH_URL`: Application URL
- `UPSTASH_REDIS_REST_URL`: Rate limiting Redis URL
- `UPSTASH_REDIS_REST_TOKEN`: Redis auth token

Optional:
- `SENTRY_DSN`: Error tracking
- `SENTRY_AUTH_TOKEN`: Sentry deployment tracking

### Testing Strategy

**Unit Tests**: Component logic, utility functions, API middleware
**E2E Tests**: Full user flows including auth, chapter completion, achievements
**Test Database**: E2E tests use separate test database with automatic cleanup

### TypeScript Configuration

Strict mode enabled with additional safety checks:
- `noUnusedLocals` and `noUnusedParameters`
- `noImplicitReturns` 
- `noUncheckedIndexedAccess` for safer array/object access
- Path alias `@/*` maps to `src/*`

### Performance Optimizations

- Dynamic imports for heavy components (certificate generator, 3D scenes)
- React.memo for frequently rendered components
- Image optimization with Next.js Image
- Database indexes on frequently queried fields
- Bundle analysis available via `npm run analyze`