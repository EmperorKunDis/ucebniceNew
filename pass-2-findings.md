# Code Review Findings - Pass 2

**Date:** 2025-12-11
**Repository:** ucebniceNew
**Previous issues count:** 44

## Summary

Found **52 issues** across the codebase covering TypeScript errors, code quality, security, and architecture concerns.

---

## Critical Issues (5)

### 1. TypeScript Errors - Outdated Prisma Schema References

- **Severity:** Critical
- **Files:** e2e/_.ts, scripts/migration/_.ts
- **Lines:** Multiple (see TypeScript output)
- **Description:** E2E tests and migration scripts reference non-existent Prisma models (`lesson`, `completedLesson`, `lessonProgress`)
- **Fix:** Update tests to use current schema models (`chapter`, `chapterCompletion`)

### 2. Type Error - validateQueryParams Returns Undefined Property

- **Severity:** Critical
- **File:** src/app/api/chapters/progress/route.ts:26
- **Description:** `validation.data?.chapterId` could be undefined but is accessed directly
- **Fix:** Add proper null check before destructuring

### 3. Type Error - Same issue in projects/submit

- **Severity:** Critical
- **File:** src/app/api/projects/submit/route.ts:146
- **Description:** `validation.data?.chapterId` could be undefined
- **Fix:** Add proper null check

### 4. Type Error - ModuleTestModal undefined check

- **Severity:** Critical
- **File:** src/components/tests/ModuleTestModal.tsx:176,180
- **Description:** `currentQuestion` is possibly undefined
- **Fix:** Add undefined guard before accessing properties

### 5. Type Error - setSelectedOption type mismatch

- **Severity:** Critical
- **File:** src/components/tests/ModuleTestModal.tsx:36
- **Description:** `undefined` not assignable to `SetStateAction<number | null>`
- **Fix:** Use null coalescing: `answers[currentQuestionIndex] ?? null`

---

## High Issues (12)

### 6. Unused Variable - completedChapters

- **Severity:** High
- **File:** src/lib/achievement-checker.ts:22
- **Description:** Variable `completedChapters` declared but never read
- **Fix:** Remove or use the variable

### 7. N+1 Query Pattern in Achievement Checker

- **Severity:** High
- **File:** src/lib/achievement-checker.ts:112-140
- **Description:** For loop with individual Prisma queries for each badge
- **Fix:** Batch create achievements using `createMany` or `$transaction`

### 8. Zod v4 API Breaking Change - errorMap

- **Severity:** High
- **File:** src/lib/validation-schemas.ts:77,84
- **Description:** `errorMap` property doesn't exist in Zod v4 enum overloads
- **Fix:** Use `{ message: '...' }` syntax instead of `errorMap`

### 9. Zod Error Access Pattern

- **Severity:** High
- **Files:** src/lib/env.ts:64, src/lib/validation-schemas.ts:113, src/lib/validations.ts:88
- **Description:** Accessing `.errors` on ZodError (should use `.issues` or `.format()`)
- **Fix:** Use `error.issues` instead of `error.errors`

### 10. Implicit Any Types

- **Severity:** High
- **Files:** src/lib/env.ts:64, src/lib/validation-schemas.ts:113, src/lib/validations.ts:89, src/app/auth/signin/page.tsx:35
- **Description:** Parameter `err` implicitly has `any` type
- **Fix:** Add explicit type annotations

### 11. Storybook Stories Missing Required Args

- **Severity:** High
- **File:** src/components/chapters/ChapterCard.stories.tsx:97
- **Description:** `MultipleChapters` story missing required `args.chapter`
- **Fix:** Add empty args or adjust story type

### 12. Storybook Stories Missing Required Args

- **Severity:** High
- **File:** src/components/ui/button.stories.tsx:143
- **Description:** `AllVariants` story missing required `args`
- **Fix:** Add empty args or adjust story type

### 13. Box Component Type Issue

- **Severity:** High
- **File:** src/components/onboarding/onboarding-flow.tsx:178,200
- **Description:** `type` prop doesn't exist on Box component when using `as="button"`
- **Fix:** Update Box props to include button attributes when `as="button"`

### 14. Chapter Card Stories - Number vs String Type

- **Severity:** High
- **File:** src/components/chapters/ChapterCard.stories.tsx:30,41,52,62
- **Description:** `hours` property is number but Chapter type expects string
- **Fix:** Check Chapter type definition and update stories accordingly

### 15. Unused Imports in Stories

- **Severity:** High
- **File:** e2e/mobile-responsive.spec.ts:1
- **Description:** `devices` imported but never used
- **Fix:** Remove unused import

### 16. Unused Variable - result

- **Severity:** High
- **File:** scripts/sync-lesson-titles.ts:23
- **Description:** Variable `result` declared but never read
- **Fix:** Remove or use the variable

### 17. Unused Decorator Parameters

- **Severity:** High
- **File:** src/lib/cache.ts:243
- **Description:** `target` and `propertyName` declared but never read
- **Fix:** Prefix with underscore or remove

---

## Medium Issues (25)

### 18-42. Console.log Statements (25 instances)

- **Severity:** Medium
- **Description:** Production code contains console.error/warn statements
- **Locations:**
  - src/lib/admin-auth.ts:48
  - src/components/ErrorBoundary.tsx:55
  - src/lib/cache.ts:71,76,94,108,124,138,152,168
  - src/lib/env.ts:63,65,72
  - src/components/onboarding/onboarding-flow.tsx:500,541
  - src/app/profile/page.tsx:79
  - src/components/profile/ProfilePhotoUpload.tsx:72
  - src/lib/api-client.ts:263
  - src/lib/api-middleware.ts:74
  - src/lib/achievement-checker.ts:155
  - src/app/leaderboard/page.tsx:384
  - src/app/admin/achievements/page.tsx:30
  - src/app/api/questions/answer/route.ts:124
  - And 30+ more...
- **Fix:** Use proper logging service or remove for production

---

## Low Issues (10)

### 43-45. TODO Comments

- **Severity:** Low
- **Locations:**
  - src/app/api/leaderboard/route.ts:96 - "TODO: Track rank changes over time"
  - src/app/api/progress/complete-chapter/route.ts:232 - "TODO: track challenges"
  - src/app/api/progress/complete-chapter/route.ts:233 - "TODO: track perfect scores"
- **Fix:** Create tickets or implement features

### 46. Destructured Elements Unused

- **Severity:** Low
- **File:** src/app/api/onboarding/complete/route.ts:55
- **Description:** Destructured `goal` and `experience` not used after validation
- **Fix:** Store these values in user profile or remove

### 47-52. Migration Scripts Type Errors

- **Severity:** Low
- **Description:** Old migration scripts reference outdated schema
- **Fix:** Update or remove deprecated scripts

---

## Architecture Issues

### Duplicate Validation Schemas

- **Files:** src/lib/validation-schemas.ts AND src/lib/validations.ts
- **Description:** Two files with overlapping validation functionality
- **Fix:** Consolidate into single file

### Box Component Limited "as" Prop

- **File:** src/components/layout/box.tsx
- **Description:** Box only supports div-like elements, not buttons
- **Fix:** Extend BoxProps to support button attributes when needed

---

## Security Notes

- No hardcoded secrets found
- No SQL injection vulnerabilities (using Prisma ORM)
- No XSS via dangerouslySetInnerHTML
- Proper authentication checks in API routes
- Rate limiting implemented

---

## Recommendations

1. **Immediate:** Fix TypeScript errors to ensure build passes
2. **High Priority:** Fix N+1 query in achievement-checker
3. **Medium Priority:** Replace console.log with proper logging
4. **Low Priority:** Clean up TODO comments and unused code
