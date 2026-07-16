import { describe, expect, it } from 'vitest'
import {
  canonicalExerciseSourceKeys,
  canonicalLessonSourceKey,
  isCanonicalChapterId,
  isCanonicalExerciseSourceKey,
} from '../canonical-content-keys'

describe('canonical content source keys', () => {
  it('accepts only the public chapter ids 01 through 40', () => {
    expect(isCanonicalChapterId('01')).toBe(true)
    expect(isCanonicalChapterId('40')).toBe(true)
    expect(isCanonicalChapterId('00')).toBe(false)
    expect(isCanonicalChapterId('41')).toBe(false)
    expect(isCanonicalChapterId('db-only')).toBe(false)
  })

  it('defines exactly one lesson and ten exercises for a public chapter slug', () => {
    expect(canonicalLessonSourceKey('01')).toBe('lesson:01')
    expect(canonicalExerciseSourceKeys('01')).toEqual([
      'exercise:01:01',
      'exercise:01:02',
      'exercise:01:03',
      'exercise:01:04',
      'exercise:01:05',
      'exercise:01:06',
      'exercise:01:07',
      'exercise:01:08',
      'exercise:01:09',
      'exercise:01:10',
    ])
  })

  it('rejects DB-only exercises even when they share the canonical prefix', () => {
    expect(isCanonicalExerciseSourceKey('exercise:01:10', '01')).toBe(true)
    expect(isCanonicalExerciseSourceKey('exercise:01:11', '01')).toBe(false)
    expect(isCanonicalExerciseSourceKey('exercise:01:custom', '01')).toBe(false)
    expect(isCanonicalExerciseSourceKey(null, '01')).toBe(false)
  })
})
