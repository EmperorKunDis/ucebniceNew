# Changes Made - Pass 2

**Date:** 2025-12-11
**Repository:** ucebniceNew

## Summary

Fixed **15 TypeScript errors** and improved code quality across multiple files.

---

## Files Modified

### 1. src/components/tests/ModuleTestModal.tsx

**Changes:**

- Line 36: Fixed `setSelectedOption` type error by using null coalescing (`?? null`)
- Lines 176, 180: Added optional chaining for `currentQuestion` access

```typescript
// Before
setSelectedOption(answers[currentQuestionIndex])
currentQuestion.question

// After
setSelectedOption(answers[currentQuestionIndex] ?? null)
currentQuestion?.question
```

---

### 2. src/app/api/chapters/progress/route.ts

**Changes:**

- Line 19: Added `|| !validation.data` check to ensure data exists before destructuring

```typescript
// Before
if (!validation.success) {

// After
if (!validation.success || !validation.data) {
```

---

### 3. src/app/api/projects/submit/route.ts

**Changes:**

- Line 138: Same fix as chapters/progress/route.ts - added data null check

---

### 4. src/lib/achievement-checker.ts

**Changes:**

- Line 22: Renamed unused variable `completedChapters` to `_completedChaptersCount`

```typescript
// Before
completedChapters,

// After
_completedChaptersCount,
```

---

### 5. src/lib/env.ts

**Changes:**

- Line 64: Fixed Zod error access pattern (`.errors` -> `.issues`) and added type annotation

```typescript
// Before
result.error.errors.forEach(err => {

// After
result.error.issues.forEach((err: z.ZodIssue) => {
```

---

### 6. src/lib/validation-schemas.ts

**Changes:**

- Lines 77, 84: Fixed Zod v4 enum API (`errorMap` -> `message`)
- Lines 113-117: Fixed Zod error access and added undefined check for path

```typescript
// Before
z.enum([...], { errorMap: () => ({ message: '...' }) })
error.errors.forEach(err => {
  if (err.path.length > 0) {
    errors[err.path[0].toString()] = err.message

// After
z.enum([...], { message: '...' })
error.issues.forEach((err: z.ZodIssue) => {
  const firstPath = err.path[0]
  if (firstPath !== undefined) {
    errors[firstPath.toString()] = err.message
```

---

### 7. src/lib/validations.ts

**Changes:**

- Lines 88-95: Fixed Zod error access pattern and removed unused catch variable

```typescript
// Before
const errors = result.error.errors
  .map(err => `${err.path.join('.')}: ${err.message}`)
} catch (error) {

// After
const errors = result.error.issues
  .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
} catch {
```

---

### 8. src/app/auth/signin/page.tsx

**Changes:**

- Line 15: Added `z` import from zod
- Lines 36-40: Fixed Zod error access and added undefined check

---

### 9. src/lib/cache.ts

**Changes:**

- Line 243: Prefixed unused decorator parameters with underscore

```typescript
// Before
return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {

// After
return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
```

---

### 10. src/components/chapters/ChapterCard.stories.tsx

**Changes:**

- Lines 30, 43, 56, 68: Changed `hours` from number to string type
- Lines 31-32, 44-45, 57-58, 69-70: Added required `textFile` and `lectureFile` properties
- Lines 98-100: Added required `args` property to MultipleChapters story

---

### 11. src/components/ui/button.stories.tsx

**Changes:**

- Lines 144-146: Added required `args` property to AllVariants story

---

### 12. src/components/onboarding/onboarding-flow.tsx

**Changes:**

- Lines 176-182, 197-207: Replaced `Box as="button" type="button"` with native `button` element

```typescript
// Before
<Box as="button" type="button" onClick={...}>

// After
<button type="button" onClick={...}>
```

---

### 13. src/app/api/onboarding/complete/route.ts

**Changes:**

- Line 55-57: Prefixed unused destructured variables with underscore

```typescript
// Before
const { goal, experience } = validation.data

// After
const { goal: _goal, experience: _experience } = validation.data
```

---

## Verification

After changes:

```bash
npx tsc --noEmit 2>&1 | grep "^src/"
# No errors in src/ directory
```

---

## Not Fixed (Out of Scope)

- E2E tests with outdated schema references (e2e/\*.ts)
- Migration scripts with deprecated models (scripts/\*.ts)
- Console.log statements (considered acceptable for error logging)
- N+1 query in achievement-checker (requires more significant refactoring)

---

## Recommendations for Next Pass

1. Remove or update deprecated e2e tests
2. Clean up migration scripts
3. Implement proper logging service
4. Optimize N+1 query in achievement-checker with batched operations
