import { describe, expect, it } from 'vitest'
import {
  emptyChapterProgress,
  mergeCanonicalProgressStates,
  mergeChapterProgress,
  type LegacyProgressEvidence,
} from '../progress-merge'

const completedAt = new Date('2025-01-01T10:00:00.000Z')
const questionsAt = new Date('2025-01-02T10:00:00.000Z')
const projectAt = new Date('2025-01-03T10:00:00.000Z')

function fullEvidence(): LegacyProgressEvidence {
  return {
    contentCompleted: true,
    exercisesCompleted: true,
    projectApproved: true,
    lessonsCompleted: 1,
    correctExerciseCount: 10,
    totalExerciseAttempts: 10,
    requiredExerciseCount: 10,
    contentCompletedAt: completedAt,
    exercisesCompletedAt: questionsAt,
    projectApprovedAt: projectAt,
    lastActivityAt: projectAt,
  }
}

describe('mergeChapterProgress', () => {
  it('merges all legacy evidence into explicit three-star progress without rewards', () => {
    const merged = mergeChapterProgress(
      {
        ...emptyChapterProgress(completedAt),
        progress: 40,
        exercisesCorrect: 12,
        exercisesTotal: 20,
        timeSpentSeconds: 900,
      },
      fullEvidence()
    )

    expect(merged).toMatchObject({
      progress: 100,
      lessonsCompleted: 1,
      exercisesCorrect: 12,
      exercisesTotal: 20,
      timeSpentSeconds: 900,
      contentCompleted: true,
      exercisesCompleted: true,
      projectApproved: true,
      stars: 3,
      contentCompletedAt: completedAt,
      exercisesCompletedAt: questionsAt,
      projectApprovedAt: projectAt,
    })
  })

  it('never decreases newer canonical progress', () => {
    const current = {
      ...emptyChapterProgress(projectAt),
      progress: 100,
      currentStep: 8,
      totalSteps: 8,
      lessonsCompleted: 3,
      exercisesCorrect: 25,
      exercisesTotal: 30,
      contentCompleted: true,
      exercisesCompleted: true,
      projectApproved: true,
      stars: 3,
      contentCompletedAt: completedAt,
      exercisesCompletedAt: questionsAt,
      projectApprovedAt: projectAt,
    }
    const weakEvidence: LegacyProgressEvidence = {
      contentCompleted: false,
      exercisesCompleted: false,
      projectApproved: false,
      lessonsCompleted: 0,
      correctExerciseCount: 1,
      totalExerciseAttempts: 1,
      requiredExerciseCount: 10,
      contentCompletedAt: null,
      exercisesCompletedAt: null,
      projectApprovedAt: null,
      lastActivityAt: completedAt,
    }

    expect(mergeChapterProgress(current, weakEvidence)).toEqual(current)
  })

  it('is idempotent when the same evidence is applied twice', () => {
    const first = mergeChapterProgress(emptyChapterProgress(completedAt), fullEvidence())
    const second = mergeChapterProgress(first, fullEvidence())

    expect(second).toEqual(first)
  })
})

describe('mergeCanonicalProgressStates', () => {
  it('never overwrites progress completed after a backfill plan was prepared', () => {
    const plannedAt = new Date('2026-01-01T00:00:00.000Z')
    const liveAt = new Date('2026-01-02T00:00:00.000Z')
    const planned = {
      ...emptyChapterProgress(plannedAt),
      contentCompleted: true,
      stars: 1,
      progress: 34,
      lessonsCompleted: 1,
      contentCompletedAt: plannedAt,
    }
    const current = {
      ...emptyChapterProgress(liveAt),
      contentCompleted: true,
      exercisesCompleted: true,
      projectApproved: true,
      stars: 3,
      progress: 100,
      lessonsCompleted: 1,
      exercisesCorrect: 10,
      exercisesTotal: 10,
      contentCompletedAt: liveAt,
      exercisesCompletedAt: liveAt,
      projectApprovedAt: liveAt,
    }

    expect(mergeCanonicalProgressStates(current, planned)).toEqual(current)
  })
})
