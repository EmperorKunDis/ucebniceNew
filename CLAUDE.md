# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Navigation System

This codebase uses a hierarchical `_AI.md` documentation system for AI agents:

1. **Always read `_AI_INDEX.md` first** - Master navigation and quick reference
2. **Navigate to target folder** - Read `_AI.md` files along the path
3. **On the path**: Focus on PURPOSE, EXPORTS, GOTCHAS sections
4. **At target**: Read full `_AI.md` file and CRITICAL files
5. **Before changes**: Check RELATED folders

### Documentation Files

- `_AI_INDEX.md` - Master index with architecture overview
- `src/_AI.md` - Source folder overview
- `src/lib/_AI.md` - Core utilities and business logic
- `src/app/_AI.md` - Pages and API routes
- `src/app/api/_AI.md` - Backend API patterns
- `src/components/_AI.md` - React components
- `src/store/_AI.md` - State management
- `src/data/_AI.md` - Static data
- `src/types/_AI.md` - TypeScript definitions
- `prisma/_AI.md` - Database schema

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
npm run format:check     # Check code formatting
npm run type-check       # Check TypeScript types
```

### Testing

```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:report  # View E2E test report
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

### VPS Docker Compose Deployment

```bash
make compose-config      # Validate local Docker Compose config
make compose-config-prod # Validate production Compose config
make up                  # Start local Compose stack
make up-prod             # Start production Compose stack on VPS
make migrate             # Run Prisma migrate deploy in app container
make logs                # View app logs
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
- **Deployment**: VPS Docker Compose with Caddy reverse proxy and persistent PostgreSQL/media volumes

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
- `VIDEO_FILES_DIR`: Runtime directory for video files (default `/data/videa`)
- `GEMINI_API_KEY`: Project review provider key
- `GEMINI_REVIEW_MODEL`: Gemini project review model override
- `AI_TUTOR_MODEL`: OpenAI tutor model override

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

### Development Workflow Patterns

**Component Development**:

- UI components in `src/components/ui/` use custom design system with glass morphism effects
- Chapter components in `src/components/chapters/` handle educational content rendering
- Auth components follow NextAuth.js patterns with custom UI

**API Route Patterns**:

- All routes use standardized error handling via `api-middleware.ts`
- Admin routes require `isAdmin` flag validation
- Rate limiting applied to sensitive endpoints (auth, submissions)

**Storybook Integration**:

- Components documented with Storybook (`npm run storybook`)
- Stories available for UI components and design system elements
