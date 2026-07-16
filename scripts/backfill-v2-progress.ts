import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Prisma, PrismaClient } from '@prisma/client'
import {
  EXPECTED_CHAPTER_COUNT,
  EXPECTED_EXERCISE_COUNT,
  EXPECTED_EXERCISES_PER_CHAPTER,
} from '../src/lib/course-content'
import { BADGES, type BadgeId } from '../src/lib/gamification'
import {
  buildLegacyMilestoneProjections,
  historicalAchievementBadgeIds,
  mapLegacyModuleToMilestone,
  mergeMilestoneProjection,
  mergeRollbackChapterProjection,
  selectHistoricalExerciseClaimIds,
  shouldReserveLessonCompletion,
  type LegacyMilestoneProjection,
} from '../src/lib/progress-backfill'
import {
  emptyChapterProgress,
  mergeCanonicalProgressStates,
  mergeChapterProgress,
  type CanonicalChapterProgressState,
  type LegacyProgressEvidence,
} from '../src/lib/progress-merge'

const USER_BATCH_SIZE = 100

type BackfillMode = 'dry-run' | 'apply'

interface ContentIndexEntry {
  id: string
  chapterId: string
  lessonId: string | null
  exerciseIdsByQuestionId: Map<string, string>
  canonicalExerciseIds: string[]
  requiredExerciseCount: number
}

interface AttemptPlan {
  id: string
  userId: string
  exerciseId: string
  answer: string
  correct: boolean
  legacyXpEarned: number
  attemptedAt: Date
}

interface ExerciseProgressPlan {
  exerciseId: string
  completed: boolean
  attemptCount: number
  correctCount: number
  firstCorrectAt: Date | null
  lastAttemptAt: Date
}

interface ChapterProgressPlan {
  chapterId: string
  publicChapterId: string
  state: CanonicalChapterProgressState
  lessonId: string | null
}

interface AchievementPlan {
  badgeKey: BadgeId | null
  badgeId: string
  achievementId: string | null
  unlockedAt: Date
}

interface UserBackfillPlan {
  userId: string
  promoteToAdmin: boolean
  chapters: ChapterProgressPlan[]
  attempts: AttemptPlan[]
  exerciseProgress: ExerciseProgressPlan[]
  historicalExerciseClaimIds: string[]
  milestoneTests: LegacyMilestoneProjection[]
  passedMilestoneClaims: number[]
  finalTestPassClaim: boolean
  auditedOnlyModuleTestAttempts: number
  achievements: AchievementPlan[]
  skippedAnswers: number
}

interface BackfillSummary {
  users: number
  adminPromotions: number
  chapterProgressRows: number
  lessonProgressRows: number
  exerciseProgressRows: number
  exerciseAttempts: number
  milestoneTestRows: number
  auditedOnlyModuleTestAttempts: number
  achievementRows: number
  rollbackChapterCompletionRows: number
  rollbackCompletedChapterRows: number
  rewardLedgerClaims: number
  skippedAnswers: number
}

function parseMode(argv: string[]): BackfillMode {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Použij pouze jeden režim: --dry-run nebo --apply')
  return apply ? 'apply' : 'dry-run'
}

function latestDate(...dates: Array<Date | null | undefined>): Date | null {
  const timestamps = dates
    .filter((date): date is Date => date instanceof Date)
    .map(date => date.getTime())
  if (timestamps.length === 0) return null
  return new Date(Math.max(...timestamps))
}

function earliestDate(...dates: Array<Date | null | undefined>): Date | null {
  const timestamps = dates
    .filter((date): date is Date => date instanceof Date)
    .map(date => date.getTime())
  if (timestamps.length === 0) return null
  return new Date(Math.min(...timestamps))
}

async function buildContentIndex(prisma: PrismaClient): Promise<Map<string, ContentIndexEntry>> {
  const canonicalChapterIds = Array.from({ length: EXPECTED_CHAPTER_COUNT }, (_, index) =>
    String(index + 1).padStart(2, '0')
  )
  const chapters = await prisma.chapter.findMany({
    where: { chapterId: { in: canonicalChapterIds } },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      chapterId: true,
      questions: {
        select: { id: true, questionNumber: true },
      },
      microLessons: {
        where: { sourceKey: { not: null } },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          sourceKey: true,
          exercises: {
            where: { sourceKey: { not: null } },
            orderBy: { order: 'asc' },
            select: { id: true, sourceKey: true },
          },
        },
      },
    },
  })
  const index = new Map<string, ContentIndexEntry>()

  for (const chapter of chapters) {
    const canonicalLesson = chapter.microLessons.find(
      lesson => lesson.sourceKey === `lesson:${chapter.chapterId}`
    )
    const exerciseIdBySourceKey = new Map(
      canonicalLesson?.exercises.map(exercise => [exercise.sourceKey, exercise.id]) ?? []
    )
    const canonicalExerciseIds = Array.from(
      { length: EXPECTED_EXERCISES_PER_CHAPTER },
      (_, index) =>
        exerciseIdBySourceKey.get(
          `exercise:${chapter.chapterId}:${String(index + 1).padStart(2, '0')}`
        ) ?? null
    ).filter((exerciseId): exerciseId is string => exerciseId !== null)
    const exerciseIdsByQuestionId = new Map<string, string>()

    for (const question of chapter.questions) {
      const sourceKey = `exercise:${chapter.chapterId}:${String(question.questionNumber).padStart(2, '0')}`
      const exerciseId = exerciseIdBySourceKey.get(sourceKey)
      if (exerciseId) exerciseIdsByQuestionId.set(question.id, exerciseId)
    }

    index.set(chapter.chapterId, {
      id: chapter.id,
      chapterId: chapter.chapterId,
      lessonId: canonicalLesson?.id ?? null,
      exerciseIdsByQuestionId,
      canonicalExerciseIds,
      requiredExerciseCount: canonicalExerciseIds.length,
    })
  }

  const canonicalChapters = [...index.values()].filter(chapter => chapter.lessonId !== null)
  const canonicalExercises = canonicalChapters.reduce(
    (total, chapter) => total + chapter.requiredExerciseCount,
    0
  )
  if (
    canonicalChapters.length !== EXPECTED_CHAPTER_COUNT ||
    canonicalExercises !== EXPECTED_EXERCISE_COUNT
  ) {
    throw new Error(
      `Nejdřív spusť canonical content import: očekáváno ${EXPECTED_CHAPTER_COUNT} lessons/${EXPECTED_EXERCISE_COUNT} exercises, nalezeno ${canonicalChapters.length}/${canonicalExercises}.`
    )
  }

  return index
}

async function buildUserPlan(
  prisma: PrismaClient,
  user: {
    id: string
    isAdmin: boolean
    role: string
    currentStreak: number
    lastActiveDate: Date | null
    createdAt: Date
  },
  contentIndex: Map<string, ContentIndexEntry>
): Promise<UserBackfillPlan> {
  const [
    completedChapters,
    chapterCompletions,
    currentProgress,
    questionAnswers,
    projectSubmissions,
    currentExerciseProgress,
    moduleTestAttempts,
    currentMilestoneTests,
    finalTest,
    userAchievements,
  ] = await Promise.all([
    prisma.completedChapter.findMany({
      where: { userId: user.id },
      select: {
        completedAt: true,
        chapter: { select: { chapterId: true } },
      },
    }),
    prisma.chapterCompletion.findMany({
      where: { userId: user.id },
      select: {
        chapterId: true,
        completedChapter: true,
        answeredQuestions: true,
        submittedProject: true,
        completedAt: true,
        updatedAt: true,
      },
    }),
    prisma.chapterProgress.findMany({ where: { userId: user.id } }),
    prisma.questionAnswer.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        chapterId: true,
        questionId: true,
        answer: true,
        correct: true,
        xpEarned: true,
        answeredAt: true,
      },
    }),
    prisma.projectSubmission.findMany({
      where: { userId: user.id },
      select: {
        chapterId: true,
        aiApproved: true,
        aiReviewedAt: true,
        submittedAt: true,
      },
    }),
    prisma.exerciseProgress.findMany({ where: { userId: user.id } }),
    prisma.moduleTestAttempt.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        moduleNumber: true,
        score: true,
        totalQuestions: true,
        timeElapsed: true,
        moduleStars: true,
        completed: true,
        abandoned: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    prisma.milestoneTest.findMany({
      where: { userId: user.id, milestone: { in: [10, 20, 30, 40] } },
    }),
    prisma.finalTest.findUnique({ where: { userId: user.id } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
        achievement: { select: { badgeId: true } },
      },
    }),
  ])

  const completedChapterDates = new Map<string, Date>()
  for (const completion of completedChapters) {
    const existing = completedChapterDates.get(completion.chapter.chapterId)
    completedChapterDates.set(
      completion.chapter.chapterId,
      earliestDate(existing, completion.completedAt) ?? completion.completedAt
    )
  }

  const completionByChapter = new Map(
    chapterCompletions.map(completion => [completion.chapterId, completion])
  )
  const currentByChapterId = new Map(
    currentProgress.map(progress => [progress.chapterId, progress])
  )
  const approvedProjectByChapter = new Map(
    projectSubmissions
      .filter(submission => submission.aiApproved)
      .map(submission => [submission.chapterId, submission])
  )
  const currentExerciseById = new Map(
    currentExerciseProgress.map(progress => [progress.exerciseId, progress])
  )
  const attempts: AttemptPlan[] = []
  const attemptsByChapter = new Map<string, AttemptPlan[]>()
  let skippedAnswers = 0

  for (const answer of questionAnswers) {
    const chapter = contentIndex.get(answer.chapterId)
    const exerciseId = chapter?.exerciseIdsByQuestionId.get(answer.questionId)
    if (!chapter || !exerciseId) {
      skippedAnswers++
      continue
    }

    const attempt: AttemptPlan = {
      id: answer.id,
      userId: user.id,
      exerciseId,
      answer: answer.answer,
      correct: answer.correct,
      legacyXpEarned: answer.xpEarned,
      attemptedAt: answer.answeredAt,
    }
    attempts.push(attempt)
    const chapterAttempts = attemptsByChapter.get(answer.chapterId) ?? []
    chapterAttempts.push(attempt)
    attemptsByChapter.set(answer.chapterId, chapterAttempts)
  }

  const exerciseProgress = attempts.map(attempt => {
    const current = currentExerciseById.get(attempt.exerciseId)
    return {
      exerciseId: attempt.exerciseId,
      completed: current?.completed || attempt.correct,
      attemptCount: Math.max(current?.attemptCount ?? 0, 1),
      correctCount: Math.max(current?.correctCount ?? 0, attempt.correct ? 1 : 0),
      firstCorrectAt: current?.firstCorrectAt ?? (attempt.correct ? attempt.attemptedAt : null),
      lastAttemptAt: latestDate(current?.lastAttemptAt, attempt.attemptedAt) ?? attempt.attemptedAt,
    }
  })

  const relevantChapterIds = new Set<string>([
    ...completedChapterDates.keys(),
    ...completionByChapter.keys(),
    ...attemptsByChapter.keys(),
    ...approvedProjectByChapter.keys(),
  ])
  for (const progress of currentProgress) {
    const chapter = [...contentIndex.values()].find(item => item.id === progress.chapterId)
    if (chapter) relevantChapterIds.add(chapter.chapterId)
  }
  for (const chapter of contentIndex.values()) {
    if (chapter.canonicalExerciseIds.some(exerciseId => currentExerciseById.has(exerciseId))) {
      relevantChapterIds.add(chapter.chapterId)
    }
  }

  const chapters: ChapterProgressPlan[] = []
  const now = new Date()

  for (const publicChapterId of relevantChapterIds) {
    const chapter = contentIndex.get(publicChapterId)
    if (!chapter) continue

    const legacyCompletion = completionByChapter.get(publicChapterId)
    const existing = currentByChapterId.get(chapter.id)
    const chapterAttempts = attemptsByChapter.get(publicChapterId) ?? []
    const correctAttempts = chapterAttempts.filter(attempt => attempt.correct)
    const completedCanonicalExerciseIds = chapter.canonicalExerciseIds.filter(
      exerciseId => currentExerciseById.get(exerciseId)?.completed
    )
    const attemptedCanonicalExerciseIds = chapter.canonicalExerciseIds.filter(
      exerciseId => (currentExerciseById.get(exerciseId)?.attemptCount ?? 0) > 0
    )
    const project = approvedProjectByChapter.get(publicChapterId)
    const legacyContentCompletedAt = earliestDate(
      completedChapterDates.get(publicChapterId),
      legacyCompletion?.completedChapter ? legacyCompletion.completedAt : null
    )
    const knownCorrectExerciseCount = new Set([
      ...correctAttempts.map(attempt => attempt.exerciseId),
      ...completedCanonicalExerciseIds,
    ]).size
    const historicalCorrectExerciseCount = Math.max(
      knownCorrectExerciseCount,
      existing?.exercisesCorrect ?? 0
    )
    const exercisesCompletedAt = legacyCompletion?.answeredQuestions
      ? legacyCompletion.updatedAt
      : historicalCorrectExerciseCount >= chapter.requiredExerciseCount &&
          chapter.requiredExerciseCount > 0
        ? latestDate(
            ...correctAttempts.map(attempt => attempt.attemptedAt),
            ...completedCanonicalExerciseIds.map(
              exerciseId => currentExerciseById.get(exerciseId)?.firstCorrectAt
            ),
            existing?.exercisesCompletedAt,
            existing?.lastUpdated
          )
        : null
    const projectApprovedAt = project
      ? (project.aiReviewedAt ?? project.submittedAt)
      : legacyCompletion?.submittedProject
        ? legacyCompletion.updatedAt
        : null
    const evidence: LegacyProgressEvidence = {
      contentCompleted:
        completedChapterDates.has(publicChapterId) ||
        Boolean(legacyCompletion?.completedChapter) ||
        Boolean(existing && existing.progress >= 100),
      exercisesCompleted: Boolean(legacyCompletion?.answeredQuestions),
      projectApproved: Boolean(legacyCompletion?.submittedProject || project),
      lessonsCompleted: existing?.lessonsCompleted ?? 0,
      correctExerciseCount: historicalCorrectExerciseCount,
      totalExerciseAttempts: new Set([
        ...chapterAttempts.map(attempt => attempt.exerciseId),
        ...attemptedCanonicalExerciseIds,
      ]).size,
      requiredExerciseCount: chapter.requiredExerciseCount,
      contentCompletedAt: legacyContentCompletedAt,
      exercisesCompletedAt,
      projectApprovedAt,
      lastActivityAt: latestDate(
        legacyContentCompletedAt,
        exercisesCompletedAt,
        projectApprovedAt,
        ...chapterAttempts.map(attempt => attempt.attemptedAt)
      ),
    }
    const current: CanonicalChapterProgressState = existing
      ? {
          progress: existing.progress,
          currentStep: existing.currentStep,
          totalSteps: existing.totalSteps,
          lessonsCompleted: existing.lessonsCompleted,
          exercisesCorrect: existing.exercisesCorrect,
          exercisesTotal: existing.exercisesTotal,
          timeSpentSeconds: existing.timeSpentSeconds,
          contentCompleted: existing.contentCompleted,
          exercisesCompleted: existing.exercisesCompleted,
          projectApproved: existing.projectApproved,
          stars: existing.stars,
          contentCompletedAt: existing.contentCompletedAt,
          exercisesCompletedAt: existing.exercisesCompletedAt,
          projectApprovedAt: existing.projectApprovedAt,
          lastAccessedAt: existing.lastAccessedAt,
          lastUpdated: existing.lastUpdated,
        }
      : emptyChapterProgress(evidence.lastActivityAt ?? now)

    chapters.push({
      chapterId: chapter.id,
      publicChapterId,
      state: mergeChapterProgress(current, evidence),
      lessonId: chapter.lessonId,
    })
  }

  const completedExerciseIds = new Set(
    currentExerciseProgress
      .filter(progress => progress.completed)
      .map(progress => progress.exerciseId)
  )
  const historicalExerciseClaimIds = new Set<string>()
  const historicalExerciseCompletedAt = new Map<string, Date>()
  for (const chapter of chapters) {
    const content = contentIndex.get(chapter.publicChapterId)
    if (!content) continue
    const knownCorrectExerciseIds = new Set(
      (attemptsByChapter.get(chapter.publicChapterId) ?? [])
        .filter(attempt => attempt.correct)
        .map(attempt => attempt.exerciseId)
    )
    for (const exerciseId of content.canonicalExerciseIds) {
      if (completedExerciseIds.has(exerciseId)) knownCorrectExerciseIds.add(exerciseId)
    }
    for (const exerciseId of selectHistoricalExerciseClaimIds({
      canonicalExerciseIds: content.canonicalExerciseIds,
      knownCorrectExerciseIds,
      exercisesCorrect: chapter.state.exercisesCorrect,
      exercisesCompleted: chapter.state.exercisesCompleted,
    })) {
      historicalExerciseClaimIds.add(exerciseId)
      historicalExerciseCompletedAt.set(
        exerciseId,
        chapter.state.exercisesCompletedAt ?? chapter.state.lastUpdated
      )
    }
  }
  const plannedExerciseIds = new Set(exerciseProgress.map(progress => progress.exerciseId))
  for (const exerciseId of historicalExerciseClaimIds) {
    if (plannedExerciseIds.has(exerciseId)) continue
    const current = currentExerciseById.get(exerciseId)
    const inferredAt =
      historicalExerciseCompletedAt.get(exerciseId) ?? user.lastActiveDate ?? user.createdAt
    exerciseProgress.push({
      exerciseId,
      completed: true,
      attemptCount: Math.max(current?.attemptCount ?? 0, 1),
      correctCount: Math.max(current?.correctCount ?? 0, 1),
      firstCorrectAt: current?.firstCorrectAt ?? inferredAt,
      lastAttemptAt: current?.lastAttemptAt ?? inferredAt,
    })
    plannedExerciseIds.add(exerciseId)
  }

  const legacyMilestones = buildLegacyMilestoneProjections(moduleTestAttempts)
  const currentMilestoneByOrder = new Map(currentMilestoneTests.map(test => [test.milestone, test]))
  const projectedMilestones = legacyMilestones.milestones.map(legacy => {
    const current = currentMilestoneByOrder.get(legacy.milestone)
    return {
      legacy,
      merged: mergeMilestoneProjection(current ?? null, legacy),
    }
  })
  const mergedMilestoneByOrder = new Map(currentMilestoneTests.map(test => [test.milestone, test]))
  for (const projection of projectedMilestones) {
    mergedMilestoneByOrder.set(projection.legacy.milestone, {
      id: currentMilestoneByOrder.get(projection.legacy.milestone)?.id ?? '',
      userId: user.id,
      milestone: projection.legacy.milestone,
      ...projection.merged,
    })
  }

  const contentCompletedDates = chapters
    .filter(chapter => chapter.state.contentCompleted)
    .map(chapter => chapter.state.contentCompletedAt ?? chapter.state.lastUpdated)
    .sort((left, right) => left.getTime() - right.getTime())
  const exercisesCompletedDates = chapters
    .filter(chapter => chapter.state.exercisesCompleted)
    .map(chapter => chapter.state.exercisesCompletedAt ?? chapter.state.lastUpdated)
    .sort((left, right) => left.getTime() - right.getTime())
  const projectApprovedDates = chapters
    .filter(chapter => chapter.state.projectApproved)
    .map(chapter => chapter.state.projectApprovedAt ?? chapter.state.lastUpdated)
    .sort((left, right) => left.getTime() - right.getTime())
  const perfectChapterDates = chapters
    .filter(
      chapter =>
        chapter.state.contentCompleted &&
        chapter.state.exercisesCompleted &&
        chapter.state.projectApproved
    )
    .map(
      chapter =>
        latestDate(
          chapter.state.contentCompletedAt,
          chapter.state.exercisesCompletedAt,
          chapter.state.projectApprovedAt,
          chapter.state.lastUpdated
        ) ?? chapter.state.lastUpdated
    )
    .sort((left, right) => left.getTime() - right.getTime())
  const canonicalExerciseIds = new Set(
    [...contentIndex.values()].flatMap(chapter => [...chapter.exerciseIdsByQuestionId.values()])
  )
  const canonicalCorrectExercises = new Set(
    currentExerciseProgress
      .filter(progress => progress.completed && canonicalExerciseIds.has(progress.exerciseId))
      .map(progress => progress.exerciseId)
  )
  for (const attempt of attempts) {
    if (attempt.correct) canonicalCorrectExercises.add(attempt.exerciseId)
  }

  const mergedCanonicalTests = [...mergedMilestoneByOrder.values()]
  if (finalTest) {
    mergedCanonicalTests.push({
      id: finalTest.id,
      userId: finalTest.userId,
      milestone: 50,
      score: finalTest.questionsScore,
      questionsTotal: 100,
      questionsCorrect: finalTest.questionsScore,
      projectSubmitted: finalTest.projectSubmitted,
      projectScore: finalTest.projectScore,
      projectFeedback: finalTest.projectFeedback,
      passed: finalTest.passed,
      gemsEarned: finalTest.gemsEarned,
      xpEarned: finalTest.xpEarned,
      startedAt: finalTest.startedAt,
      completedAt: finalTest.completedAt,
    })
  }
  const canonicalHighScoreCount = mergedCanonicalTests.filter(
    test => test.passed && test.score >= 90
  ).length
  const legacyCompletedTests = moduleTestAttempts.filter(
    attempt =>
      attempt.completed &&
      !attempt.abandoned &&
      attempt.totalQuestions > 0 &&
      mapLegacyModuleToMilestone(attempt.moduleNumber) !== null
  )
  const legacyHighScoreCount = legacyCompletedTests.filter(
    attempt => (attempt.score / attempt.totalQuestions) * 100 >= 90
  ).length
  const eligibleBadgeKeys = historicalAchievementBadgeIds({
    completedChapters: contentCompletedDates.length,
    currentStreak: user.currentStreak,
    correctAnswers: Math.max(
      canonicalCorrectExercises.size,
      questionAnswers.filter(answer => answer.correct).length
    ),
    projectCount: Math.max(projectApprovedDates.length, projectSubmissions.length),
    answeredChapters: Math.max(
      exercisesCompletedDates.length,
      chapterCompletions.filter(completion => completion.answeredQuestions).length
    ),
    submittedProjects: Math.max(
      projectApprovedDates.length,
      chapterCompletions.filter(completion => completion.submittedProject).length
    ),
    perfectChapters: Math.max(
      perfectChapterDates.length,
      chapterCompletions.filter(
        completion =>
          completion.completedChapter && completion.answeredQuestions && completion.submittedProject
      ).length
    ),
    canonicalHighScoreTestCount: canonicalHighScoreCount,
    perfectModuleTestCount: new Set(
      legacyCompletedTests.filter(test => test.moduleStars === 3).map(test => test.moduleNumber)
    ).size,
    hasHighScoreTest: canonicalHighScoreCount > 0 || legacyHighScoreCount > 0,
    hasPerfectFastTest:
      mergedCanonicalTests.some(
        test =>
          test.passed &&
          test.score === 100 &&
          test.completedAt !== null &&
          test.completedAt.getTime() - test.startedAt.getTime() < 5 * 60 * 1000
      ) ||
      legacyCompletedTests.some(
        test => test.score === test.totalQuestions && test.timeElapsed < 5 * 60
      ),
    hasThreeStarTest:
      mergedCanonicalTests.some(test => test.passed && test.score >= 90) ||
      legacyCompletedTests.some(test => test.moduleStars === 3),
    finalTestPassed: finalTest?.passed === true,
  })

  const existingAchievementByBadgeId = new Map(
    userAchievements.map(item => [item.achievement.badgeId, item])
  )
  const achievementDates = new Map<BadgeId, Date>()
  const setAchievementDate = (badge: BadgeId, date: Date | null | undefined) => {
    achievementDates.set(badge, date ?? user.lastActiveDate ?? user.createdAt)
  }
  setAchievementDate('FIRST_CHAPTER', contentCompletedDates[0])
  setAchievementDate('FIVE_CHAPTERS', contentCompletedDates[4])
  setAchievementDate('TEN_CHAPTERS', contentCompletedDates[9])
  setAchievementDate('ALL_CHAPTERS', contentCompletedDates[39])
  setAchievementDate('WEEK_STREAK', user.lastActiveDate)
  setAchievementDate('MONTH_STREAK', user.lastActiveDate)
  const fiftiethCorrect = attempts
    .filter(attempt => attempt.correct)
    .sort((left, right) => left.attemptedAt.getTime() - right.attemptedAt.getTime())[49]
  setAchievementDate('QUESTION_MASTER', fiftiethCorrect?.attemptedAt)
  setAchievementDate('PROJECT_STARTER', projectApprovedDates[0])
  setAchievementDate('PROJECT_ENTHUSIAST', projectApprovedDates[9])
  setAchievementDate('FIRST_STAR_TWO', exercisesCompletedDates[0])
  setAchievementDate('FIRST_STAR_THREE', projectApprovedDates[0])
  setAchievementDate('FIVE_PERFECT_CHAPTERS', perfectChapterDates[4])
  setAchievementDate('ALL_THREE_STARS', perfectChapterDates[39])
  setAchievementDate('GRADUATE', finalTest?.completedAt)
  const latestTestDate = latestDate(
    ...legacyCompletedTests.map(test => test.completedAt ?? test.createdAt),
    ...mergedCanonicalTests.map(test => test.completedAt)
  )
  setAchievementDate('TEST_ACE', latestTestDate)
  setAchievementDate('SPEED_DEMON', latestTestDate)
  setAchievementDate('MODULE_MASTER', latestTestDate)
  setAchievementDate('ALL_MODULES_PERFECT', latestTestDate)

  const allBadgeIds = new Set([
    ...userAchievements.map(item => item.achievement.badgeId),
    ...eligibleBadgeKeys.map(key => BADGES[key].id),
  ])
  const eligibleKeyByBadgeId = new Map<string, BadgeId>(
    eligibleBadgeKeys.map(key => [BADGES[key].id, key])
  )
  const achievements: AchievementPlan[] = [...allBadgeIds].map(badgeId => {
    const existing = existingAchievementByBadgeId.get(badgeId)
    const badgeKey = eligibleKeyByBadgeId.get(badgeId) ?? null
    return {
      badgeKey,
      badgeId,
      achievementId: existing?.achievementId ?? null,
      unlockedAt:
        existing?.unlockedAt ??
        (badgeKey ? achievementDates.get(badgeKey) : null) ??
        user.lastActiveDate ??
        user.createdAt,
    }
  })

  return {
    userId: user.id,
    promoteToAdmin: user.isAdmin && user.role !== 'ADMIN',
    chapters,
    attempts,
    exerciseProgress,
    historicalExerciseClaimIds: [...historicalExerciseClaimIds],
    milestoneTests: legacyMilestones.milestones,
    passedMilestoneClaims: [...mergedMilestoneByOrder.values()]
      .filter(test => test.passed)
      .map(test => test.milestone),
    finalTestPassClaim: finalTest?.passed === true,
    auditedOnlyModuleTestAttempts: legacyMilestones.auditedOnlyAttemptIds.length,
    achievements,
    skippedAnswers,
  }
}

async function applyUserPlan(tx: Prisma.TransactionClient, plan: UserBackfillPlan): Promise<void> {
  if (plan.promoteToAdmin) {
    await tx.user.update({
      where: { id: plan.userId },
      data: { role: 'ADMIN' },
    })
  }

  for (const chapter of plan.chapters) {
    const currentState = await tx.chapterProgress.findUnique({
      where: {
        userId_chapterId: { userId: plan.userId, chapterId: chapter.chapterId },
      },
    })
    const state = currentState
      ? mergeCanonicalProgressStates(currentState, chapter.state)
      : chapter.state
    await tx.chapterProgress.upsert({
      where: {
        userId_chapterId: { userId: plan.userId, chapterId: chapter.chapterId },
      },
      create: {
        userId: plan.userId,
        chapterId: chapter.chapterId,
        ...state,
      },
      update: state,
    })
    chapter.state = state

    if (chapter.lessonId && state.contentCompleted) {
      const existingLessonProgress = await tx.microLessonProgress.findUnique({
        where: {
          userId_microLessonId: {
            userId: plan.userId,
            microLessonId: chapter.lessonId,
          },
        },
      })
      await tx.microLessonProgress.upsert({
        where: {
          userId_microLessonId: {
            userId: plan.userId,
            microLessonId: chapter.lessonId,
          },
        },
        create: {
          userId: plan.userId,
          microLessonId: chapter.lessonId,
          completed: true,
          completedAt: state.contentCompletedAt,
          startedAt: state.contentCompletedAt,
          lastAccessedAt: state.lastAccessedAt,
        },
        update: {
          completed: true,
          completedAt: existingLessonProgress?.completedAt ?? state.contentCompletedAt,
          startedAt: existingLessonProgress?.startedAt ?? state.contentCompletedAt,
          lastAccessedAt:
            latestDate(existingLessonProgress?.lastAccessedAt, state.lastAccessedAt) ??
            state.lastAccessedAt,
        },
      })
    }

    if (chapter.lessonId && shouldReserveLessonCompletion(state)) {
      const dedupeKey = `LESSON_COMPLETE:${chapter.lessonId}`
      await tx.rewardLedger.upsert({
        where: {
          userId_dedupeKey: {
            userId: plan.userId,
            dedupeKey,
          },
        },
        create: {
          userId: plan.userId,
          sourceType: 'MIGRATED_LESSON_COMPLETE',
          sourceId: chapter.lessonId,
          dedupeKey,
          xpAmount: 0,
          gemAmount: 0,
          metadata: {
            canonicalChapterId: chapter.chapterId,
            contentCompleted: state.contentCompleted,
            historicalLessonsCompleted: state.lessonsCompleted,
          },
        },
        update: {},
      })
    }

    if (state.projectApproved) {
      const dedupeKey = `PROJECT_APPROVED:${chapter.chapterId}`
      await tx.rewardLedger.upsert({
        where: {
          userId_dedupeKey: {
            userId: plan.userId,
            dedupeKey,
          },
        },
        create: {
          userId: plan.userId,
          sourceType: 'MIGRATED_PROJECT_APPROVED',
          sourceId: chapter.chapterId,
          dedupeKey,
          xpAmount: 0,
          gemAmount: 0,
          metadata: { canonicalChapterId: chapter.chapterId },
        },
        update: {},
      })
    }
  }

  for (const legacy of plan.milestoneTests) {
    const current = await tx.milestoneTest.findUnique({
      where: {
        userId_milestone: { userId: plan.userId, milestone: legacy.milestone },
      },
    })
    const merged = mergeMilestoneProjection(current, legacy)
    await tx.milestoneTest.upsert({
      where: {
        userId_milestone: { userId: plan.userId, milestone: legacy.milestone },
      },
      create: {
        userId: plan.userId,
        milestone: legacy.milestone,
        ...merged,
      },
      update: merged,
    })
  }

  for (const milestone of plan.passedMilestoneClaims) {
    const legacy = plan.milestoneTests.find(test => test.milestone === milestone)
    const dedupeKey = `MILESTONE_PASS:${milestone}`
    await tx.rewardLedger.upsert({
      where: { userId_dedupeKey: { userId: plan.userId, dedupeKey } },
      create: {
        userId: plan.userId,
        sourceType: 'MIGRATED_MILESTONE_PASS',
        sourceId: String(milestone),
        dedupeKey,
        xpAmount: 0,
        gemAmount: 0,
        metadata: legacy
          ? {
              legacyModel: 'ModuleTestAttempt',
              sourceAttemptId: legacy.sourceAttemptId,
              moduleNumber: legacy.moduleNumber,
              legacyAttemptCount: legacy.legacyAttemptCount,
            }
          : { canonicalHistoryPreserved: true },
      },
      update: {},
    })
  }

  if (plan.finalTestPassClaim) {
    const dedupeKey = 'FINAL_TEST_PASS:foundation'
    await tx.rewardLedger.upsert({
      where: { userId_dedupeKey: { userId: plan.userId, dedupeKey } },
      create: {
        userId: plan.userId,
        sourceType: 'MIGRATED_FINAL_TEST_PASS',
        sourceId: 'foundation',
        dedupeKey,
        xpAmount: 0,
        gemAmount: 0,
        metadata: { canonicalHistoryPreserved: true },
      },
      update: {},
    })
  }

  for (const attempt of plan.attempts) {
    await tx.exerciseAttempt.upsert({
      where: {
        userId_dedupeKey: {
          userId: plan.userId,
          dedupeKey: `legacy-question-answer:${attempt.id}`,
        },
      },
      create: {
        userId: plan.userId,
        exerciseId: attempt.exerciseId,
        dedupeKey: `legacy-question-answer:${attempt.id}`,
        answer: attempt.answer,
        correct: attempt.correct,
        xpEarned: 0,
        attemptedAt: attempt.attemptedAt,
      },
      update: {},
    })

    if (attempt.correct) {
      const dedupeKey = `EXERCISE_CORRECT:${attempt.exerciseId}`
      await tx.rewardLedger.upsert({
        where: {
          userId_dedupeKey: {
            userId: plan.userId,
            dedupeKey,
          },
        },
        create: {
          userId: plan.userId,
          sourceType: 'MIGRATED_EXERCISE_CORRECT',
          sourceId: attempt.exerciseId,
          dedupeKey,
          xpAmount: 0,
          gemAmount: 0,
          metadata: {
            legacyModel: 'QuestionAnswer',
            legacyAnswerId: attempt.id,
            legacyXpEarned: attempt.legacyXpEarned,
          },
        },
        update: {},
      })
    }
  }

  for (const exerciseId of plan.historicalExerciseClaimIds) {
    const dedupeKey = `EXERCISE_CORRECT:${exerciseId}`
    await tx.rewardLedger.upsert({
      where: { userId_dedupeKey: { userId: plan.userId, dedupeKey } },
      create: {
        userId: plan.userId,
        sourceType: 'MIGRATED_EXERCISE_CORRECT',
        sourceId: exerciseId,
        dedupeKey,
        xpAmount: 0,
        gemAmount: 0,
        metadata: {
          legacyModel: 'ChapterProgress/ExerciseProgress',
          identityFallback: true,
        },
      },
      update: {},
    })
  }

  for (const progress of plan.exerciseProgress) {
    const current = await tx.exerciseProgress.findUnique({
      where: {
        userId_exerciseId: { userId: plan.userId, exerciseId: progress.exerciseId },
      },
    })
    const merged = {
      completed: Boolean(current?.completed || progress.completed),
      attemptCount: Math.max(current?.attemptCount ?? 0, progress.attemptCount),
      correctCount: Math.max(current?.correctCount ?? 0, progress.correctCount),
      firstCorrectAt: earliestDate(current?.firstCorrectAt, progress.firstCorrectAt),
      lastAttemptAt:
        latestDate(current?.lastAttemptAt, progress.lastAttemptAt) ?? progress.lastAttemptAt,
    }
    await tx.exerciseProgress.upsert({
      where: {
        userId_exerciseId: { userId: plan.userId, exerciseId: progress.exerciseId },
      },
      create: {
        userId: plan.userId,
        exerciseId: progress.exerciseId,
        ...merged,
      },
      update: merged,
    })
  }

  for (const achievementPlan of plan.achievements) {
    let achievementId = achievementPlan.achievementId
    if (achievementPlan.badgeKey) {
      const badge = BADGES[achievementPlan.badgeKey]
      const achievement = await tx.achievement.upsert({
        where: { badgeId: badge.id },
        create: {
          badgeId: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          xpReward: badge.xpReward,
          rarity: badge.rarity,
        },
        update: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          xpReward: badge.xpReward,
          rarity: badge.rarity,
        },
      })
      achievementId = achievement.id
    }
    if (!achievementId) continue

    await tx.userAchievement.upsert({
      where: {
        userId_achievementId: { userId: plan.userId, achievementId },
      },
      create: {
        userId: plan.userId,
        achievementId,
        unlockedAt: achievementPlan.unlockedAt,
      },
      update: {},
    })
    const dedupeKey = `ACHIEVEMENT_UNLOCK:${achievementPlan.badgeId}`
    await tx.rewardLedger.upsert({
      where: { userId_dedupeKey: { userId: plan.userId, dedupeKey } },
      create: {
        userId: plan.userId,
        sourceType: 'MIGRATED_ACHIEVEMENT_UNLOCK',
        sourceId: achievementPlan.badgeId,
        dedupeKey,
        xpAmount: 0,
        gemAmount: 0,
        metadata: { legacyVisibilityPreserved: true },
      },
      update: {},
    })
  }

  // Release A rollback projection is written last from the merged canonical
  // state. Existing legacy truth is OR/max merged and never loses XP metadata.
  for (const chapter of plan.chapters) {
    const currentProjection = await tx.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: plan.userId,
          chapterId: chapter.publicChapterId,
        },
      },
      select: {
        completedChapter: true,
        answeredQuestions: true,
        submittedProject: true,
        stars: true,
      },
    })
    const projected = mergeRollbackChapterProjection(currentProjection, chapter.state)
    await tx.chapterCompletion.upsert({
      where: {
        userId_chapterId: {
          userId: plan.userId,
          chapterId: chapter.publicChapterId,
        },
      },
      create: {
        userId: plan.userId,
        chapterId: chapter.publicChapterId,
        ...projected,
        xpEarned: 0,
        completedAt:
          chapter.state.contentCompletedAt ??
          chapter.state.exercisesCompletedAt ??
          chapter.state.projectApprovedAt ??
          chapter.state.lastAccessedAt,
      },
      update: {
        completedChapter: projected.completedChapter,
        answeredQuestions: projected.answeredQuestions,
        submittedProject: projected.submittedProject,
        stars: { set: projected.stars },
      },
    })

    if (chapter.state.contentCompleted) {
      await tx.completedChapter.upsert({
        where: {
          userId_chapterId: { userId: plan.userId, chapterId: chapter.chapterId },
        },
        create: {
          userId: plan.userId,
          chapterId: chapter.chapterId,
          completedAt: chapter.state.contentCompletedAt ?? chapter.state.lastAccessedAt,
          xpEarned: 0,
        },
        update: {},
      })
    }
  }
}

async function applyUserPlanWithRetry(prisma: PrismaClient, plan: UserBackfillPlan): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await prisma.$transaction(tx => applyUserPlan(tx, plan), {
        isolationLevel: 'Serializable',
      })
      return
    } catch (error) {
      const retryable =
        typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034'
      if (!retryable || attempt === 3) throw error
    }
  }
}

function addPlanToSummary(summary: BackfillSummary, plan: UserBackfillPlan): void {
  summary.users++
  summary.adminPromotions += Number(plan.promoteToAdmin)
  summary.chapterProgressRows += plan.chapters.length
  summary.lessonProgressRows += plan.chapters.filter(
    chapter => chapter.lessonId && chapter.state.contentCompleted
  ).length
  summary.exerciseProgressRows += plan.exerciseProgress.length
  summary.exerciseAttempts += plan.attempts.length
  summary.milestoneTestRows += plan.milestoneTests.length
  summary.auditedOnlyModuleTestAttempts += plan.auditedOnlyModuleTestAttempts
  summary.achievementRows += plan.achievements.length
  summary.rollbackChapterCompletionRows += plan.chapters.length
  summary.rollbackCompletedChapterRows += plan.chapters.filter(
    chapter => chapter.state.contentCompleted
  ).length
  summary.rewardLedgerClaims += plan.historicalExerciseClaimIds.length
  summary.rewardLedgerClaims += plan.chapters.filter(
    chapter => chapter.lessonId && shouldReserveLessonCompletion(chapter.state)
  ).length
  summary.rewardLedgerClaims += plan.chapters.filter(
    chapter => chapter.state.projectApproved
  ).length
  summary.rewardLedgerClaims += plan.passedMilestoneClaims.length
  summary.rewardLedgerClaims += Number(plan.finalTestPassClaim)
  summary.rewardLedgerClaims += plan.achievements.length
  summary.skippedAnswers += plan.skippedAnswers
}

async function runBackfill(prisma: PrismaClient, mode: BackfillMode): Promise<BackfillSummary> {
  const contentIndex = await buildContentIndex(prisma)
  const summary: BackfillSummary = {
    users: 0,
    adminPromotions: 0,
    chapterProgressRows: 0,
    lessonProgressRows: 0,
    exerciseProgressRows: 0,
    exerciseAttempts: 0,
    milestoneTestRows: 0,
    auditedOnlyModuleTestAttempts: 0,
    achievementRows: 0,
    rollbackChapterCompletionRows: 0,
    rollbackCompletedChapterRows: 0,
    rewardLedgerClaims: 0,
    skippedAnswers: 0,
  }
  let cursor: string | undefined

  while (true) {
    const users = await prisma.user.findMany({
      take: USER_BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        isAdmin: true,
        role: true,
        currentStreak: true,
        lastActiveDate: true,
        createdAt: true,
      },
    })
    if (users.length === 0) break

    for (const user of users) {
      const plan = await buildUserPlan(prisma, user, contentIndex)
      addPlanToSummary(summary, plan)
      if (mode === 'apply') {
        await applyUserPlanWithRetry(prisma, plan)
      }
    }

    cursor = users.at(-1)?.id
    if (users.length < USER_BATCH_SIZE) break
  }

  return summary
}

async function createPrismaClient(): Promise<{
  prisma: PrismaClient
  close: () => Promise<void>
}> {
  await import('dotenv/config')
  const [{ PrismaClient }, { PrismaPg }, { Pool }] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
  ])
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  return {
    prisma,
    close: async () => {
      await prisma.$disconnect()
      await pool.end()
    },
  }
}

async function main(): Promise<void> {
  const mode = parseMode(process.argv.slice(2))
  if (mode === 'apply' && process.env.NODE_ENV === 'production') {
    throw new Error('Produkční backfill vyžaduje samostatně schválený operační postup.')
  }

  const database = await createPrismaClient()
  try {
    const summary = await runBackfill(database.prisma, mode)
    console.log(
      mode === 'apply'
        ? 'Canonical progress backfill completed.'
        : 'Canonical progress dry-run completed. No writes were performed.'
    )
    console.log(JSON.stringify(summary, null, 2))
  } finally {
    await database.close()
  }
}

const currentFile = fileURLToPath(import.meta.url)
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : null

if (invokedFile === currentFile) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
