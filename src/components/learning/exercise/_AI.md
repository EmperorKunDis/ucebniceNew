# src/components/learning/exercise/ - AI Context

## PURPOSE

Server-authoritative exercise inputs for the v2 lesson flow. Components collect a user answer; only `/api/exercises/[id]/answer` decides correctness, rewards XP and returns feedback.

## PUBLIC DATA CONTRACT

The browser receives display fields only:

```typescript
// MULTIPLE_CHOICE: { options: string[] }
// CODE_OUTPUT: { code: string, language?: string, options: string[] }
// TRUE_FALSE: {}
// FILL_IN_BLANK: { text: string } // blank count comes from ___ placeholders
// MATCH_PAIRS: { leftItems: string[], rightItems: string[] }
// TYPE_ANSWER: {}
```

Never add `correctIndex`, `isTrue`, `answers`, `alternatives`, ordered answer pairs or any other answer key to component props or browser evaluation.

## CALLBACK PATTERN

Leaf inputs call `onAnswer(answer)` exactly once. `ExercisePlayer` POSTs that answer and waits for the server response before it renders correct/incorrect feedback.

`MATCH_PAIRS` submits:

```typescript
Array<{ left: string; right: string }>
```

`onComplete(isCorrect, xpEarned)` remains the lesson-level callback and uses server response values only.

## GOTCHAS

1. Every explicit attempt gets a new idempotency key. A transport/502-504 retry reuses that key; after both requests fail, the leaf input remounts for a new explicit attempt.
2. Fill-in-the-blank inputs derive their count from `___`; no answer array is needed.
3. Match-pair columns are already independently ordered by the API; do not infer correctness from array indexes.
4. Explanations may come from the answer response and must never include an answer key.
5. Keep leaf selection styling neutral until server feedback is available.

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: ExercisePlayer.tsx -->
