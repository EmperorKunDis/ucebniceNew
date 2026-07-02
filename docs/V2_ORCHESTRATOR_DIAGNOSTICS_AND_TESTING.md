# Ucebnice v2 Orchestrator Diagnostics And Testing

Purpose: create one source of truth for diagnosing, testing, and safely steering Ucebnice toward a clean v2 product. This document is for the orchestrator and all role agents. It is documentation only; it does not authorize code changes, migrations, deploys, data deletion, commits, or pushes.

## Product North Star

Ucebnice v2 must feel like a coherent top-tier learning product, not a bundle of unrelated features. Every feature must support one continuous learning logic:

- A learner can sign in, understand where they are, continue learning, complete work, receive feedback, and see progress without dead ends.
- Static textbook content and gamified learning must either be intentionally separated or intentionally unified. No route should accidentally depend on another version's progress semantics.
- XP, gems, streaks, quests, achievements, review, and certificates must reinforce learning behavior instead of creating contradictory incentives.
- Any new feature must define how it affects auth, progress, quests, rewards, analytics, accessibility, and regression tests before implementation.

Current strategic default: keep both experiences available while preparing clean v2. Treat `/chapters` as the static textbook experience and `/dashboard` plus `/learn/*` as the gamified learning experience. Shared systems are user identity, global rewards, achievements, and controlled chapter catalog mapping.

## Current System Map

### Static Textbook

- Routes: `/chapters`, `/chapters/[chapterId]`.
- Catalog: `src/data/chapters.ts`.
- Content: markdown files under `public/prednasky`, videos under runtime video storage/data files.
- UI: `ChapterLayout` and chapter-specific components.
- Progress source: `ChapterCompletion`.
- User-facing completion logic:
  - star 1: `completedChapter`
  - star 2: `answeredQuestions`
  - star 3: `submittedProject`
- Main APIs:
  - `/api/chapters/all-progress`
  - `/api/chapters/progress`
  - `/api/progress/complete-chapter`
  - `/api/questions/answer`
  - `/api/projects/submit`

### Gamified Learning

- Routes: `/dashboard`, `/learn`, `/learn/[chapterId]`, `/learn/[chapterId]/lesson/[lessonId]`, `/learn/[chapterId]/practice`.
- Catalog and learning data: DB `Chapter`, `MicroLesson`, `Exercise`, `Concept`, review cards.
- Progress source: `ChapterProgress`.
- Rewards and retention: hearts, gems, streak, quests, review sessions, achievements.
- Main APIs:
  - `/api/learning-path`
  - `/api/micro-lessons/[chapterId]`
  - `/api/micro-lessons/lesson/[lessonId]`
  - `/api/micro-lessons/lesson/[lessonId]/complete`
  - `/api/exercises/[id]/answer`
  - `/api/quests`
  - `/api/quests/claim`
  - `/api/user/hearts`
  - `/api/review/session`
  - `/api/review/answer`

### Shared And Risky Areas

- `Chapter` is shared as a DB catalog and relation anchor.
- `ChapterCompletion` stores static textbook progress using public chapter IDs such as `"01"`.
- `ChapterProgress` stores gamified lesson progress and relates to DB `Chapter.id`.
- `CompletedChapter` is legacy but still used by compatibility code and some derived counts.
- Global `User` fields (`xp`, `gems`, `currentStreak`, `dailyXP`, `level`) are shared by both learning modes.
- Quest categories are shared. `CHAPTERS_COMPLETED` must mean static chapter completion; `LESSONS_COMPLETED` must mean micro-lesson completion; `XP_EARNED` may remain global.
- `/api/learning-path` currently mixes `ChapterCompletion` and `ChapterProgress`. This must be diagnosed before changing behavior.

## Role Protocol

### Orchestrator

- Owns scope, sequencing, and handoff quality.
- Starts every work session with `git status --short --branch`.
- Reads required project context before non-trivial work: `_AI_INDEX.md`, `.hermes/agents.md`, `.hermes/discord.md`, `CLAUDE.md`, and nearest `_AI.md` files.
- Keeps a decision log for product semantics: source of truth, progress ownership, route ownership, reward ownership.
- Does not allow implementation before diagnostics and acceptance criteria are explicit.

### Architect

- Maps DB models, API contracts, progress semantics, and migration risk.
- Defines source-of-truth boundaries:
  - static chapter completion: `ChapterCompletion`
  - gamified lesson progress: `ChapterProgress`
  - legacy compatibility: read-only `CompletedChapter` until migration cleanup
- Flags ID namespace risks between public chapter IDs and DB UUIDs.

### Backend

- Verifies auth, session handling, API contracts, Prisma queries, transactions, rate limiting, quest tracking, rewards, and cache invalidation.
- Adds or updates contract tests before behavior changes.
- Ensures all mutations are idempotent where repeated user actions are plausible.

### Frontend

- Verifies route flows, UI state, empty/error/loading states, keyboard navigation, responsive layout, and visual consistency.
- Confirms every UI expectation matches API response contracts.
- Treats `/chapters` and `/learn` as different learning experiences unless product strategy changes.

### QA

- Owns test matrix, smoke tests, regression suites, browser/device coverage, accessibility checks, and console/network audits.
- Records exact browser, viewport, OS, user state, seed state, and failing route for every finding.

### Security

- Reviews auth boundaries, protected routes, session expiration, OAuth and credentials behavior, rate limits, secret handling, upload/submission safety, and admin authorization.
- Confirms no secrets, `.env` files, tokens, dumps, or production credentials enter the repo.

### Accessibility And Product Design

- Reviews information architecture, clarity of progress states, reward meaning, focus management, reduced motion, color contrast, screen reader behavior, and mobile ergonomics.
- Ensures new UI additions follow one coherent product language.

### DevOps

- Verifies local/dev/test/prod separation, Docker Compose readiness, CI gates, environment variables, database safety, monitoring, and rollback plans.
- Does not deploy, restart production, run production migrations, or delete production data without explicit approval.

## Diagnostic Checklist

### Auth And Session

- Verify credential sign up, sign in, sign out, invalid credentials, duplicate registration, session refresh, expired session, and protected route redirects.
- Verify OAuth configuration paths if enabled.
- Confirm user identity consistency across NextAuth session, Prisma user, topbar, profile, quests, hearts, and API calls.
- Confirm unauthenticated API responses are intentional and consistent: either `401` or safe empty state, never accidental data leakage.

### Static Textbook Flow

- `/chapters` loads static catalog and shows module progress from `/api/chapters/all-progress`.
- `/chapters/[chapterId]` loads static chapter content from `src/data/chapters.ts`.
- Locking uses previous static chapter completion only.
- Completing a static chapter updates `ChapterCompletion.completedChapter`.
- Answering all classic questions updates `ChapterCompletion.answeredQuestions`.
- Approved project submission updates `ChapterCompletion.submittedProject`.
- Static completion may award XP/gems/quests only according to explicit static rules.

### Gamified Learning Flow

- `/dashboard` loads skill tree from `/api/learning-path`.
- Chapter node status, stars, lesson progress, and lock state are internally consistent.
- `/learn/[chapterId]` receives the exact overview contract it renders.
- `/learn/[chapterId]/lesson/[lessonId]` loads lesson detail and exercises.
- Answer submission updates exercise attempt state, hearts, XP, and feedback correctly.
- Lesson completion updates only `ChapterProgress` and `LESSONS_COMPLETED` quests.
- `/learn/[chapterId]/practice` returns a non-empty practice set when exercises exist.
- Review sessions load due cards and update spaced repetition state without corrupting lesson progress.

### Quest And Reward System

- `/api/quests` returns active daily/weekly quests and user progress after login.
- Quest progress is derived or updated consistently for:
  - chapter completion
  - lesson completion
  - XP earned
  - review sessions
  - streak maintained
  - perfect exercises
  - hearts preserved
- Claiming a quest reward is idempotent and cannot double-award XP or gems.
- Quest reset boundaries are defined for daily and weekly quests.
- User topbar/profile/dashboard reflect XP, gems, hearts, and streak after reward-affecting actions.

### Data And Content Integrity

- Static catalog has expected chapters `"01"` through `"40"`.
- DB `Chapter` rows map to the same public chapter IDs.
- Micro-lessons exist only for supported gamified chapters.
- Classic `Question` rows and micro `Exercise` rows do not use incompatible chapter ID namespaces.
- Markdown/video references resolve or fail with user-friendly states.
- Seed scripts do not create contradictory active quests.

### Admin, Analytics, Certificate

- Admin routes require admin role.
- Analytics distinguish static chapter completions from gamified lesson completions.
- Certificate eligibility uses the intended v2 completion definition.
- User stats do not double-count legacy and current completions.

### Error, Empty, Loading, Offline

- Every critical route has loading state, empty state, and error state.
- API failures do not leave infinite spinners.
- Network errors during answer/claim/submit show retryable feedback.
- Repeated clicks do not duplicate progress or rewards.
- Browser console has no uncaught runtime errors during smoke flows.

## Cross-Platform Test Matrix

Minimum manual and automated coverage:

| Category         | Targets                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Desktop browsers | Chrome/Chromium, Firefox, Safari/WebKit                                              |
| Mobile browsers  | Mobile Chrome, Mobile Safari                                                         |
| Viewports        | 360x800, 390x844, 768x1024, 1024x768, 1366x768, 1440x900, 1920x1080                  |
| Input modes      | mouse, touch, keyboard-only                                                          |
| User states      | unauthenticated, new user, active learner, partially complete, fully complete, admin |
| Data states      | empty DB, seeded core data, seeded Duolingo data, migrated legacy data               |
| Network states   | normal, slow 3G simulation, failed API request                                       |

Current known gap: Playwright config includes Chromium plus mobile profiles; desktop Firefox and WebKit are present but commented out. Clean v2 readiness requires enabling or separately running them before release.

## Acceptance Criteria For Clean v2

- A new user can register, sign in, land in the intended v2 starting experience, and complete a meaningful first learning action.
- Returning users always see a correct next action.
- Static textbook progress and gamified lesson progress cannot accidentally mark each other complete.
- Quests load reliably after authentication and update after relevant actions.
- XP, gems, hearts, streak, and achievements are consistent across topbar, dashboard, profile, and API state.
- All critical flows work on desktop and mobile without layout overlap, unreachable controls, or hidden primary actions.
- Keyboard-only users can complete auth, navigation, lesson, practice, and quest claim flows where feasible.
- There are no known console errors, hydration mismatches, broken links, or infinite loading states on critical routes.
- Data model ownership is documented before any cleanup of `CompletedChapter`.
- CI gates pass: type check, lint, targeted unit/API tests, and Playwright smoke.

## Recommended Test Suites To Add Or Expand

### API Contract Tests

- `/api/chapters/all-progress`
- `/api/chapters/progress`
- `/api/learning-path`
- `/api/micro-lessons/[chapterId]`
- `/api/micro-lessons/lesson/[lessonId]`
- `/api/micro-lessons/lesson/[lessonId]/complete`
- `/api/quests`
- `/api/quests/claim`
- `/api/user/hearts`

### Playwright Smoke Flows

- Auth: sign up, sign in, sign out, invalid credentials.
- Static textbook: open `/chapters`, open `/chapters/01`, complete static chapter, answer classic questions, submit project path.
- Gamified learning: open `/dashboard`, open `/learn/01`, complete one micro-lesson, open practice, run review if due.
- Quest flow: open quests, generate progress through action, claim reward, confirm topbar/profile update.
- Isolation: completing a micro-lesson must not mark static chapter star 1; completing static chapter must not increment micro-lesson count.

### Visual And Accessibility Checks

- Screenshot critical routes at each viewport.
- Verify no text overlap or clipped primary controls.
- Verify focus rings, tab order, modal focus trap, escape/close behavior.
- Verify color contrast for progress, locked, active, completed, error, and success states.
- Verify reduced motion path for celebratory animations.

## Safe v2 Separation Strategy

1. Freeze semantics in documentation before code changes.
2. Add contract tests around current behavior.
3. Fix broken contracts without changing DB schema.
4. Separate read models:
   - static textbook reads static chapter catalog and `ChapterCompletion`
   - gamified learning reads DB chapter catalog, `MicroLesson`, `Exercise`, and `ChapterProgress`
5. Separate write models:
   - `/chapters` writes only static completion/question/project state
   - `/learn` writes only lesson/exercise/review state
6. Make quest category mapping explicit.
7. Backfill legacy data only after tests prove current behavior.
8. Stop new writes to `CompletedChapter` only after migration compatibility is verified.
9. Remove legacy reads only in a separate cleanup phase.

## Innovation Guardrails

New or improved features are allowed only if they connect to the same product logic:

- They must define their learner value.
- They must specify which progress model they read and write.
- They must specify quest/reward effects.
- They must include loading, empty, error, and retry states.
- They must work in the cross-platform matrix or explicitly be marked out of release scope.
- They must not introduce a second visual language, conflicting reward system, or duplicate source of truth.

Examples of coherent v2 improvements:

- A unified "Continue learning" decision engine that chooses the next static chapter, micro-lesson, review, or quest action based on documented priority.
- A progress ledger/debug view for admin or QA showing exactly why a user sees a node as locked, active, or completed.
- A quest explanation panel showing which action advances each quest.
- A release readiness dashboard that summarizes auth, quests, learning progress, data integrity, and browser smoke status.

## Agent Handoff Protocol

Every agent taking over must start with:

1. Read this document.
2. Run `git status --short --branch`.
3. Read required project context from `AGENTS.md`.
4. Read nearest `_AI.md` files for the area being diagnosed.
5. State which subsystem is being diagnosed and which source of truth it uses.
6. Avoid code edits until the relevant diagnostics and acceptance criteria are explicit.
7. If edits are later approved, verify and report:
   - files changed
   - tests run
   - tests not run
   - remaining risks
   - whether any unrelated working tree changes were left untouched

## Context Reset Instruction

After this document is created, future v2 work should treat it as the durable context anchor. Do not rely on chat memory as the source of truth. If a future agent needs to continue, it should load this document and the required project context, then proceed from the documented diagnostics and acceptance criteria.
