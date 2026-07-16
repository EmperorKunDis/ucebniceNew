import { describe, expect, it } from 'vitest'
import {
  buildLegacyMilestoneProjections,
  historicalAchievementBadgeIds,
  mapLegacyModuleToMilestone,
  mergeMilestoneProjection,
  mergeRollbackChapterProjection,
  selectHistoricalExerciseClaimIds,
  shouldReserveLessonCompletion,
  type LegacyModuleTestEvidence,
} from '../progress-backfill'
import { emptyChapterProgress, mergeChapterProgress } from '../progress-merge'

const completedAt = new Date('2026-01-10T12:00:00.000Z')

function attempt(overrides: Partial<LegacyModuleTestEvidence> = {}): LegacyModuleTestEvidence {
  return {
    id: 'legacy-attempt-1',
    moduleNumber: 1,
    score: 8,
    totalQuestions: 10,
    timeElapsed: 240,
    moduleStars: 2,
    completed: true,
    abandoned: false,
    createdAt: completedAt,
    completedAt,
    ...overrides,
  }
}

describe('legacy module test projection', () => {
  it('maps the four historical module boundaries to milestones 10-40', () => {
    expect([1, 2, 3, 4].map(mapLegacyModuleToMilestone)).toEqual([10, 20, 30, 40])
    expect(mapLegacyModuleToMilestone(5)).toBeNull()
  })

  it('selects the deterministic best completed attempt and keeps unsupported rows for audit', () => {
    const result = buildLegacyMilestoneProjections([
      attempt(),
      attempt({ id: 'legacy-attempt-best', score: 9, completedAt: null }),
      attempt({ id: 'abandoned', score: 10, abandoned: true }),
      attempt({ id: 'unsupported', moduleNumber: 8 }),
    ])

    expect(result.milestones).toEqual([
      expect.objectContaining({
        sourceAttemptId: 'legacy-attempt-best',
        moduleNumber: 1,
        milestone: 10,
        score: 90,
        questionsCorrect: 9,
        questionsTotal: 10,
        passed: true,
        legacyAttemptCount: 2,
      }),
    ])
    expect(result.auditedOnlyAttemptIds).toEqual(['abandoned', 'unsupported'])
  })

  it('monotonically preserves a stronger canonical result and all existing rewards', () => {
    const legacy = buildLegacyMilestoneProjections([attempt()]).milestones[0]
    expect(legacy).toBeDefined()
    const canonicalCompletedAt = new Date('2026-02-01T12:00:00.000Z')
    const merged = mergeMilestoneProjection(
      {
        score: 95,
        questionsTotal: 20,
        questionsCorrect: 19,
        projectSubmitted: true,
        projectScore: 91,
        projectFeedback: 'canonical',
        passed: true,
        gemsEarned: 25,
        xpEarned: 500,
        startedAt: new Date('2026-02-01T11:55:00.000Z'),
        completedAt: canonicalCompletedAt,
      },
      legacy!
    )

    expect(merged).toMatchObject({
      score: 95,
      questionsTotal: 20,
      questionsCorrect: 19,
      projectSubmitted: true,
      projectScore: 91,
      passed: true,
      gemsEarned: 25,
      xpEarned: 500,
      completedAt: canonicalCompletedAt,
    })
  })

  it('preserves the best score but uses legacy completion timing when it adds the pass', () => {
    const legacy = buildLegacyMilestoneProjections([attempt()]).milestones[0]
    expect(legacy).toBeDefined()
    const merged = mergeMilestoneProjection(
      {
        score: 85,
        questionsTotal: 20,
        questionsCorrect: 17,
        projectSubmitted: false,
        projectScore: null,
        projectFeedback: null,
        passed: false,
        gemsEarned: 0,
        xpEarned: 0,
        startedAt: new Date('2026-02-01T11:55:00.000Z'),
        completedAt: null,
      },
      legacy!
    )

    expect(merged.score).toBe(85)
    expect(merged.passed).toBe(true)
    expect(merged.completedAt).toEqual(legacy!.completedAt)
  })
})

describe('Release A history and rollback guards', () => {
  it('reserves a lesson claim for lessonsCompleted without inventing the first star', () => {
    const historical = { contentCompleted: false, lessonsCompleted: 1 }

    expect(shouldReserveLessonCompletion(historical)).toBe(true)
    expect(historical.contentCompleted).toBe(false)
  })

  it('fills identity-less v2 exercise counts in stable canonical order', () => {
    const canonicalExerciseIds = Array.from({ length: 10 }, (_, index) => `exercise-${index + 1}`)

    expect(
      selectHistoricalExerciseClaimIds({
        canonicalExerciseIds,
        knownCorrectExerciseIds: ['exercise-4'],
        exercisesCorrect: 3,
        exercisesCompleted: false,
      })
    ).toEqual(['exercise-1', 'exercise-2', 'exercise-4'])

    expect(
      selectHistoricalExerciseClaimIds({
        canonicalExerciseIds,
        knownCorrectExerciseIds: [],
        exercisesCorrect: 99,
        exercisesCompleted: true,
      })
    ).toEqual(canonicalExerciseIds)
  })

  it('turns a historical 10/10 aggregate into the second-star flag without inventing content', () => {
    const historicalAt = new Date('2026-01-02T00:00:00.000Z')
    const merged = mergeChapterProgress(
      {
        ...emptyChapterProgress(historicalAt),
        exercisesCorrect: 10,
        exercisesTotal: 10,
      },
      {
        contentCompleted: false,
        exercisesCompleted: false,
        projectApproved: false,
        lessonsCompleted: 0,
        correctExerciseCount: 10,
        totalExerciseAttempts: 10,
        requiredExerciseCount: 10,
        contentCompletedAt: null,
        exercisesCompletedAt: historicalAt,
        projectApprovedAt: null,
        lastActivityAt: historicalAt,
      }
    )

    expect(merged.contentCompleted).toBe(false)
    expect(merged.exercisesCompleted).toBe(true)
    expect(merged.exercisesCorrect).toBe(10)

    const replay = mergeChapterProgress(merged, {
      contentCompleted: false,
      exercisesCompleted: false,
      projectApproved: false,
      lessonsCompleted: 0,
      correctExerciseCount: 10,
      totalExerciseAttempts: 10,
      requiredExerciseCount: 10,
      contentCompletedAt: null,
      exercisesCompletedAt: historicalAt,
      projectApprovedAt: null,
      lastActivityAt: historicalAt,
    })
    expect(replay).toEqual(merged)
    expect(replay.contentCompleted).toBe(false)
  })

  it('OR/max merges rollback projections without lowering legacy truth', () => {
    expect(
      mergeRollbackChapterProjection(
        {
          completedChapter: true,
          answeredQuestions: false,
          submittedProject: true,
          stars: 3,
        },
        {
          contentCompleted: false,
          exercisesCompleted: true,
          projectApproved: false,
          stars: 1,
        }
      )
    ).toEqual({
      completedChapter: true,
      answeredQuestions: true,
      submittedProject: true,
      stars: 3,
    })
  })

  it('materializes pre-cutover achievement eligibility before runtime rewards can replay', () => {
    const badges = historicalAchievementBadgeIds({
      completedChapters: 10,
      currentStreak: 7,
      correctAnswers: 50,
      projectCount: 10,
      answeredChapters: 1,
      submittedProjects: 1,
      perfectChapters: 5,
      canonicalHighScoreTestCount: 1,
      perfectModuleTestCount: 4,
      hasHighScoreTest: true,
      hasPerfectFastTest: true,
      hasThreeStarTest: true,
      finalTestPassed: false,
    })

    expect(badges).toEqual(
      expect.arrayContaining([
        'FIRST_CHAPTER',
        'FIVE_CHAPTERS',
        'TEN_CHAPTERS',
        'WEEK_STREAK',
        'QUESTION_MASTER',
        'PROJECT_ENTHUSIAST',
        'FIVE_PERFECT_CHAPTERS',
        'TEST_ACE',
        'SPEED_DEMON',
        'MODULE_MASTER',
        'ALL_MODULES_PERFECT',
      ])
    )
    expect(badges).not.toContain('GRADUATE')
  })

  it('does not treat repeated high scores in one module as four canonical modules', () => {
    const badges = historicalAchievementBadgeIds({
      completedChapters: 0,
      currentStreak: 0,
      correctAnswers: 0,
      projectCount: 0,
      answeredChapters: 0,
      submittedProjects: 0,
      perfectChapters: 0,
      canonicalHighScoreTestCount: 1,
      perfectModuleTestCount: 1,
      hasHighScoreTest: true,
      hasPerfectFastTest: false,
      hasThreeStarTest: true,
      finalTestPassed: false,
    })

    expect(badges).toContain('TEST_ACE')
    expect(badges).not.toContain('ALL_MODULES_PERFECT')
  })
})
