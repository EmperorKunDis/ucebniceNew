# UČEBNICE PROGRAMOVÁNÍ AI — KOMPLETNÍ PLÁN OPRAV A DUOLINGO TRANSFORMACE

## Verze dokumentu: 2.0 (Ultra-Detail Edition)

## Datum: 2025-02-05

## Codebase: v1.0.37

## Rozsah: Fáze 1–4 (16 týdnů)

---

# OBSAH

## ČÁST I: OPRAVY A STABILIZACE

- Fáze 1: Kritické opravy (Týden 1-2)
  - 1.1 Odstranění ignoreBuildErrors
  - 1.2 Konsolidace BADGES
  - 1.3 Oprava N+1 queries
  - 1.4 Auth security fix
  - 1.5 Chapter ID format mismatch
  - 1.6 Chybějící validace

- Fáze 2: Technický dluh (Týden 3-4)
  - 2.1 Unit testy
  - 2.2 Bundle size optimalizace
  - 2.3 Database indexy
  - 2.4 Refaktoring ChapterLayout
  - 2.5 Error boundaries
  - 2.6 Hydration fix

## ČÁST II: DUOLINGO TRANSFORMACE

- Fáze 3: Core Duolingo mechaniky (Týden 5-10)
  - 3.1 Vizuální Learning Path (Skill Tree)
  - 3.2 Enhanced Streak systém
  - 3.3 XP Shop
  - 3.4 Micro-lessons a interaktivní cvičení
  - 3.5 Spaced Repetition (SM-2)
  - 3.6 Hearts/Lives systém
  - 3.7 Celebrations a konfety

- Fáze 4: Advanced features (Týden 11-16)
  - 4.1 Liga systém
  - 4.2 Daily & Weekly Quests
  - 4.3 Social features
  - 4.4 AI Tutor integrace
  - 4.5 RBAC implementace
  - 4.6 Notifikační systém
  - 4.7 Analytics systém

## ČÁST III: PODPŮRNÉ MATERIÁLY

- Kompletní DB Schema
- API Endpoints
- Component Tree
- Migrace a deployment
- KPI a metriky
- Testing strategie

---

# AKTUÁLNÍ STAV (2026-02-08)

## ✅ Fáze 1 — HOTOVO (uncommitted)

| Úkol                    | Status  | Poznámka                                                                |
| ----------------------- | ------- | ----------------------------------------------------------------------- |
| 1.1 ignoreBuildErrors   | ✅ DONE | Odstraněno z next.config.js                                             |
| 1.2 Konsolidace BADGES  | ✅ DONE | Sjednoceno v gamification.ts                                            |
| 1.3 N+1 queries         | ✅ DONE | Opraveno v user/stats                                                   |
| 1.4 Auth security       | ✅ DONE | auth-helpers.ts vytvořen                                                |
| 1.5 Chapter ID mismatch | ✅ DONE | API routes konsolidovány na ChapterCompletion, migrační script vytvořen |
| 1.6 Validace            | ✅ DONE | URL validation, SSRF ochrana                                            |
| 1.7 Route conflicts     | ✅ DONE | Odstraněna duplicitní /certificate                                      |
| 1.8 Suspense boundaries | ✅ DONE | verify-email useSearchParams() wrapped                                  |

**Build status:** ✅ PASSING (`npm run build` OK)
**TS errors:** 0 (z původních 81)

## ✅ Fáze 2 — HOTOVO

| Úkol                       | Status  | Poznámka                                                                    |
| -------------------------- | ------- | --------------------------------------------------------------------------- |
| 2.1 Unit testy             | ✅ DONE | Vitest + 52 testů pro gamification                                          |
| 2.2 Bundle size            | ✅ DONE | Dynamic imports pro ReviewSession aj.                                       |
| 2.3 DB indexy              | ✅ DONE | 4 compound indexy                                                           |
| 2.4 ChapterLayout refactor | ✅ DONE | Split do hooks (useChapterProgress, useChapterQuestions) + menší komponenty |
| 2.5 Error boundaries       | ✅ DONE | ErrorBoundary.tsx + analytics                                               |
| 2.6 Hydration fix          | ✅ DONE | useUserStoreHydrated hook + onRehydrateStorage callback                     |

---

# Component Tree (nový)

```
app/
├── layout.tsx (+ StreamSafeProvider, HeartProvider, StreakProvider)
├── globals.css
├── page.tsx (Landing / Dashboard router)
│
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx (AuthLayout - centered card)
│
├── (main)/
│   ├── layout.tsx (MainLayout - sidebar + topbar + hearts)
│   ├── dashboard/page.tsx (→ LearningPath skill tree)
│   ├── learn/
│   │   ├── page.tsx (redirects to dashboard)
│   │   └── [chapterId]/
│   │       ├── page.tsx (ChapterOverview)
│   │       ├── lesson/[lessonId]/page.tsx (MicroLessonPlayer)
│   │       ├── practice/page.tsx (ExerciseSession)
│   │       └── review/page.tsx (SpacedRepetitionSession)
│   ├── profile/
│   │   ├── page.tsx (ProfilePage)
│   │   ├── settings/page.tsx
│   │   └── achievements/page.tsx
│   ├── shop/page.tsx (XPShopPage)
│   ├── leagues/page.tsx (LeaguePage)
│   ├── quests/page.tsx (QuestsPage)
│   ├── friends/
│   │   ├── page.tsx (FriendsListPage)
│   │   └── leaderboard/page.tsx
│   ├── ai-tutor/page.tsx (AITutorChat)
│   ├── arena/
│   │   ├── page.tsx (ArenaHub)
│   │   ├── hackathons/
│   │   │   ├── page.tsx (HackathonList)
│   │   │   └── [id]/page.tsx (HackathonDetail)
│   │   └── graduates/page.tsx
│   └── notifications/page.tsx
│
├── admin/
│   ├── layout.tsx (AdminLayout)
│   ├── page.tsx (AdminDashboard)
│   ├── users/page.tsx
│   ├── chapters/page.tsx
│   ├── analytics/page.tsx
│   ├── leagues/page.tsx
│   ├── quests/page.tsx
│   └── shop/page.tsx
│
└── api/
    ├── auth/ (3 routes)
    ├── chapters/ (4 routes)
    ├── progress/ (2 routes)
    ├── learning-path/ (1 route)
    ├── micro-lessons/ (2 routes)
    ├── exercises/ (2 routes)
    ├── review/ (2 routes)
    ├── user/ (5 routes)
    ├── shop/ (2 routes)
    ├── leagues/ (2 routes)
    ├── quests/ (3 routes)
    ├── friends/ (7 routes)
    ├── ai-tutor/ (2 routes)
    ├── notifications/ (3 routes)
    ├── analytics/ (1 route)
    └── admin/ (6 routes)
```

## Kompletní Component Library

```
components/
├── ui/
│   ├── button.tsx             # Variant: primary, secondary, ghost, danger
│   ├── card.tsx               # Glass card wrapper
│   ├── input.tsx              # Text input s label a error state
│   ├── textarea.tsx
│   ├── modal.tsx
│   ├── toast.tsx
│   ├── badge.tsx              # Status badge (XP, level, streak)
│   ├── avatar.tsx             # S fallback
│   ├── progress-bar.tsx       # Linear progress
│   ├── progress-ring.tsx      # Circular SVG progress
│   ├── skeleton.tsx
│   ├── tooltip.tsx
│   ├── dropdown.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── fluid-glass.tsx        # Three.js glass morphism
│   ├── confetti.tsx
│   ├── profile-card.tsx
│   ├── stat-card.tsx
│   ├── streak-flame.tsx       # Animated fire
│   ├── heart-display.tsx
│   ├── xp-counter.tsx         # Animated XP counter
│   ├── level-badge.tsx
│   └── notification-bell.tsx
│
├── learning/
│   ├── skill-tree/
│   │   ├── SkillTreeContainer.tsx
│   │   ├── SkillNode.tsx
│   │   ├── SkillNodeIcon.tsx
│   │   ├── SkillPath.tsx      # SVG path
│   │   ├── SkillCheckpoint.tsx
│   │   ├── SkillTreeBackground.tsx
│   │   └── SkillTreeTooltip.tsx
│   ├── lesson/
│   │   ├── LessonPlayer.tsx
│   │   ├── LessonProgress.tsx
│   │   ├── LessonHeader.tsx
│   │   ├── LessonContent.tsx
│   │   ├── LessonNavigation.tsx
│   │   └── LessonComplete.tsx
│   ├── exercise/
│   │   ├── ExercisePlayer.tsx
│   │   ├── ExerciseProgress.tsx
│   │   ├── ExerciseTimer.tsx
│   │   ├── exercises/
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── FillInBlank.tsx
│   │   │   ├── DragAndDrop.tsx
│   │   │   ├── CodeOutput.tsx
│   │   │   ├── DebugChallenge.tsx
│   │   │   ├── MatchPairs.tsx
│   │   │   ├── TrueFalse.tsx
│   │   │   └── TypeAnswer.tsx
│   │   ├── ExerciseFeedback.tsx
│   │   ├── ExerciseHint.tsx
│   │   ├── ExerciseExplanation.tsx
│   │   └── ExerciseComplete.tsx
│   ├── review/
│   │   ├── ReviewSession.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewDifficulty.tsx
│   │   ├── ReviewStats.tsx
│   │   └── ReviewComplete.tsx
│   └── chapter/
│       ├── ChapterLayout.tsx (refactored)
│       ├── ChapterHeader.tsx
│       ├── ChapterContent.tsx
│       ├── ChapterProgress.tsx
│       ├── ChapterCompletion.tsx
│       ├── ChapterStars.tsx
│       ├── ChapterNavigation.tsx
│       ├── ChapterVideo.tsx
│       └── ChapterSidebar.tsx
│
├── gamification/
│   ├── streak/ (5 components)
│   ├── hearts/ (4 components)
│   ├── xp/ (4 components)
│   ├── achievements/ (4 components)
│   ├── leagues/ (5 components)
│   ├── quests/ (4 components)
│   ├── shop/ (5 components)
│   └── celebrations/ (6 components)
│
├── social/
│   ├── friends/ (6 components)
│   └── notifications/ (3 components)
│
├── ai-tutor/ (6 components)
│
├── layout/
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── MobileNav.tsx
│   └── PageTransition.tsx
│
└── shared/
    ├── ErrorBoundary.tsx
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    ├── MarkdownRenderer.tsx
    ├── CodeBlock.tsx
    ├── VideoPlayer.tsx
    └── SEOHead.tsx
```

**Celkem: ~95 nových komponent**

---

# Kompletní DB Schema

## Celkem: 34 modelů (18 existujících + 16 nových)

### Kompletní Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════

enum Role {
  USER
  JUDGE
  TEAM_LEADER
  ADMIN
}

enum StreakFreezeSource {
  SHOP_PURCHASE
  ACHIEVEMENT_REWARD
  ADMIN_GRANT
}

enum ShopItemCategory {
  POWER_UP
  COSMETIC
  STREAK
  HEART
  XP_BOOST
}

enum ExerciseType {
  MULTIPLE_CHOICE
  FILL_IN_BLANK
  DRAG_AND_DROP
  CODE_OUTPUT
  DEBUG_CHALLENGE
  MATCH_PAIRS
  TRUE_FALSE
  TYPE_ANSWER
}

enum ExerciseDifficulty {
  EASY
  MEDIUM
  HARD
}

enum ReviewRating {
  AGAIN
  HARD
  GOOD
  EASY
}

enum LeagueTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
  OBSIDIAN
}

enum QuestType {
  DAILY
  WEEKLY
  SPECIAL
}

enum QuestCategory {
  LESSONS_COMPLETED
  XP_EARNED
  STREAK_MAINTAINED
  EXERCISES_PERFECT
  REVIEW_SESSIONS
  FRIENDS_ENCOURAGED
  CHAPTERS_COMPLETED
  ACHIEVEMENTS_UNLOCKED
  TIME_SPENT
  HEARTS_PRESERVED
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  ENCOURAGEMENT
  ACHIEVEMENT_UNLOCKED
  LEAGUE_PROMOTION
  LEAGUE_DEMOTION
  STREAK_ENDANGERED
  STREAK_LOST
  STREAK_MILESTONE
  QUEST_COMPLETED
  LEVEL_UP
  HEART_REFILL
  SHOP_PURCHASE
  SYSTEM
}

enum AnalyticsEventType {
  PAGE_VIEW
  LESSON_START
  LESSON_COMPLETE
  EXERCISE_ANSWER
  EXERCISE_HINT_USED
  REVIEW_SESSION_START
  REVIEW_SESSION_COMPLETE
  SHOP_VIEW
  SHOP_PURCHASE
  FRIEND_REQUEST_SENT
  AI_TUTOR_MESSAGE
  ACHIEVEMENT_VIEW
  LEAGUE_VIEW
  STREAK_CHECK
  HEART_LOST
  HEART_REFILL
  SESSION_START
  SESSION_END
  ERROR
}

// ═══════════════════════════════════════════════════════════
// AUTH MODELS (NextAuth)
// ═══════════════════════════════════════════════════════════

model User {
  id                    String    @id @default(cuid())
  name                  String?
  username              String?   @unique
  email                 String?   @unique
  emailVerified         DateTime?
  hashedPassword        String?
  image                 String?
  bio                   String?
  role                  Role      @default(USER)
  isAdmin               Boolean   @default(false)

  // Gamification core
  xp                    Int       @default(0)
  level                 Int       @default(1)
  gems                  Int       @default(0)
  streak                Int       @default(0)
  longestStreak         Int       @default(0)
  lastActiveDate        DateTime?

  // Hearts system
  hearts                Int       @default(5)
  maxHearts             Int       @default(5)
  lastHeartRegenAt      DateTime?
  unlimitedHeartsUntil  DateTime?

  // Daily XP tracking
  dailyXP               Int       @default(0)
  dailyXPGoal           Int       @default(50)
  lastDailyReset        DateTime?

  // Onboarding
  onboardingCompleted   Boolean   @default(false)

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // All relations
  accounts              Account[]
  sessions              Session[]
  completedChapters     CompletedChapter[]
  chapterCompletions    ChapterCompletion[]
  chapterProgress       ChapterProgress[]
  achievements          UserAchievement[]
  questionAnswers       QuestionAnswer[]
  projectSubmissions    ProjectSubmission[]
  moduleTestAttempts    ModuleTestAttempt[]
  cognitiveGlitches     CognitiveGlitchAttempt[]
  teams                 TeamMember[]
  graduateProfile       GraduateProfile?
  streakHistory         StreakHistory[]
  purchases             UserPurchase[]
  reviewCards           ReviewCard[]
  leagueMemberships     LeagueMembership[]
  quests                UserQuest[]
  sentFriendRequests    Friendship[]      @relation("FriendshipRequester")
  receivedFriendReqs    Friendship[]      @relation("FriendshipReceiver")
  sentEncouragements    Encouragement[]   @relation("EncouragementSender")
  receivedEncouragemnts Encouragement[]   @relation("EncouragementReceiver")
  aiChatHistory         AIChatHistory[]
  notifications         Notification[]
  analyticsEvents       AnalyticsEvent[]

  @@index([xp])
  @@index([level])
  @@index([email])
  @@index([username])
  @@index([createdAt])
  @@index([streak])
  @@index([lastActiveDate])
  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ═══════════════════════════════════════════════════════════
// LEARNING MODELS
// ═══════════════════════════════════════════════════════════

model Chapter {
  id              String              @id @default(cuid())
  chapterId       String              @unique // "01"-"40"
  title           String
  description     String?             @db.Text
  content         String?             @db.Text
  videoUrl        String?
  order           Int
  module          Int                 // 1-8
  isPublished     Boolean             @default(false)
  difficulty      ExerciseDifficulty  @default(EASY)
  prerequisiteIds String[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  completedBy        CompletedChapter[]
  completions        ChapterCompletion[]
  progress           ChapterProgress[]
  questions          Question[]
  microLessons       MicroLesson[]
  concepts           Concept[]
  projectSubmissions ProjectSubmission[]

  @@index([chapterId])
  @@index([module])
  @@index([order])
}

model CompletedChapter {
  // DEPRECATED - migrovat do ChapterCompletion
  id        String   @id @default(cuid())
  userId    String
  chapterId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter Chapter @relation(fields: [chapterId], references: [id])

  @@unique([userId, chapterId])
  @@index([userId])
}

model ChapterCompletion {
  id               String   @id @default(cuid())
  userId           String
  completedChapter String   // "01", "02", etc
  stars            Int      @default(1)
  bestScore        Int      @default(0)
  completionTime   Int?
  attempts         Int      @default(1)
  xpEarned         Int      @default(0)
  perfectRun       Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter Chapter? @relation(fields: [completedChapter], references: [chapterId])

  @@unique([userId, completedChapter])
  @@index([userId])
  @@index([completedChapter])
  @@index([userId, completedChapter])
  @@index([createdAt])
}

model ChapterProgress {
  id                 String   @id @default(cuid())
  userId             String
  chapterId          String
  currentStep        Int      @default(0)
  totalSteps         Int      @default(0)
  lessonsCompleted   Int      @default(0)
  exercisesCorrect   Int      @default(0)
  exercisesTotal     Int      @default(0)
  timeSpentSeconds   Int      @default(0)
  lastAccessedAt     DateTime @default(now())
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter Chapter @relation(fields: [chapterId], references: [chapterId])

  @@unique([userId, chapterId])
  @@index([userId])
  @@index([chapterId])
  @@index([userId, chapterId])
}

// ═══════════════════════════════════════════════════════════
// MICRO-LESSONS & EXERCISES
// ═══════════════════════════════════════════════════════════

model MicroLesson {
  id          String   @id @default(cuid())
  chapterId   String
  order       Int
  title       String
  content     String   @db.Text
  summary     String?  @db.Text
  xpReward    Int      @default(10)
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  chapter   Chapter    @relation(fields: [chapterId], references: [chapterId])
  exercises Exercise[]

  @@unique([chapterId, order])
  @@index([chapterId])
}

model Exercise {
  id            String             @id @default(cuid())
  microLessonId String
  order         Int
  type          ExerciseType
  difficulty    ExerciseDifficulty @default(MEDIUM)
  question      String             @db.Text
  data          Json
  explanation   String?            @db.Text
  hints         String[]
  xpReward      Int                @default(5)
  conceptId     String?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  microLesson MicroLesson @relation(fields: [microLessonId], references: [id], onDelete: Cascade)
  concept     Concept?    @relation(fields: [conceptId], references: [id])

  @@index([microLessonId])
  @@index([type])
  @@index([conceptId])
}

// ═══════════════════════════════════════════════════════════
// SPACED REPETITION
// ═══════════════════════════════════════════════════════════

model Concept {
  id          String   @id @default(cuid())
  chapterId   String
  name        String
  description String?  @db.Text
  tags        String[]
  createdAt   DateTime @default(now())

  chapter     Chapter      @relation(fields: [chapterId], references: [chapterId])
  exercises   Exercise[]
  reviewCards ReviewCard[]

  @@unique([chapterId, name])
  @@index([chapterId])
}

model ReviewCard {
  id           String        @id @default(cuid())
  userId       String
  conceptId    String
  easeFactor   Float         @default(2.5)
  interval     Int           @default(0)
  repetitions  Int           @default(0)
  nextReviewAt DateTime      @default(now())
  lastReviewAt DateTime?
  totalReviews Int           @default(0)
  correctCount Int           @default(0)
  lastRating   ReviewRating?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  concept Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)

  @@unique([userId, conceptId])
  @@index([userId])
  @@index([nextReviewAt])
  @@index([userId, nextReviewAt])
}

// ═══════════════════════════════════════════════════════════
// GAMIFICATION
// ═══════════════════════════════════════════════════════════

model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String
  icon        String
  category    String
  xpReward    Int      @default(0)
  gemReward   Int      @default(0)
  requirement Json
  isSecret    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]

  @@index([key])
  @@index([category])
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  progress      Int      @default(100)
  notified      Boolean  @default(false)

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}

model StreakHistory {
  id               String             @id @default(cuid())
  userId           String
  date             DateTime           @db.Date
  xpEarned         Int                @default(0)
  lessonsCompleted Int                @default(0)
  froze            Boolean            @default(false)
  freezeSource     StreakFreezeSource?
  createdAt        DateTime           @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
  @@index([userId, date])
}

// ═══════════════════════════════════════════════════════════
// SHOP
// ═══════════════════════════════════════════════════════════

model ShopItem {
  id          String           @id @default(cuid())
  key         String           @unique
  name        String
  description String
  category    ShopItemCategory
  price       Int
  icon        String
  effectData  Json
  isActive    Boolean          @default(true)
  maxPerWeek  Int?
  order       Int              @default(0)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  purchases UserPurchase[]

  @@index([category])
  @@index([isActive])
}

model UserPurchase {
  id        String    @id @default(cuid())
  userId    String
  itemId    String
  price     Int
  usedAt    DateTime?
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  user User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  item ShopItem @relation(fields: [itemId], references: [id])

  @@index([userId])
  @@index([userId, createdAt])
}

// ═══════════════════════════════════════════════════════════
// LEAGUES
// ═══════════════════════════════════════════════════════════

model League {
  id        String     @id @default(cuid())
  tier      LeagueTier
  weekStart DateTime   @db.Date
  weekEnd   DateTime   @db.Date
  createdAt DateTime   @default(now())

  members LeagueMembership[]

  @@unique([tier, weekStart])
  @@index([weekStart])
}

model LeagueMembership {
  id        String   @id @default(cuid())
  userId    String
  leagueId  String
  weeklyXP  Int      @default(0)
  rank      Int?
  promoted  Boolean  @default(false)
  demoted   Boolean  @default(false)
  survived  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  league League @relation(fields: [leagueId], references: [id], onDelete: Cascade)

  @@unique([userId, leagueId])
  @@index([leagueId])
  @@index([leagueId, weeklyXP])
}

// ═══════════════════════════════════════════════════════════
// QUESTS
// ═══════════════════════════════════════════════════════════

model Quest {
  id          String        @id @default(cuid())
  type        QuestType
  category    QuestCategory
  title       String
  description String
  targetValue Int
  xpReward    Int           @default(0)
  gemReward   Int           @default(0)
  icon        String
  isActive    Boolean       @default(true)
  validFrom   DateTime?
  validUntil  DateTime?
  createdAt   DateTime      @default(now())

  userQuests UserQuest[]

  @@index([type])
  @@index([isActive])
}

model UserQuest {
  id          String    @id @default(cuid())
  userId      String
  questId     String
  progress    Int       @default(0)
  completed   Boolean   @default(false)
  completedAt DateTime?
  claimed     Boolean   @default(false)
  claimedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  quest Quest @relation(fields: [questId], references: [id], onDelete: Cascade)

  @@unique([userId, questId])
  @@index([userId])
  @@index([userId, completed])
}

// ═══════════════════════════════════════════════════════════
// SOCIAL
// ═══════════════════════════════════════════════════════════

model Friendship {
  id          String           @id @default(cuid())
  requesterId String
  receiverId  String
  status      FriendshipStatus @default(PENDING)
  respondedAt DateTime?
  createdAt   DateTime         @default(now())

  requester User @relation("FriendshipRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  receiver  User @relation("FriendshipReceiver", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([requesterId, receiverId])
  @@index([requesterId])
  @@index([receiverId])
  @@index([status])
}

model Encouragement {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  message    String?
  type       String   @default("nudge")
  createdAt  DateTime @default(now())

  sender   User @relation("EncouragementSender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver User @relation("EncouragementReceiver", fields: [receiverId], references: [id], onDelete: Cascade)

  @@index([senderId])
  @@index([receiverId])
}

// ═══════════════════════════════════════════════════════════
// AI TUTOR, NOTIFICATIONS, ANALYTICS
// ═══════════════════════════════════════════════════════════

model AIChatHistory {
  id         String   @id @default(cuid())
  userId     String
  chapterId  String?
  role       String
  content    String   @db.Text
  model      String?
  tokenCount Int?
  helpful    Boolean?
  flagged    Boolean  @default(false)
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, read])
}

model AnalyticsEvent {
  id        String             @id @default(cuid())
  userId    String?
  type      AnalyticsEventType
  data      Json?
  page      String?
  sessionId String?
  userAgent String?
  ip        String?
  createdAt DateTime           @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([type])
  @@index([userId])
  @@index([createdAt])
  @@index([type, createdAt])
}

// ═══════════════════════════════════════════════════════════
// EXISTING: Questions, Projects, Arena
// ═══════════════════════════════════════════════════════════

model Question {
  id            String             @id @default(cuid())
  chapterId     String
  question      String             @db.Text
  options       Json
  correctAnswer Int
  explanation   String?            @db.Text
  difficulty    ExerciseDifficulty @default(MEDIUM)
  order         Int                @default(0)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  chapter Chapter          @relation(fields: [chapterId], references: [chapterId])
  answers QuestionAnswer[]

  @@index([chapterId])
}

model QuestionAnswer {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  answer     Int
  isCorrect  Boolean
  timeSpent  Int?
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
}

model ProjectSubmission {
  id          String   @id @default(cuid())
  userId      String
  chapterId   String
  title       String
  description String?  @db.Text
  repoUrl     String?
  demoUrl     String?
  score       Int?
  feedback    String?  @db.Text
  reviewed    Boolean  @default(false)
  reviewedBy  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter Chapter @relation(fields: [chapterId], references: [chapterId])

  @@index([userId])
}

model ModuleTestAttempt {
  id             String   @id @default(cuid())
  userId         String
  module         Int
  score          Int
  totalQuestions Int
  passed         Boolean
  answers        Json
  timeSpent      Int?
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([module])
}

model CognitiveGlitchAttempt {
  id        String   @id @default(cuid())
  userId    String
  glitchId  String
  passed    Boolean
  answer    String?  @db.Text
  timeSpent Int?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Hackathon {
  id               String   @id @default(cuid())
  title            String
  description      String   @db.Text
  theme            String?
  startDate        DateTime
  endDate          DateTime
  maxTeamSize      Int      @default(4)
  minLevel         Int      @default(1)
  prizes           Json
  judges           Json
  sponsors         Json?
  isActive         Boolean  @default(false)
  registrationOpen Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  teams    Team[]
  projects HackathonProject[]

  @@index([isActive])
}

model Team {
  id          String   @id @default(cuid())
  hackathonId String
  name        String
  description String?
  createdAt   DateTime @default(now())

  hackathon Hackathon         @relation(fields: [hackathonId], references: [id])
  members   TeamMember[]
  project   HackathonProject?

  @@index([hackathonId])
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      String   @default("member")
  createdAt DateTime @default(now())

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

model HackathonProject {
  id          String   @id @default(cuid())
  teamId      String   @unique
  hackathonId String
  title       String
  description String   @db.Text
  repoUrl     String?
  demoUrl     String?
  videoUrl    String?
  score       Int?
  feedback    String?  @db.Text
  placement   Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  team      Team      @relation(fields: [teamId], references: [id])
  hackathon Hackathon @relation(fields: [hackathonId], references: [id])

  @@index([hackathonId])
}

model GraduateProfile {
  id         String   @id @default(cuid())
  userId     String   @unique
  headline   String?
  portfolio  String?
  linkedin   String?
  github     String?
  skills     String[]
  lookingFor String?
  isPublic   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

# API Endpoints — Kompletní Reference

## Existující Endpointy (25)

| #     | Method | Endpoint                       | Auth  | Rate Limit | Popis                |
| ----- | ------ | ------------------------------ | ----- | ---------- | -------------------- |
| 1     | POST   | /api/auth/[...nextauth]        | No    | 10/15min   | NextAuth handler     |
| 2     | POST   | /api/auth/register             | No    | 10/15min   | Registrace           |
| 3     | PUT    | /api/auth/profile              | Yes   | 100/h      | Aktualizace profilu  |
| 4     | GET    | /api/chapters                  | No    | 100/h      | Seznam kapitol       |
| 5     | GET    | /api/chapters/[id]             | No    | 100/h      | Detail kapitoly      |
| 6     | GET    | /api/chapters/[id]/content     | Yes   | 100/h      | Markdown obsah       |
| 7     | GET    | /api/chapters/published        | No    | 100/h      | Publikované kapitoly |
| 8     | POST   | /api/progress/complete-chapter | Yes   | 100/h      | Dokončit kapitolu    |
| 9     | GET    | /api/progress                  | Yes   | 100/h      | Progres uživatele    |
| 10    | GET    | /api/questions/[chapterId]     | Yes   | 100/h      | Otázky ke kapitole   |
| 11    | POST   | /api/questions/answer          | Yes   | 200/h      | Odpovědět na otázku  |
| 12    | POST   | /api/projects/submit           | Yes   | 50/h       | Odevzdat projekt     |
| 13    | POST   | /api/tests/module              | Yes   | 50/h       | Modulový test        |
| 14    | GET    | /api/user/stats                | Yes   | 100/h      | Statistiky           |
| 15    | PUT    | /api/user/profile-image        | Yes   | 20/h       | Upload foto          |
| 16    | GET    | /api/user/achievements         | Yes   | 200/h      | Achievements         |
| 17-22 | \*     | /api/admin/\*                  | Admin | 50-100/h   | Admin CRUD           |
| 23-25 | \*     | /api/arena/\*                  | Mixed | 20-100/h   | Arena endpoints      |

## Nové Endpointy (24)

### 3.1 Learning Path

```
GET /api/learning-path
Auth: Yes | Rate: 100/h
Response: {
  success: true,
  data: {
    nodes: [{
      id: "01",
      title: "Úvod do AI",
      module: 1,
      status: "completed"|"active"|"locked",
      stars: 0-3,
      position: { x, y },
      prerequisites: string[],
      lessonsTotal,
      lessonsCompleted,
      exercisesAvailable,
      reviewDue
    }],
    edges: [{ from: "01", to: "02" }],
    modules: [{ id: 1, name: "Základy AI", chaptersRange: ["01","05"] }],
    userProgress: { totalCompleted, currentChapter, totalStars, maxStars }
  }
}
```

### 3.2 Streak History

```
GET /api/user/streak-history?days=365
Auth: Yes | Rate: 100/h
Response: {
  success: true,
  data: {
    currentStreak,
    longestStreak,
    totalActiveDays,
    freezesUsed,
    freezesRemaining,
    history: [{
      date: "2025-01-15",
      xpEarned: 120,
      lessonsCompleted: 3,
      froze: false,
      active: true
    }]
  }
}
```

### 3.3 Hearts

```
GET /api/user/hearts
Auth: Yes | Rate: 200/h
Response: {
  hearts: 3,
  maxHearts: 5,
  nextRegenAt: "2025-02-05T18:00:00Z",
  unlimitedUntil: null,
  regenRateMinutes: 240
}

POST /api/user/hearts/refill
Auth: Yes | Rate: 20/h
Body: { method: "gems"|"practice" }
Response: { hearts: 5, gemsSpent: 350 }
```

### 3.4 Shop

```
GET /api/shop
Auth: Yes | Rate: 100/h
Response: {
  balance: { gems: 1500 },
  categories: [{
    name: "Power-ups",
    items: [{
      id, name, description, price, icon, category,
      purchasedThisWeek, maxPerWeek, canPurchase
    }]
  }]
}

POST /api/shop/purchase
Auth: Yes | Rate: 50/h
Body: { itemId: string }
Response: { purchase: {...}, newBalance: { gems }, effect: string }
```

### 3.5 Spaced Repetition

```
GET /api/review/session
Auth: Yes | Rate: 100/h
Response: {
  totalDue: 15,
  cards: [{
    id, conceptId, conceptName, chapterTitle,
    exercise: { type, question, data },
    difficulty: { easeFactor, interval, repetitions, lastRating }
  }],
  stats: { totalCards, masteredCards, learningCards, newCards }
}

POST /api/review/answer
Auth: Yes | Rate: 200/h
Body: { cardId, rating: "AGAIN"|"HARD"|"GOOD"|"EASY", timeSpent }
Response: { nextReviewAt, newInterval, newEaseFactor, xpEarned, questProgress }
```

### 3.6 Micro-Lessons

```
GET /api/micro-lessons/[chapterId]
Auth: Yes | Rate: 100/h
Response: {
  chapterId: "05",
  chapterTitle: "Datové struktury",
  lessons: [{
    id, order, title,
    status: "completed"|"active"|"locked",
    exerciseCount, xpReward, estimatedMinutes
  }],
  progress: { completed, total, percentage }
}
```

### 3.7 Exercises

```
POST /api/exercises/[id]/answer
Auth: Yes | Rate: 200/h
Body: { answer: any, timeSpent: number }
Response: {
  correct: boolean,
  correctAnswer?: any,
  explanation: string,
  xpEarned,
  heartsRemaining,
  heartLost: boolean,
  questProgress: [{ questId, newProgress, target }],
  nextExercise: { id } | null
}

POST /api/exercises/[id]/hint
Auth: Yes | Rate: 100/h
Body: { hintNumber: 1|2|3 }
Response: { hint: string, hintsRemaining, xpPenalty }
```

### 3.8 Leagues

```
GET /api/leagues/current
Auth: Yes | Rate: 100/h
Response: {
  currentTier: "GOLD",
  weeklyXP: 450,
  rank: 7,
  totalMembers: 30,
  promotionZone: 10,
  demotionZone: 25,
  daysRemaining: 3,
  nextTier: "PLATINUM",
  previousTier: "SILVER"
}

GET /api/leagues/leaderboard
Auth: Yes | Rate: 100/h
Response: {
  tier: "GOLD",
  weekStart, weekEnd,
  members: [{
    rank, userId, username, avatar, weeklyXP, level,
    isCurrentUser, zone: "promotion"|"safe"|"demotion"
  }],
  promotionCutoff, demotionCutoff
}
```

### 3.9 Quests

```
GET /api/quests/daily
GET /api/quests/weekly
Auth: Yes | Rate: 100/h
Response: {
  resetAt: "2025-02-06T00:00:00Z",
  quests: [{
    id, title, description, category, icon,
    targetValue, currentProgress, percentage,
    completed, claimed,
    rewards: { xp, gems }
  }],
  bonusQuest: { allCompleted, rewards: { xp, gems } }
}

POST /api/quests/[id]/claim
Auth: Yes | Rate: 50/h
Response: { xpEarned, gemsEarned, newBalance }
```

### 3.10 Friends

```
POST /api/friends/request      Body: { username }
POST /api/friends/accept       Body: { friendshipId }
POST /api/friends/reject       Body: { friendshipId }
DELETE /api/friends/[id]
GET /api/friends/list
GET /api/friends/leaderboard
POST /api/friends/encourage    Body: { friendId, type, message? }

GET /api/friends/list
Response: {
  friends: [{
    id, userId, username, avatar, level, streak, weeklyXP,
    lastActiveAt, status: "online"|"today"|"this_week"|"inactive"
  }],
  pendingReceived: [...],
  pendingSent: [...],
  totalFriends
}
```

### 3.11 AI Tutor

```
POST /api/ai-tutor/chat
Auth: Yes | Rate: 30/h
Body: { message, chapterId?, exerciseId?, conversationId? }
Response: {
  response: string,
  conversationId,
  suggestedFollowups: string[],
  codeBlocks: [{ language, code }],
  relatedConcepts: string[]
}

GET /api/ai-tutor/history?limit=50
Auth: Yes | Rate: 100/h
```

### 3.12 Notifications

```
GET /api/notifications?limit=20&unreadOnly=false
Auth: Yes | Rate: 100/h
Response: {
  unreadCount: 5,
  notifications: [{ id, type, title, message, data, read, createdAt }]
}

POST /api/notifications/read
Body: { ids: string[] | "all" }
```

### 3.13 Analytics

```
POST /api/analytics/event
Auth: Optional | Rate: 500/h
Body: { type: AnalyticsEventType, data?: object }
```

**Celkem nových endpointů: 24**
**Celkem endpointů po implementaci: 49**

---

# Časový Přehled

## Shrnutí všech fází

| Fáze                    | Týdny    | Odhad hodin | Odhad dní   |
| ----------------------- | -------- | ----------- | ----------- |
| Fáze 1: Kritické opravy | 1-2      | 53h         | 6.5         |
| Fáze 2: Tech debt       | 3-4      | 38h         | 5           |
| Fáze 3: Duolingo core   | 5-10     | 126.5h      | 16          |
| Fáze 4: Advanced        | 11-16    | 92h         | 11.5        |
| **CELKEM**              | **1-16** | **309.5h**  | **~39 dní** |

## Prioritní pořadí (pokud je čas omezený)

1. 🔴 **Fáze 1 kompletní** — základní kvalita a bezpečnost
2. 🟠 **3.1 Skill Tree** — vizuální wow efekt, core navigation
3. 🟠 **3.4 Micro-lessons + Exercises** — core learning loop
4. 🟡 **3.6 Hearts** — engagement loop
5. 🟡 **3.7 Celebrations** — dopamine hit
6. 🟡 **3.2 Streak** — retention mechanika
7. 🔵 **3.3 Shop** — monetizace příprava
8. 🔵 **3.5 Spaced Repetition** — learning effectiveness
9. 🔵 **4.2 Quests** — daily engagement
10. 🔵 **4.1 Leagues** — competition
11. ⚪ **4.3 Social** — virality
12. ⚪ **4.4 AI Tutor** — premium feature

---

_Vytvořeno Martinem Švandou v Praut s.r.o. — Učebnice Programování AI v1.0.37 → v2.0_
_Datum: 2025-02-05_
