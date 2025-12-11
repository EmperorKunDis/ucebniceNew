# Code Review Checklist - Pass 2

**Date:** 2025-12-11
**Repository:** ucebniceNew

## Critical Fixes (Must Fix)

- [ ] **Fix ModuleTestModal TypeScript errors**
  - File: `src/components/tests/ModuleTestModal.tsx`
  - Line 36: Change `setSelectedOption(answers[currentQuestionIndex])` to `setSelectedOption(answers[currentQuestionIndex] ?? null)`
  - Lines 176,180: Add undefined guard for `currentQuestion`

- [ ] **Fix validation data destructuring**
  - File: `src/app/api/chapters/progress/route.ts:26`
  - Add null check: `if (!validation.data) return error response`
  - File: `src/app/api/projects/submit/route.ts:146`
  - Same fix needed

## High Priority Fixes

- [ ] **Fix unused variable in achievement-checker**
  - File: `src/lib/achievement-checker.ts:22`
  - Change `completedChapters,` to `_completedChapters,` or remove from destructuring

- [ ] **Fix Zod error access pattern**
  - File: `src/lib/env.ts:64`
  - Change `result.error.errors.forEach` to `result.error.issues.forEach`
  - Add type: `(err: z.ZodIssue)`

- [ ] **Fix validation-schemas Zod issues**
  - File: `src/lib/validation-schemas.ts:113`
  - Change `error.errors` to `error.issues`
  - Add type annotation for err parameter

- [ ] **Fix validations.ts Zod error access**
  - File: `src/lib/validations.ts:88-89`
  - Change `.errors` to `.issues`
  - Add type annotation

- [ ] **Fix signin page Zod access**
  - File: `src/app/auth/signin/page.tsx:35`
  - Change `validation.error.errors` to `validation.error.issues`
  - Add type: `(err: z.ZodIssue)`

- [ ] **Fix cache.ts unused decorator params**
  - File: `src/lib/cache.ts:243`
  - Change `target` to `_target`
  - Change `propertyName` to `_propertyName`

- [ ] **Fix Storybook stories missing args**
  - File: `src/components/chapters/ChapterCard.stories.tsx:97`
  - Add `args: { chapter: mockChapterBasic }` to MultipleChapters
  - File: `src/components/ui/button.stories.tsx:143`
  - Add `args: {}` to AllVariants

## Medium Priority (Code Quality)

- [ ] **Remove or consolidate console.log statements**
  - Consider adding a logging service
  - Files affected: 25+ files with console.error/warn

- [ ] **Fix onboarding-flow Box component type issue**
  - File: `src/components/onboarding/onboarding-flow.tsx:178,200`
  - Either extend Box to support button type or use native button

- [ ] **Fix onboarding unused destructured elements**
  - File: `src/app/api/onboarding/complete/route.ts:55`
  - Either use goal/experience or prefix with underscore

## Low Priority (Cleanup)

- [ ] **Address TODO comments**
  - `src/app/api/leaderboard/route.ts:96`
  - `src/app/api/progress/complete-chapter/route.ts:232,233`

- [ ] **Clean up unused e2e/script code**
  - Remove or update deprecated migration scripts
  - Fix or remove e2e tests referencing old schema

- [ ] **Consider merging duplicate validation files**
  - `src/lib/validation-schemas.ts`
  - `src/lib/validations.ts`

## Architecture Improvements (Optional)

- [ ] **Optimize N+1 query in achievement-checker**
  - File: `src/lib/achievement-checker.ts:112-140`
  - Use `prisma.$transaction` with batched operations

- [ ] **Extend Box component for polymorphism**
  - File: `src/components/layout/box.tsx`
  - Add support for button and other interactive elements

## Verification Steps After Fixes

1. Run `npx tsc --noEmit` - should have 0 errors in src/
2. Run `npm run build` - should complete successfully
3. Run `npm test` - all tests should pass
4. Run `npm run lint` - no new warnings
