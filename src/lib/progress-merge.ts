export interface CanonicalChapterProgressState {
  progress: number
  currentStep: number
  totalSteps: number
  lessonsCompleted: number
  exercisesCorrect: number
  exercisesTotal: number
  timeSpentSeconds: number
  contentCompleted: boolean
  exercisesCompleted: boolean
  projectApproved: boolean
  stars: number
  contentCompletedAt: Date | null
  exercisesCompletedAt: Date | null
  projectApprovedAt: Date | null
  lastAccessedAt: Date
  lastUpdated: Date
}

export interface LegacyProgressEvidence {
  contentCompleted: boolean
  exercisesCompleted: boolean
  projectApproved: boolean
  lessonsCompleted: number
  correctExerciseCount: number
  totalExerciseAttempts: number
  requiredExerciseCount: number
  contentCompletedAt: Date | null
  exercisesCompletedAt: Date | null
  projectApprovedAt: Date | null
  lastActivityAt: Date | null
}

function preferExistingDate(existing: Date | null, fallback: Date | null): Date | null {
  return existing ?? fallback
}

function latestDate(...dates: Array<Date | null>): Date | null {
  const timestamps = dates.filter((date): date is Date => date !== null).map(date => date.getTime())
  if (timestamps.length === 0) return null
  return new Date(Math.max(...timestamps))
}

export function mergeChapterProgress(
  current: CanonicalChapterProgressState,
  evidence: LegacyProgressEvidence
): CanonicalChapterProgressState {
  const existingStars = Math.max(0, Math.min(3, current.stars))
  // Older rows sometimes stored only an ordinal star count. Infer that shape
  // only when no explicit independent-star flags exist. Otherwise an
  // exercise-only migration (stars=1) would incorrectly become content
  // completion on the second backfill run.
  const inferOrdinalLegacyStars =
    !current.contentCompleted && !current.exercisesCompleted && !current.projectApproved
  const contentCompleted =
    current.contentCompleted ||
    evidence.contentCompleted ||
    (inferOrdinalLegacyStars && existingStars >= 1)
  const exercisesCompleted =
    current.exercisesCompleted ||
    evidence.exercisesCompleted ||
    (inferOrdinalLegacyStars && existingStars >= 2) ||
    (evidence.requiredExerciseCount > 0 &&
      evidence.correctExerciseCount >= evidence.requiredExerciseCount)
  const projectApproved =
    current.projectApproved ||
    evidence.projectApproved ||
    (inferOrdinalLegacyStars && existingStars >= 3)
  const derivedStars =
    Number(contentCompleted) + Number(exercisesCompleted) + Number(projectApproved)
  const stars = Math.max(existingStars, derivedStars)
  const lastActivityAt = latestDate(
    current.lastAccessedAt,
    current.lastUpdated,
    evidence.lastActivityAt,
    evidence.contentCompletedAt,
    evidence.exercisesCompletedAt,
    evidence.projectApprovedAt
  )

  return {
    progress: Math.max(current.progress, contentCompleted ? 100 : 0),
    currentStep: Math.max(current.currentStep, contentCompleted ? 1 : 0),
    totalSteps: Math.max(current.totalSteps, 1),
    lessonsCompleted: Math.max(
      current.lessonsCompleted,
      evidence.lessonsCompleted,
      contentCompleted ? 1 : 0
    ),
    exercisesCorrect: Math.max(current.exercisesCorrect, evidence.correctExerciseCount),
    exercisesTotal: Math.max(current.exercisesTotal, evidence.totalExerciseAttempts),
    timeSpentSeconds: current.timeSpentSeconds,
    contentCompleted,
    exercisesCompleted,
    projectApproved,
    stars,
    contentCompletedAt: preferExistingDate(current.contentCompletedAt, evidence.contentCompletedAt),
    exercisesCompletedAt: preferExistingDate(
      current.exercisesCompletedAt,
      evidence.exercisesCompletedAt
    ),
    projectApprovedAt: preferExistingDate(current.projectApprovedAt, evidence.projectApprovedAt),
    lastAccessedAt: lastActivityAt ?? current.lastAccessedAt,
    lastUpdated: lastActivityAt ?? current.lastUpdated,
  }
}

/**
 * Merge a previously planned backfill state with the row read immediately
 * before writing. Every monotonic field keeps the greater/current value, so a
 * live learner cannot lose progress while an offline migration is running.
 */
export function mergeCanonicalProgressStates(
  current: CanonicalChapterProgressState,
  planned: CanonicalChapterProgressState
): CanonicalChapterProgressState {
  const contentCompleted = current.contentCompleted || planned.contentCompleted
  const exercisesCompleted = current.exercisesCompleted || planned.exercisesCompleted
  const projectApproved = current.projectApproved || planned.projectApproved
  const derivedStars =
    Number(contentCompleted) + Number(exercisesCompleted) + Number(projectApproved)

  return {
    progress: Math.max(current.progress, planned.progress),
    currentStep: Math.max(current.currentStep, planned.currentStep),
    totalSteps: Math.max(current.totalSteps, planned.totalSteps),
    lessonsCompleted: Math.max(current.lessonsCompleted, planned.lessonsCompleted),
    exercisesCorrect: Math.max(current.exercisesCorrect, planned.exercisesCorrect),
    exercisesTotal: Math.max(current.exercisesTotal, planned.exercisesTotal),
    timeSpentSeconds: Math.max(current.timeSpentSeconds, planned.timeSpentSeconds),
    contentCompleted,
    exercisesCompleted,
    projectApproved,
    stars: Math.max(current.stars, planned.stars, derivedStars),
    contentCompletedAt: current.contentCompletedAt ?? planned.contentCompletedAt,
    exercisesCompletedAt: current.exercisesCompletedAt ?? planned.exercisesCompletedAt,
    projectApprovedAt: current.projectApprovedAt ?? planned.projectApprovedAt,
    lastAccessedAt:
      latestDate(current.lastAccessedAt, planned.lastAccessedAt) ?? current.lastAccessedAt,
    lastUpdated: latestDate(current.lastUpdated, planned.lastUpdated) ?? current.lastUpdated,
  }
}

export function emptyChapterProgress(now: Date): CanonicalChapterProgressState {
  return {
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    lessonsCompleted: 0,
    exercisesCorrect: 0,
    exercisesTotal: 0,
    timeSpentSeconds: 0,
    contentCompleted: false,
    exercisesCompleted: false,
    projectApproved: false,
    stars: 0,
    contentCompletedAt: null,
    exercisesCompletedAt: null,
    projectApprovedAt: null,
    lastAccessedAt: now,
    lastUpdated: now,
  }
}
