export const CANONICAL_EXERCISES_PER_CHAPTER = 10
export const CANONICAL_CHAPTER_COUNT = 40

export function canonicalChapterIdsThrough(end = CANONICAL_CHAPTER_COUNT): string[] {
  return Array.from({ length: Math.max(0, Math.min(end, CANONICAL_CHAPTER_COUNT)) }, (_, index) =>
    String(index + 1).padStart(2, '0')
  )
}

const CANONICAL_CHAPTER_ID_SET = new Set(canonicalChapterIdsThrough())

export function isCanonicalChapterId(chapterId: string): boolean {
  return CANONICAL_CHAPTER_ID_SET.has(chapterId)
}

export function canonicalChapterIdsInRange(start: number, end: number): string[] {
  return canonicalChapterIdsThrough(end).slice(Math.max(0, start - 1))
}

export function canonicalPreviousChapterId(chapterId: string): string | null {
  const ids = canonicalChapterIdsThrough()
  const index = ids.indexOf(chapterId)
  return index > 0 ? (ids[index - 1] ?? null) : null
}

export function canonicalLessonSourceKey(chapterId: string): string {
  return `lesson:${chapterId}`
}

export function canonicalExerciseSourcePrefix(chapterId: string): string {
  return `exercise:${chapterId}:`
}

export function canonicalExerciseSourceKey(chapterId: string, order: number): string {
  return `${canonicalExerciseSourcePrefix(chapterId)}${String(order).padStart(2, '0')}`
}

export function canonicalExerciseSourceKeys(chapterId: string): string[] {
  return Array.from({ length: CANONICAL_EXERCISES_PER_CHAPTER }, (_, index) =>
    canonicalExerciseSourceKey(chapterId, index + 1)
  )
}

export function canonicalExerciseSourceKeysForCourse(end = CANONICAL_CHAPTER_COUNT): string[] {
  return canonicalChapterIdsThrough(end).flatMap(canonicalExerciseSourceKeys)
}

export function isCanonicalExerciseSourceKey(sourceKey: string | null, chapterId: string): boolean {
  return sourceKey ? canonicalExerciseSourceKeys(chapterId).includes(sourceKey) : false
}
