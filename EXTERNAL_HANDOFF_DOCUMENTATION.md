# UcebniceNew Platform - Technical Handoff Documentation

**Project Owner:** Martin Svanda
**Document Date:** October 2025
**Purpose:** Comprehensive technical documentation for external development team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Components Catalog](#components-catalog)
7. [API Routes & Server Actions](#api-routes--server-actions)
8. [Features Implementation](#features-implementation)
9. [Configuration & Environment](#configuration--environment)
10. [Code Quality & Standards](#code-quality--standards)
11. [Performance Optimization](#performance-optimization)
12. [Security Considerations](#security-considerations)
13. [Deployment Guidelines](#deployment-guidelines)
14. [Recommendations for Final Adjustments](#recommendations-for-final-adjustments)

---

## Executive Summary

**UcebniceNew** is a modern educational platform built with Next.js 14, designed to deliver interactive programming courses with a gamified learning experience. The platform features:

- **40 educational chapters** with video lectures and Google Colab integration
- **Gamification system** with XP, levels, achievements, and leaderboards
- **Multi-provider authentication** (Google, GitHub, credentials)
- **Progress tracking** with streak counting and completion statistics
- **Modern UI/UX** with glass morphism effects, animations, and responsive design

### Current Status

- **Production Ready:** Yes (with recommendations for scaling)
- **Test Coverage:** Partial (needs expansion)
- **Database:** SQLite (recommended migration to PostgreSQL for production)
- **Deployment:** Ready for Vercel/similar platforms

---

## Architecture Overview

### Project Structure

```
ucebniceNew/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── chapters/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   └── stats/
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── achievements/
│   │   ├── leaderboard/
│   │   ├── progress/
│   │   └── user/
│   └── layout.tsx                # Root layout
├── components/                    # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard-specific components
│   ├── landing/                  # Landing page components
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth configuration
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

### Design Patterns

1. **App Router Pattern** - Utilizing Next.js 14 App Router for file-based routing
2. **Server Components** - Default server-side rendering for performance
3. **Client Components** - Strategic use for interactivity (`'use client'`)
4. **Atomic Design** - Component organization (atoms → molecules → organisms)
5. **Repository Pattern** - Database operations through Prisma client
6. **API Routes** - RESTful endpoints for data operations

### Data Flow

```
User Request
    ↓
Next.js Middleware (auth check)
    ↓
Server Component / API Route
    ↓
Prisma ORM
    ↓
SQLite Database
    ↓
Response (JSON / RSC payload)
    ↓
Client Component (if interactive)
```

---

## Technology Stack

### Frontend

- **Next.js 14.0.4** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5.x** - Static typing
- **TailwindCSS 3.x** - Utility-first CSS framework
- **Framer Motion 11.x** - Animation library
- **React Hook Form 7.x** - Form management
- **Radix UI** - Accessible component primitives

### Backend & Database

- **Prisma ORM 5.x** - Type-safe database client
- **SQLite** - Embedded database (current)
- **NextAuth.js 4.x** - Authentication solution
- **Bcrypt** - Password hashing
- **Zod** - Runtime validation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Git** - Version control

### Deployment

- **Vercel** (recommended) - Serverless deployment platform
- **Node.js 18+** - Runtime environment

---

## Database Schema

### Prisma Schema Overview

Location: `/prisma/schema.prisma`

#### User Model

```prisma
model User {
  id                String    @id @default(cuid())
  name              String?
  email             String    @unique
  emailVerified     DateTime?
  image             String?
  password          String?   // For credential auth
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Gamification
  xp                Int       @default(0)
  level             Int       @default(1)
  streak            Int       @default(0)
  lastActive        DateTime?

  // Relations
  accounts          Account[]
  sessions          Session[]
  progress          ChapterProgress[]
  achievements      UserAchievement[]
}
```

**Key Fields:**

- `id`: Unique identifier (CUID format)
- `email`: Unique email address
- `password`: Hashed password (bcrypt, 10 rounds)
- `xp`: Experience points (0-∞)
- `level`: User level (calculated from XP)
- `streak`: Consecutive days of activity

#### ChapterProgress Model

```prisma
model ChapterProgress {
  id          String   @id @default(cuid())
  userId      String
  chapterId   Int
  completed   Boolean  @default(false)
  completedAt DateTime?
  timeSpent   Int      @default(0)  // in seconds
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, chapterId])
  @@index([userId])
  @@index([chapterId])
}
```

**Purpose:** Tracks user progress through chapters

#### Achievement Model

```prisma
model Achievement {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  icon        String
  xpReward    Int
  category    String   // "learning", "streak", "social", etc.

  users       UserAchievement[]
}
```

**Categories:**

- `learning`: Chapter completion milestones
- `streak`: Daily activity streaks
- `social`: Leaderboard positions
- `special`: Unique achievements

#### UserAchievement Model

```prisma
model UserAchievement {
  id            String       @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime     @default(now())

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement  @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}
```

#### Account & Session Models

NextAuth.js standard models for OAuth and session management.

### Database Relationships

```
User (1) ←→ (N) ChapterProgress
User (1) ←→ (N) UserAchievement
Achievement (1) ←→ (N) UserAchievement
User (1) ←→ (N) Account
User (1) ←→ (N) Session
```

### Migration Strategy

**Current:** SQLite (`dev.db`)
**Recommended Production:** PostgreSQL

Migration path:

1. Update `schema.prisma` datasource to PostgreSQL
2. Set `DATABASE_URL` environment variable
3. Run `npx prisma migrate deploy`
4. Export SQLite data and import to PostgreSQL

---

## Authentication & Authorization

### NextAuth.js Configuration

Location: `/lib/auth.ts` and `/app/api/auth/[...nextauth]/route.ts`

#### Providers

1. **Google OAuth**
   - Client ID: `process.env.GOOGLE_CLIENT_ID`
   - Client Secret: `process.env.GOOGLE_CLIENT_SECRET`

2. **GitHub OAuth**
   - Client ID: `process.env.GITHUB_CLIENT_ID`
   - Client Secret: `process.env.GITHUB_CLIENT_SECRET`

3. **Credentials (Email/Password)**
   - Email validation
   - Bcrypt password verification
   - Custom login logic

#### Session Strategy

- **Type:** JWT (stateless)
- **Max Age:** 30 days
- **Update Age:** 24 hours

#### Session Enrichment

Custom session callback adds user data:

```typescript
session.user = {
  id: token.id,
  email: token.email,
  name: token.name,
  image: token.image,
  xp: token.xp,
  level: token.level,
  streak: token.streak,
}
```

#### Protected Routes

Middleware checks authentication for:

- `/chapters/*`
- `/profile/*`
- `/leaderboard/*`
- `/stats/*`
- `/api/*` (except `/api/auth/*`)

**Implementation:** `/middleware.ts`

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/chapters/:path*',
    '/profile/:path*',
    '/leaderboard/:path*',
    '/stats/:path*',
    '/api/:path*',
  ],
}
```

#### Password Security

- **Algorithm:** Bcrypt
- **Rounds:** 10
- **Min Length:** 8 characters (recommended: enforce in validation)

---

## Components Catalog

### Component Organization

**Total Components:** 60+
**Pattern:** Atomic Design (atoms → molecules → organisms → templates)

### Landing Page Components

#### 1. Hero Section (`/components/landing/Hero.tsx`)

**Purpose:** Main landing page header with CTA
**Features:**

- Gradient text effects
- Animated buttons
- Responsive layout
- Glass morphism design

**Props:** None (static content)

**Key Effects:**

- `motion.div` animations
- Gradient text with `bg-clip-text`
- Hover state transitions

#### 2. Features Grid (`/components/landing/Features.tsx`)

**Purpose:** Display platform features
**Features:**

- 6 feature cards
- Icon integration
- Glass morphism cards
- Hover effects

**Animation:** Stagger children animation on scroll

#### 3. Stats Section (`/components/landing/Stats.tsx`)

**Purpose:** Show platform statistics
**Features:**

- Animated counters
- Glass morphism design
- Responsive grid

**Stats Displayed:**

- Total users
- Completed chapters
- Hours of content
- Success rate

### Dashboard Components

#### 1. ChapterCard (`/components/dashboard/ChapterCard.tsx`)

**Purpose:** Display chapter information and progress
**Props:**

```typescript
interface ChapterCardProps {
  id: number
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  completed: boolean
  locked: boolean
  progress?: number
}
```

**Features:**

- Difficulty badges
- Lock state for sequential learning
- Progress indicator
- Hover animations

#### 2. ProgressCircle (`/components/dashboard/ProgressCircle.tsx`)

**Purpose:** Circular progress indicator
**Props:**

```typescript
interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}
```

**Implementation:** SVG circle with animated stroke

#### 3. XPBar (`/components/dashboard/XPBar.tsx`)

**Purpose:** Display XP progress to next level
**Props:**

```typescript
interface XPBarProps {
  currentXP: number
  requiredXP: number
  level: number
}
```

**Features:**

- Animated progress bar
- Level indicator
- XP count display

#### 4. AchievementBadge (`/components/dashboard/AchievementBadge.tsx`)

**Purpose:** Display achievement badges
**Props:**

```typescript
interface AchievementBadgeProps {
  achievement: {
    name: string
    description: string
    icon: string
    unlocked: boolean
    unlockedAt?: Date
  }
}
```

**States:**

- Unlocked: Full color, interactive
- Locked: Grayscale, dimmed

#### 5. LeaderboardTable (`/components/dashboard/LeaderboardTable.tsx`)

**Purpose:** Display user rankings
**Features:**

- Top 3 special styling (gold, silver, bronze)
- User highlight
- Responsive table
- Avatar display

**Data Structure:**

```typescript
interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  image: string
  xp: number
  level: number
  chaptersCompleted: number
}
```

#### 6. StreakCounter (`/components/dashboard/StreakCounter.tsx`)

**Purpose:** Show daily streak
**Features:**

- Fire icon animation
- Streak count
- Motivational text
- Calendar visualization

### UI Components (Reusable)

#### 1. Button (`/components/ui/Button.tsx`)

**Variants:**

- `primary`: Main CTA button
- `secondary`: Secondary actions
- `outline`: Bordered button
- `ghost`: Transparent button
- `danger`: Destructive actions

**Sizes:** `sm`, `md`, `lg`

**Props:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

#### 2. Card (`/components/ui/Card.tsx`)

**Purpose:** Container component with glass morphism
**Features:**

- Glass effect background
- Border gradient
- Shadow effects
- Hover animations

#### 3. Modal (`/components/ui/Modal.tsx`)

**Purpose:** Modal dialog
**Features:**

- Backdrop blur
- Focus trap
- ESC key to close
- Framer Motion animations

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}
```

#### 4. Toast (`/components/ui/Toast.tsx`)

**Purpose:** Notification system
**Types:**

- Success
- Error
- Warning
- Info

**Implementation:** React context + hook pattern

```typescript
const { toast } = useToast()
toast.success('Chapter completed!')
```

### Layout Components

#### 1. Navbar (`/components/layout/Navbar.tsx`)

**Purpose:** Main navigation
**Features:**

- Responsive menu
- User dropdown
- XP display
- Logout functionality

**States:**

- Authenticated: Full menu
- Unauthenticated: Login/Signup only

#### 2. Sidebar (`/components/layout/Sidebar.tsx`)

**Purpose:** Dashboard navigation
**Links:**

- Dashboard home
- Chapters
- Profile
- Leaderboard
- Stats

**Features:**

- Active link highlighting
- Icon integration
- Collapsible on mobile

#### 3. Footer (`/components/layout/Footer.tsx`)

**Purpose:** Site footer
**Content:**

- Copyright
- Links
- Social media
- Contact info

### Animation Components

#### 1. ParticleBackground (`/components/effects/ParticleBackground.tsx`)

**Purpose:** Animated particle effect
**Implementation:** Canvas-based particle system
**Performance:** RequestAnimationFrame loop

#### 2. LightningEffect (`/components/effects/LightningEffect.tsx`)

**Purpose:** Lightning animation for achievements
**Trigger:** Achievement unlock

#### 3. FloatingElements (`/components/effects/FloatingElements.tsx`)

**Purpose:** Floating geometric shapes
**Implementation:** CSS keyframe animations

---

## API Routes & Server Actions

### API Structure

Base path: `/app/api/`

### Authentication Endpoints

#### POST `/api/auth/signup`

**Purpose:** Create new user account
**Request Body:**

```typescript
{
  name: string
  email: string
  password: string
}
```

**Response:**

```typescript
{
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
  }
}
```

**Validation:**

- Email format validation
- Password minimum 8 characters
- Email uniqueness check

**Error Codes:**

- 400: Invalid input
- 409: Email already exists
- 500: Server error

### Progress Endpoints

#### POST `/api/progress/complete-chapter`

**Purpose:** Mark chapter as completed
**Request Body:**

```typescript
{
  chapterId: number
  timeSpent: number // seconds
}
```

**Response:**

```typescript
{
  success: boolean
  xpGained: number
  newLevel?: number
  achievements?: Achievement[]
  progress: ChapterProgress
}
```

**Logic:**

1. Check if already completed
2. Create progress record
3. Award XP (varies by chapter)
4. Check level up
5. Check achievements
6. Update streak

**XP Calculation:**

```typescript
const baseXP = 100
const difficultyMultiplier = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
}
const xpGained = baseXP * difficultyMultiplier[chapter.difficulty]
```

#### GET `/api/progress/user`

**Purpose:** Get user's progress
**Response:**

```typescript
{
  completedChapters: number[]
  totalChapters: number
  percentage: number
  recentActivity: ChapterProgress[]
}
```

### Achievement Endpoints

#### GET `/api/achievements`

**Purpose:** Get all achievements with unlock status
**Response:**

```typescript
{
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    xpReward: number
    category: string
    unlocked: boolean
    unlockedAt?: Date
  }>
}
```

#### POST `/api/achievements/check`

**Purpose:** Check if user unlocked new achievements
**Request Body:**

```typescript
{
  context: 'chapter_complete' | 'streak' | 'level_up'
}
```

**Achievement Triggers:**

- First chapter: "First Steps"
- 5 chapters: "Getting Started"
- 10 chapters: "Dedicated Learner"
- 20 chapters: "Knowledge Seeker"
- All chapters: "Master"
- 7-day streak: "Week Warrior"
- 30-day streak: "Month Master"
- Level 5: "Rising Star"
- Level 10: "Expert"

### Leaderboard Endpoints

#### GET `/api/leaderboard`

**Purpose:** Get top users
**Query Parameters:**

```typescript
{
  limit?: number    // default: 100
  offset?: number   // default: 0
  period?: 'all' | 'week' | 'month'  // default: 'all'
}
```

**Response:**

```typescript
{
  leaderboard: Array<{
    rank: number
    user: {
      id: string
      name: string
      image: string
      xp: number
      level: number
    }
    chaptersCompleted: number
  }>
  userRank?: number  // Current user's rank
}
```

**Sorting:** By XP descending

### User Endpoints

#### GET `/api/user/stats`

**Purpose:** Get detailed user statistics
**Response:**

```typescript
{
  user: {
    xp: number
    level: number
    streak: number
    completedChapters: number
    totalTimeSpent: number
    achievements: number
    rank: number
  }
  chartData: {
    xpHistory: Array<{ date: string; xp: number }>
    weeklyActivity: Array<{ day: string; chapters: number }>
  }
}
```

#### PATCH `/api/user/profile`

**Purpose:** Update user profile
**Request Body:**

```typescript
{
  name?: string
  image?: string
}
```

**Response:**

```typescript
{
  success: boolean
  user: User
}
```

### Server Actions

Location: Various `actions.ts` files

#### `updateStreak(userId: string)`

**Purpose:** Update daily streak
**Logic:**

```typescript
const lastActive = user.lastActive
const now = new Date()
const daysSince = differenceInDays(now, lastActive)

if (daysSince === 1) {
  // Consecutive day
  streak++
} else if (daysSince > 1) {
  // Streak broken
  streak = 1
}
```

#### `calculateLevel(xp: number): number`

**Purpose:** Calculate level from XP
**Formula:**

```typescript
// Level = floor(sqrt(XP / 100))
const level = Math.floor(Math.sqrt(xp / 100)) + 1
```

**XP Requirements:**

- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 4: 900 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP

---

## Features Implementation

### 1. Gamification System

#### XP System

**Earning XP:**

- Complete chapter: 100-200 XP (difficulty-based)
- First login of day: 10 XP
- Achievement unlock: Variable (10-500 XP)

**Level Progression:**

- Exponential curve
- Visual feedback on level up
- Unlock special features at milestones

#### Achievement System

**Categories:**

1. **Learning Achievements**
   - Chapter milestones (1, 5, 10, 20, 40)
   - Difficulty completions
   - Perfect scores

2. **Streak Achievements**
   - 7-day streak
   - 30-day streak
   - 100-day streak

3. **Social Achievements**
   - Leaderboard positions
   - Top 10, Top 3, #1

4. **Special Achievements**
   - Speed completions
   - No-hint completions
   - All-perfect runs

**Implementation:**

- Background check after each action
- Real-time notification
- Retroactive awarding

#### Streak System

**Logic:**

- Tracks consecutive days of activity
- Activity = completing at least one chapter
- Resets to 1 if day skipped
- Timezone-aware (user's local time)

**Visualization:**

- Flame icon with count
- Calendar heatmap
- Streak milestones

#### Leaderboard

**Rankings:**

- Global leaderboard
- Weekly leaderboard
- Monthly leaderboard

**Metrics:**

- Primary: Total XP
- Secondary: Chapters completed
- Tertiary: Level

**Features:**

- Real-time updates
- User position highlighting
- Top 3 special badges

### 2. Chapter Content System

**Total Chapters:** 40

**Structure:**

```typescript
interface Chapter {
  id: number
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  videoUrl?: string
  contentMd: string
  colabNotebook?: string
  prerequisites: number[] // Chapter IDs
  xpReward: number
}
```

**Content Types:**

1. **Video Lectures**
   - YouTube embeds
   - Custom player controls
   - Speed adjustment

2. **Markdown Content**
   - Syntax-highlighted code blocks
   - Images and diagrams
   - Interactive examples

3. **Google Colab Integration**
   - Direct notebook links
   - "Open in Colab" buttons
   - Automatic notebook syncing

**Sequential Learning:**

- Chapters unlock based on prerequisites
- Visual lock indicators
- Prerequisite tooltips

**Content Location:** `/data/chapters/` (JSON files)

### 3. Progress Tracking

**Tracked Metrics:**

- Completion status per chapter
- Time spent per chapter
- Completion timestamps
- Overall progress percentage

**Visualization:**

- Progress bars
- Circular progress indicators
- Chapter grid with status icons
- Timeline view

**Statistics Page:**

- Total chapters completed
- Total time spent
- Average chapter time
- Daily/weekly activity charts

### 4. User Profile

**Profile Sections:**

1. **Basic Info**
   - Name
   - Email
   - Avatar
   - Join date

2. **Stats Overview**
   - Level badge
   - XP progress
   - Streak counter
   - Completion percentage

3. **Achievement Showcase**
   - Featured achievements
   - Recently unlocked
   - Progress toward locked achievements

4. **Activity Feed**
   - Recent chapter completions
   - Achievement unlocks
   - Streak milestones

**Customization:**

- Avatar upload
- Display name
- Bio (optional)
- Privacy settings

### 5. Responsive Design

**Breakpoints:**

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**

- Hamburger menu
- Collapsible sidebar
- Touch-friendly buttons (min 44px)
- Simplified animations

**Testing:**

- iPhone SE (375px)
- iPad (768px)
- Desktop (1920px)

### 6. Dark Mode

**Implementation:** System preference detection + manual toggle

```typescript
// Tailwind dark mode config
module.exports = {
  darkMode: 'class',
  // ...
}
```

**Theme System:**

- CSS variables for colors
- Automatic contrast adjustment
- Persistent preference (localStorage)

### 7. Animations & Effects

**Framer Motion Usage:**

- Page transitions
- Modal animations
- Card hover effects
- List item stagger

**CSS Animations:**

- Loading spinners
- Pulse effects
- Gradient animations
- Particle systems

**Performance:**

- `will-change` optimization
- `transform` and `opacity` only
- Reduced motion media query support

---

## Configuration & Environment

### Environment Variables

Required variables (`.env.local`):

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: Email service (for verification)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@example.com"
```

### Next.js Configuration

**File:** `/next.config.js`

```javascript
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google avatars
      'avatars.githubusercontent.com', // GitHub avatars
    ],
  },
  experimental: {
    serverActions: true,
  },
}
```

### Tailwind Configuration

**File:** `/tailwind.config.ts`

```typescript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... color scale
          950: '#1e3a8a',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
```

### TypeScript Configuration

**File:** `/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Prisma Configuration

**File:** `/prisma/schema.prisma`

```prisma
datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

---

## Code Quality & Standards

### TypeScript Usage

**Coverage:** 95%+ of codebase
**Strict Mode:** Enabled
**Type Safety:** Strong

**Best Practices:**

- Explicit return types for functions
- Interface definitions for all props
- Utility types (Partial, Pick, Omit)
- No `any` types (exceptions documented)

### Code Style

**Formatting:** Prettier
**Linting:** ESLint

**Rules:**

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters

### Error Handling

**Pattern:** Try-catch with specific error types

```typescript
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle database errors
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  } else {
    // Handle unknown errors
    console.error('Unexpected error:', error)
  }
  return { success: false, error: 'Operation failed' }
}
```

**API Error Responses:**

```typescript
return NextResponse.json({ error: 'Resource not found', code: 'NOT_FOUND' }, { status: 404 })
```

### Testing

**Current Status:** Limited coverage
**Framework:** Jest + React Testing Library (configured but not extensive)

**Recommended Tests:**

1. Unit tests for utilities
2. Component tests for UI components
3. Integration tests for API routes
4. E2E tests for critical flows

**Critical Flows to Test:**

- User registration
- Login/logout
- Chapter completion
- XP/level calculation
- Achievement unlocking

### Documentation

**Code Comments:**

- JSDoc for public functions
- Inline comments for complex logic
- README files for major features

**Example:**

```typescript
/**
 * Calculates the user's level based on total XP
 * Uses exponential formula: level = floor(sqrt(xp / 100)) + 1
 *
 * @param xp - Total experience points
 * @returns User level (minimum 1)
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
```

---

## Performance Optimization

### Bundle Size

**Current:** ~200KB gzipped (initial load)

**Optimization Techniques:**

1. Dynamic imports for heavy components
2. Code splitting by route
3. Tree shaking (automatic)
4. Image optimization

**Example:**

```typescript
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false
})
```

### Image Optimization

**Strategy:** Next.js Image component

```typescript
<Image
  src="/hero-image.png"
  alt="Hero"
  width={1200}
  height={600}
  priority  // For above-fold images
  placeholder="blur"
/>
```

**Formats:** WebP with fallback

### Database Queries

**Optimization:**

- Proper indexing (see schema)
- Select only needed fields
- Pagination for large datasets
- Connection pooling (Prisma default)

**Example:**

```typescript
// Good
const users = await prisma.user.findMany({
  select: { id: true, name: true, xp: true },
  take: 10,
  orderBy: { xp: 'desc' },
})

// Bad (overfetching)
const users = await prisma.user.findMany()
```

### Caching Strategy

**Static Pages:** ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600 // 1 hour
```

**API Routes:** No caching (real-time data)
**Client-side:** React Query (potential addition)

### Core Web Vitals

**Targets:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Monitoring:** Web Vitals package integrated

---

## Security Considerations

### Authentication Security

**Password Storage:**

- Bcrypt hashing (10 rounds)
- No plain text storage
- Salted automatically

**Session Security:**

- HTTP-only cookies
- Secure flag in production
- SameSite=Lax
- CSRF protection (NextAuth built-in)

**OAuth Security:**

- State parameter validation
- PKCE for authorization code flow
- Token validation

### Input Validation

**Backend Validation:**

```typescript
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
})

// Usage
const result = signupSchema.safeParse(body)
if (!result.success) {
  return NextResponse.json({ error: result.error.issues }, { status: 400 })
}
```

**Frontend Validation:**

- React Hook Form with Zod resolver
- Real-time validation feedback
- Error messages

### SQL Injection Prevention

**Protection:** Prisma ORM (parameterized queries)

```typescript
// Safe - Prisma handles escaping
await prisma.user.findUnique({
  where: { email: userInput },
})

// Never use raw queries with user input
```

### XSS Prevention

**Protection:**

- React auto-escaping
- Content Security Policy headers
- DOMPurify for markdown rendering

**CSP Headers:**

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
  },
]
```

### Rate Limiting

**Recommended Implementation:**

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
```

**Critical Endpoints:**

- `/api/auth/signup`: 5 requests/hour per IP
- `/api/auth/signin`: 10 requests/15 min per IP
- `/api/progress/*`: 100 requests/15 min per user

### Environment Variables

**Security:**

- Never commit `.env.local`
- Use secret management in production
- Rotate secrets regularly
- Minimum required permissions for API keys

### HTTPS

**Production:** Always use HTTPS
**Development:** HTTP acceptable (localhost)

**Headers:**

- Strict-Transport-Security
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

---

## Deployment Guidelines

### Vercel Deployment (Recommended)

**Steps:**

1. **Connect Repository**

   ```bash
   vercel login
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set `DATABASE_URL` to PostgreSQL connection string

3. **Database Migration**

   ```bash
   # After deploying with PostgreSQL URL
   npx prisma migrate deploy
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

**Configuration:**

- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### Database Migration (SQLite → PostgreSQL)

**Steps:**

1. **Setup PostgreSQL**
   - Provision PostgreSQL instance (Vercel Postgres, Railway, Supabase)
   - Get connection string

2. **Update Schema**

   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Create Migration**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Export Data from SQLite**

   ```bash
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

5. **Import to PostgreSQL**
   - Modify backup.sql for PostgreSQL compatibility
   - Use `psql` or GUI tool to import

6. **Deploy Migration**
   ```bash
   npx prisma migrate deploy
   ```

### Environment-Specific Configuration

**Development:**

```bash
NODE_ENV=development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**

```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
```

### Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrated successfully
- [ ] OAuth providers configured with production URLs
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Analytics setup (optional)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Email service configured (if using)
- [ ] Seed data loaded (if needed)

### Monitoring

**Recommended Tools:**

- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics or Plausible
- **Uptime:** UptimeRobot
- **Performance:** Vercel Speed Insights

**Setup Example (Sentry):**

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

---

## Recommendations for Final Adjustments

### High Priority

#### 1. Database Migration to PostgreSQL

**Reason:** SQLite not suitable for production multi-user scenarios
**Effort:** Medium
**Impact:** High

**Steps:**

- Provision PostgreSQL instance
- Update schema provider
- Run migrations
- Test thoroughly

#### 2. Input Validation Enhancement

**Reason:** Improve data integrity and security
**Effort:** Low
**Impact:** High

**Add:**

- Zod schemas for all API routes
- Client-side validation improvements
- Better error messages

#### 3. Error Handling Improvements

**Reason:** Better user experience and debugging
**Effort:** Medium
**Impact:** Medium

**Add:**

- Error boundary components
- Global error handler
- User-friendly error messages
- Error logging service (Sentry)

#### 4. Rate Limiting

**Reason:** Prevent abuse and ensure fair usage
**Effort:** Low
**Impact:** High

**Implementation:**

- Add rate limiting middleware
- Configure limits per endpoint
- Return appropriate error responses

### Medium Priority

#### 5. Test Coverage

**Reason:** Ensure reliability and catch regressions
**Effort:** High
**Impact:** Medium

**Focus Areas:**

- API route tests
- Component tests for critical UI
- E2E tests for main user flows
- XP/level calculation logic

**Target:** 80% coverage

#### 6. Accessibility (A11y)

**Reason:** WCAG compliance and broader user reach
**Effort:** Medium
**Impact:** Medium

**Improvements:**

- Keyboard navigation
- ARIA labels
- Screen reader testing
- Color contrast verification
- Focus indicators

**Tool:** axe DevTools

#### 7. Performance Optimization

**Reason:** Better user experience
**Effort:** Medium
**Impact:** Medium

**Actions:**

- Implement React Query for data fetching
- Add service worker for offline support
- Optimize images (WebP, lazy loading)
- Code splitting improvements
- Database query optimization

#### 8. Email Verification

**Reason:** Improve account security
**Effort:** Medium
**Impact:** Low

**Add:**

- Email verification on signup
- Password reset flow
- Email notification for achievements

### Low Priority

#### 9. Content Management System

**Reason:** Easier chapter content updates
**Effort:** High
**Impact:** Low

**Option 1:** Custom admin panel
**Option 2:** Integrate headless CMS (Sanity, Strapi)

#### 10. Real-time Features

**Reason:** Enhanced engagement
**Effort:** High
**Impact:** Low

**Features:**

- Live leaderboard updates
- Real-time notifications
- User presence indicators

**Technology:** WebSockets or Server-Sent Events

#### 11. Mobile App

**Reason:** Native mobile experience
**Effort:** Very High
**Impact:** Medium

**Options:**

- React Native
- Progressive Web App (PWA) - easier first step

### Code Refactoring Suggestions

#### 1. Extract Business Logic

**Current:** Some logic in API routes
**Recommended:** Move to service layer

```typescript
// services/progressService.ts
export class ProgressService {
  async completeChapter(userId: string, chapterId: number) {
    // Business logic here
  }
}
```

#### 2. Centralize Constants

**Current:** Magic numbers in code
**Recommended:** Constants file

```typescript
// lib/constants.ts
export const XP_CONFIG = {
  BASE_CHAPTER_XP: 100,
  DAILY_LOGIN_XP: 10,
  LEVEL_FORMULA: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
}
```

#### 3. Improve Type Safety

**Add:**

- Stricter TypeScript config
- Remove any `any` types
- Use discriminated unions for state

#### 4. Component Composition

**Pattern:** Container/Presentational pattern for complex components

```typescript
// Container (logic)
export function ChapterCardContainer({ id }: { id: number }) {
  const { data, loading } = useChapter(id)
  return <ChapterCardView data={data} loading={loading} />
}

// Presentational (UI)
export function ChapterCardView({ data, loading }: Props) {
  // Pure UI
}
```

### Documentation Additions

**Add:**

1. **API Documentation** - OpenAPI/Swagger spec
2. **Component Storybook** - Visual component documentation
3. **Deployment Guide** - Step-by-step deployment instructions
4. **Contributing Guide** - For future developers
5. **Troubleshooting Guide** - Common issues and solutions

### Security Enhancements

**Add:**

1. **Two-Factor Authentication** - Enhanced account security
2. **Session Management** - Better session invalidation
3. **Audit Logging** - Track sensitive operations
4. **Data Encryption** - Encrypt sensitive user data at rest
5. **Regular Security Audits** - Automated vulnerability scanning

---

## Technical Debt

### Current Known Issues

1. **No comprehensive error logging**
   - Impact: Difficult to debug production issues
   - Solution: Integrate Sentry or similar

2. **Limited test coverage**
   - Impact: Risk of regressions
   - Solution: Add tests (see recommendations)

3. **SQLite in production**
   - Impact: Not scalable, concurrency issues
   - Solution: Migrate to PostgreSQL

4. **No rate limiting**
   - Impact: Vulnerable to abuse
   - Solution: Add rate limiting middleware

5. **Inconsistent error handling**
   - Impact: Poor user experience
   - Solution: Standardize error responses

### Future Scalability Considerations

**Database:**

- Current: Single SQLite file
- Future: PostgreSQL with read replicas
- Caching: Redis for session storage and frequently accessed data

**Architecture:**

- Current: Monolithic Next.js app
- Future: Potential microservices for heavy operations
  - Achievement processing service
  - Email notification service
  - Analytics service

**CDN:**

- Current: Vercel Edge Network
- Future: Custom CDN for video content

**File Storage:**

- Current: Local file system
- Future: S3 or similar for user uploads

---

## Appendix

### Glossary

**XP:** Experience Points - Currency for gamification
**Streak:** Consecutive days of activity
**Achievement:** Unlockable reward for milestones
**Chapter:** Learning unit with content
**Leaderboard:** Ranking of users by XP
**Progress:** Completion status of chapters

### External Resources

**Documentation:**

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- TailwindCSS: https://tailwindcss.com/docs

**Tools:**

- Vercel: https://vercel.com
- Prisma Studio: `npx prisma studio`
- TypeScript: https://www.typescriptlang.org

### Contact Information

**Project Owner:** Martin Svanda
**Repository:** [Add Git repository URL]
**Documentation:** This file
**Last Updated:** October 2025

---

## Conclusion

This platform is well-architected and production-ready with the recommended adjustments implemented. The codebase follows modern best practices and is maintainable for future development.

**Key Strengths:**

- Modern technology stack
- Type-safe codebase
- Good component organization
- Engaging gamification features
- Responsive design

**Priority Actions:**

1. Migrate to PostgreSQL
2. Add comprehensive error handling
3. Implement rate limiting
4. Increase test coverage
5. Set up monitoring

**Estimated Effort for Priority Actions:** 2-3 weeks

This documentation should provide your external development team with all the information needed to understand, maintain, and enhance the platform.

---

**Document Version:** 1.0
**Generated:** October 2025
**For:** External Development Team
**Confidential:** Yes
