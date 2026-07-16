import { BADGES, type BadgeId } from './gamification'

export const LEGACY_MODULE_TO_MILESTONE = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
} as const

export interface LegacyModuleTestEvidence {
  id: string
  moduleNumber: number
  score: number
  totalQuestions: number
  timeElapsed: number
  moduleStars: number
  completed: boolean
  abandoned: boolean
  createdAt: Date
  completedAt: Date | null
}

export interface LegacyMilestoneProjection {
  sourceAttemptId: string
  moduleNumber: number
  milestone: number
  score: number
  questionsTotal: number
  questionsCorrect: number
  passed: boolean
  startedAt: Date
  completedAt: Date
  legacyAttemptCount: number
}

export interface CanonicalMilestoneProjection {
  score: number
  questionsTotal: number
  questionsCorrect: number
  projectSubmitted: boolean
  projectScore: number | null
  projectFeedback: string | null
  passed: boolean
  gemsEarned: number
  xpEarned: number
  startedAt: Date
  completedAt: Date | null
}

export interface RollbackChapterProjection {
  completedChapter: boolean
  answeredQuestions: boolean
  submittedProject: boolean
  stars: number
}

export interface HistoricalAchievementEvidence {
  completedChapters: number
  currentStreak: number
  correctAnswers: number
  projectCount: number
  answeredChapters: number
  submittedProjects: number
  perfectChapters: number
  canonicalHighScoreTestCount: number
  perfectModuleTestCount: number
  hasHighScoreTest: boolean
  hasPerfectFastTest: boolean
  hasThreeStarTest: boolean
  finalTestPassed: boolean
}

export function mapLegacyModuleToMilestone(moduleNumber: number): number | null {
  return LEGACY_MODULE_TO_MILESTONE[moduleNumber as keyof typeof LEGACY_MODULE_TO_MILESTONE] ?? null
}

function normalizedLegacyResult(attempt: LegacyModuleTestEvidence) {
  const questionsTotal = Math.max(1, attempt.totalQuestions)
  const questionsCorrect = Math.max(0, Math.min(attempt.score, questionsTotal))
  const exactPercentage = questionsCorrect / questionsTotal
  const score = Math.round(exactPercentage * 100)
  const completedAt = attempt.completedAt ?? attempt.createdAt
  const startedAt = new Date(completedAt.getTime() - Math.max(0, attempt.timeElapsed) * 1000)

  return {
    questionsTotal,
    questionsCorrect,
    exactPercentage,
    score,
    completedAt,
    startedAt,
  }
}

function compareLegacyAttempts(
  left: LegacyModuleTestEvidence,
  right: LegacyModuleTestEvidence
): number {
  const leftResult = normalizedLegacyResult(left)
  const rightResult = normalizedLegacyResult(right)
  if (leftResult.exactPercentage !== rightResult.exactPercentage) {
    return rightResult.exactPercentage - leftResult.exactPercentage
  }
  if (leftResult.questionsTotal !== rightResult.questionsTotal) {
    return rightResult.questionsTotal - leftResult.questionsTotal
  }
  const completedAtDifference = rightResult.completedAt.getTime() - leftResult.completedAt.getTime()
  if (completedAtDifference !== 0) return completedAtDifference
  return left.id.localeCompare(right.id)
}

/**
 * Collapse the append-only legacy attempt history into the one-row canonical
 * milestone shape. The original ModuleTestAttempt rows remain untouched as the
 * full audit history.
 */
export function buildLegacyMilestoneProjections(attempts: LegacyModuleTestEvidence[]): {
  milestones: LegacyMilestoneProjection[]
  auditedOnlyAttemptIds: string[]
} {
  const attemptsByModule = new Map<number, LegacyModuleTestEvidence[]>()
  const auditedOnlyAttemptIds: string[] = []

  for (const attempt of attempts) {
    const milestone = mapLegacyModuleToMilestone(attempt.moduleNumber)
    if (!milestone || !attempt.completed || attempt.abandoned || attempt.totalQuestions <= 0) {
      auditedOnlyAttemptIds.push(attempt.id)
      continue
    }
    const moduleAttempts = attemptsByModule.get(attempt.moduleNumber) ?? []
    moduleAttempts.push(attempt)
    attemptsByModule.set(attempt.moduleNumber, moduleAttempts)
  }

  const milestones: LegacyMilestoneProjection[] = []
  for (const [moduleNumber, moduleAttempts] of attemptsByModule) {
    const sorted = [...moduleAttempts].sort(compareLegacyAttempts)
    const best = sorted[0]
    const milestone = mapLegacyModuleToMilestone(moduleNumber)
    if (!best || !milestone) continue
    const normalized = normalizedLegacyResult(best)

    milestones.push({
      sourceAttemptId: best.id,
      moduleNumber,
      milestone,
      score: normalized.score,
      questionsTotal: normalized.questionsTotal,
      questionsCorrect: normalized.questionsCorrect,
      passed: normalized.exactPercentage >= 0.7,
      startedAt: normalized.startedAt,
      completedAt: normalized.completedAt,
      legacyAttemptCount: moduleAttempts.length,
    })
  }

  milestones.sort((left, right) => left.milestone - right.milestone)
  auditedOnlyAttemptIds.sort()
  return { milestones, auditedOnlyAttemptIds }
}

/** Keep a newer canonical result while monotonically admitting stronger legacy evidence. */
export function mergeMilestoneProjection(
  current: CanonicalMilestoneProjection | null,
  legacy: LegacyMilestoneProjection
): CanonicalMilestoneProjection {
  if (!current) {
    return {
      score: legacy.score,
      questionsTotal: legacy.questionsTotal,
      questionsCorrect: legacy.questionsCorrect,
      projectSubmitted: false,
      projectScore: null,
      projectFeedback: null,
      passed: legacy.passed,
      gemsEarned: 0,
      xpEarned: 0,
      startedAt: legacy.startedAt,
      completedAt: legacy.completedAt,
    }
  }

  const useLegacyResult = legacy.score > current.score
  const useLegacyTiming = legacy.passed && (!current.passed || current.completedAt === null)
  return {
    score: Math.max(current.score, legacy.score),
    questionsTotal: useLegacyResult ? legacy.questionsTotal : current.questionsTotal,
    questionsCorrect: useLegacyResult ? legacy.questionsCorrect : current.questionsCorrect,
    projectSubmitted: current.projectSubmitted,
    projectScore: current.projectScore,
    projectFeedback: current.projectFeedback,
    passed: current.passed || legacy.passed,
    gemsEarned: current.gemsEarned,
    xpEarned: current.xpEarned,
    startedAt: useLegacyResult || useLegacyTiming ? legacy.startedAt : current.startedAt,
    completedAt: useLegacyResult || useLegacyTiming ? legacy.completedAt : current.completedAt,
  }
}

export function shouldReserveLessonCompletion(input: {
  contentCompleted: boolean
  lessonsCompleted: number
}): boolean {
  return input.contentCompleted || input.lessonsCompleted > 0
}

/**
 * Reserve exact known exercise identities first, then deterministically fill
 * an identity-less historical count from canonical lesson order.
 */
export function selectHistoricalExerciseClaimIds(input: {
  canonicalExerciseIds: string[]
  knownCorrectExerciseIds: Iterable<string>
  exercisesCorrect: number
  exercisesCompleted: boolean
}): string[] {
  const canonicalIds = new Set(input.canonicalExerciseIds)
  const selected = new Set(
    [...input.knownCorrectExerciseIds].filter(exerciseId => canonicalIds.has(exerciseId))
  )
  const requestedCount = input.exercisesCompleted
    ? input.canonicalExerciseIds.length
    : Math.max(0, input.exercisesCorrect)
  const targetCount = Math.min(
    input.canonicalExerciseIds.length,
    Math.max(selected.size, requestedCount)
  )

  for (const exerciseId of input.canonicalExerciseIds) {
    if (selected.size >= targetCount) break
    selected.add(exerciseId)
  }

  return input.canonicalExerciseIds.filter(exerciseId => selected.has(exerciseId))
}

export function mergeRollbackChapterProjection(
  current: RollbackChapterProjection | null,
  canonical: {
    contentCompleted: boolean
    exercisesCompleted: boolean
    projectApproved: boolean
    stars: number
  }
): RollbackChapterProjection {
  const completedChapter = Boolean(current?.completedChapter || canonical.contentCompleted)
  const answeredQuestions = Boolean(current?.answeredQuestions || canonical.exercisesCompleted)
  const submittedProject = Boolean(current?.submittedProject || canonical.projectApproved)
  return {
    completedChapter,
    answeredQuestions,
    submittedProject,
    stars: Math.max(
      current?.stars ?? 0,
      canonical.stars,
      Number(completedChapter) + Number(answeredQuestions) + Number(submittedProject)
    ),
  }
}

/**
 * Recreate every badge that the canonical checker would immediately discover
 * after cutover, plus the legacy raw-submission semantics represented in these
 * aggregate counts. Callers still union this result with existing rows.
 */
export function historicalAchievementBadgeIds(evidence: HistoricalAchievementEvidence): BadgeId[] {
  const badges = new Set<BadgeId>()
  const add = (badge: BadgeId, condition: boolean) => {
    if (condition) badges.add(badge)
  }

  add('FIRST_CHAPTER', evidence.completedChapters >= 1)
  add('FIVE_CHAPTERS', evidence.completedChapters >= 5)
  add('TEN_CHAPTERS', evidence.completedChapters >= 10)
  add('ALL_CHAPTERS', evidence.completedChapters >= 40)
  add('WEEK_STREAK', evidence.currentStreak >= 7)
  add('MONTH_STREAK', evidence.currentStreak >= 30)
  add('QUESTION_MASTER', evidence.correctAnswers >= 50)
  add('PROJECT_STARTER', evidence.projectCount >= 1)
  add('PROJECT_ENTHUSIAST', evidence.projectCount >= 10)
  add('FIRST_STAR_TWO', evidence.answeredChapters >= 1)
  add('FIRST_STAR_THREE', evidence.submittedProjects >= 1)
  add('FIVE_PERFECT_CHAPTERS', evidence.perfectChapters >= 5)
  add('ALL_THREE_STARS', evidence.perfectChapters >= 40)
  add('GRADUATE', evidence.finalTestPassed)

  add('TEST_ACE', evidence.hasHighScoreTest)
  add('SPEED_DEMON', evidence.hasPerfectFastTest)
  add('MODULE_MASTER', evidence.hasThreeStarTest || evidence.hasHighScoreTest)
  add(
    'ALL_MODULES_PERFECT',
    Math.max(evidence.canonicalHighScoreTestCount, evidence.perfectModuleTestCount) >= 4
  )

  return (Object.keys(BADGES) as BadgeId[]).filter(badge => badges.has(badge))
}
