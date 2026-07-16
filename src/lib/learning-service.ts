import { Prisma, QuestCategory } from '@prisma/client'
import { calculateLevel } from '@/lib/gamification'
import { evaluateExerciseAnswer } from '@/lib/exercise-contract'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quest-tracker'
import { updateStreak } from '@/lib/streak-manager'
import {
  canonicalExerciseSourceKeys,
  canonicalLessonSourceKey,
  canonicalPreviousChapterId,
  isCanonicalChapterId,
  isCanonicalExerciseSourceKey,
} from '@/lib/canonical-content-keys'

const MAX_TRANSACTION_RETRIES = 3

export class LearningServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'LearningServiceError'
  }
}

export interface SubmitExerciseAnswerInput {
  userId: string
  exerciseId: string
  answer: Prisma.InputJsonValue
  dedupeKey?: string
  hintsUsed?: number
  timeSpentSeconds?: number
}

export interface CompleteLessonInput {
  userId: string
  lessonId: string
}

interface ChapterStatePatch {
  contentCompleted?: boolean
  exercisesCompleted?: boolean
  projectApproved?: boolean
  lessonsCompleted?: number
  exercisesCorrect?: number
  exercisesTotal?: number
}

export interface RewardInput {
  userId: string
  sourceType: string
  sourceId: string
  xpAmount: number
  gemAmount?: number
  metadata?: Prisma.InputJsonValue
  lessonIncrement?: number
  questCategories?: QuestCategory[]
}

export async function submitExerciseAnswer(input: SubmitExerciseAnswerInput) {
  return runLearningTransaction(async tx => {
    if (input.dedupeKey) {
      const replay = await tx.exerciseAttempt.findUnique({
        where: {
          userId_dedupeKey: {
            userId: input.userId,
            dedupeKey: input.dedupeKey,
          },
        },
        select: {
          exerciseId: true,
          answer: true,
          correct: true,
        },
      })

      if (replay) {
        assertMatchingExerciseReplay(replay, input)
        const user = await tx.user.findUnique({
          where: { id: input.userId },
          select: { hearts: true, level: true, xp: true },
        })
        return {
          correct: replay.correct,
          xpEarned: 0,
          replayed: true,
          heartLost: false,
          hearts: user?.hearts ?? 0,
          level: user?.level ?? 1,
          totalXP: user?.xp ?? 0,
          questProgress: [],
        }
      }
    }

    const exercise = await tx.exercise.findUnique({
      where: { id: input.exerciseId },
      include: {
        microLesson: {
          include: {
            chapter: {
              select: { id: true, chapterId: true, order: true },
            },
          },
        },
      },
    })
    if (
      !exercise ||
      !exercise.microLesson.isPublished ||
      !isCanonicalChapterId(exercise.microLesson.chapter.chapterId) ||
      exercise.microLesson.sourceKey !==
        canonicalLessonSourceKey(exercise.microLesson.chapter.chapterId) ||
      !isCanonicalExerciseSourceKey(exercise.sourceKey, exercise.microLesson.chapter.chapterId)
    ) {
      throw new LearningServiceError('Cvičení nenalezeno', 404)
    }

    await assertCanonicalChapterUnlocked(tx, input.userId, exercise.microLesson.chapter)

    const lessonProgress = await tx.microLessonProgress.findUnique({
      where: {
        userId_microLessonId: {
          userId: input.userId,
          microLessonId: exercise.microLessonId,
        },
      },
      select: { completed: true },
    })
    if (!lessonProgress?.completed) {
      throw new LearningServiceError('Nejprve dokonči obsah lekce', 403)
    }

    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: {
        hearts: true,
        unlimitedHeartsUntil: true,
        xp: true,
        level: true,
      },
    })
    if (!user) throw new LearningServiceError('Uživatel nenalezen', 404)

    const now = new Date()
    const hasUnlimitedHearts = Boolean(user.unlimitedHeartsUntil && user.unlimitedHeartsUntil > now)
    if (!hasUnlimitedHearts && user.hearts <= 0) {
      throw new LearningServiceError('Nemáš žádná srdce', 400)
    }

    const correct = evaluateExerciseAnswer(
      exercise.type,
      exercise.data as Record<string, unknown>,
      input.answer
    )
    let attemptId: string | null = null
    if (input.dedupeKey) {
      const insertedAttempt = await tx.exerciseAttempt.createMany({
        data: [
          {
            userId: input.userId,
            exerciseId: exercise.id,
            dedupeKey: input.dedupeKey,
            answer: input.answer,
            correct,
            xpEarned: 0,
            timeSpentSeconds: input.timeSpentSeconds,
          },
        ],
        skipDuplicates: true,
      })
      const storedAttempt = await tx.exerciseAttempt.findUnique({
        where: {
          userId_dedupeKey: { userId: input.userId, dedupeKey: input.dedupeKey },
        },
        select: { id: true, exerciseId: true, answer: true, correct: true },
      })
      if (insertedAttempt.count !== 1 || !storedAttempt) {
        if (storedAttempt) assertMatchingExerciseReplay(storedAttempt, input)
        const replayUser = await tx.user.findUnique({
          where: { id: input.userId },
          select: { hearts: true, level: true, xp: true },
        })
        return {
          correct: storedAttempt?.correct ?? correct,
          xpEarned: 0,
          replayed: true,
          heartLost: false,
          hearts: replayUser?.hearts ?? user.hearts,
          level: replayUser?.level ?? user.level,
          totalXP: replayUser?.xp ?? user.xp,
          questProgress: [],
        }
      }
      attemptId = storedAttempt.id
    }
    let heartLost = false
    let hearts = user.hearts
    let xpEarned = 0
    let questProgress: { questId: string; newProgress: number; completed: boolean }[] = []

    if (!correct && !hasUnlimitedHearts) {
      const changed = await tx.user.updateMany({
        where: { id: input.userId, hearts: { gt: 0 } },
        data: { hearts: { decrement: 1 }, lastHeartRegenAt: now },
      })
      heartLost = changed.count === 1
      hearts = Math.max(0, user.hearts - (heartLost ? 1 : 0))
    }

    if (correct) {
      const multiplier = await getActiveXpMultiplier(tx, input.userId, now)
      const reward = await awardCanonicalReward(tx, {
        userId: input.userId,
        sourceType: 'EXERCISE_CORRECT',
        sourceId: exercise.id,
        xpAmount: exercise.xpReward * multiplier,
        metadata: { hintsUsed: input.hintsUsed ?? 0 },
        questCategories: [QuestCategory.XP_EARNED, QuestCategory.EXERCISES_PERFECT],
      })
      xpEarned = reward.xpEarned
      questProgress = reward.questProgress
    }

    if (attemptId) {
      await tx.exerciseAttempt.update({ where: { id: attemptId }, data: { xpEarned } })
    } else {
      await tx.exerciseAttempt.create({
        data: {
          userId: input.userId,
          exerciseId: exercise.id,
          answer: input.answer,
          correct,
          xpEarned,
          timeSpentSeconds: input.timeSpentSeconds,
        },
      })
    }

    await tx.exerciseProgress.upsert({
      where: {
        userId_exerciseId: { userId: input.userId, exerciseId: exercise.id },
      },
      create: {
        userId: input.userId,
        exerciseId: exercise.id,
        completed: correct,
        attemptCount: 1,
        correctCount: correct ? 1 : 0,
        firstCorrectAt: correct ? now : null,
        lastAttemptAt: now,
      },
      update: {
        completed: correct ? true : undefined,
        attemptCount: { increment: 1 },
        correctCount: correct ? { increment: 1 } : undefined,
        lastAttemptAt: now,
      },
    })
    if (correct) {
      await tx.exerciseProgress.updateMany({
        where: { userId: input.userId, exerciseId: exercise.id, firstCorrectAt: null },
        data: { firstCorrectAt: now },
      })
    }

    const [exerciseCount, completedExerciseCount] = await Promise.all([
      tx.exercise.count({
        where: {
          sourceKey: {
            in: canonicalExerciseSourceKeys(exercise.microLesson.chapter.chapterId),
          },
          microLesson: {
            chapterId: exercise.microLesson.chapter.chapterId,
            isPublished: true,
            sourceKey: canonicalLessonSourceKey(exercise.microLesson.chapter.chapterId),
          },
        },
      }),
      tx.exerciseProgress.count({
        where: {
          userId: input.userId,
          completed: true,
          exercise: {
            sourceKey: {
              in: canonicalExerciseSourceKeys(exercise.microLesson.chapter.chapterId),
            },
            microLesson: {
              chapterId: exercise.microLesson.chapter.chapterId,
              isPublished: true,
              sourceKey: canonicalLessonSourceKey(exercise.microLesson.chapter.chapterId),
            },
          },
        },
      }),
    ])

    const chapterProgress = await updateChapterState(
      tx,
      input.userId,
      exercise.microLesson.chapter,
      {
        exercisesCorrect: completedExerciseCount,
        exercisesTotal: exerciseCount,
        exercisesCompleted: exerciseCount > 0 && completedExerciseCount >= exerciseCount,
      }
    )
    const updatedUser = await tx.user.findUnique({
      where: { id: input.userId },
      select: { xp: true, level: true, hearts: true },
    })

    return {
      correct,
      xpEarned,
      replayed: false,
      heartLost,
      hearts: updatedUser?.hearts ?? hearts,
      outOfHearts: !hasUnlimitedHearts && (updatedUser?.hearts ?? hearts) <= 0,
      totalXP: updatedUser?.xp ?? user.xp,
      level: updatedUser?.level ?? user.level,
      leveledUp: (updatedUser?.level ?? user.level) > user.level,
      questProgress,
      exercisesCompleted: chapterProgress.exercisesCompleted,
      stars: chapterProgress.stars,
    }
  })
}

export async function completeMicroLesson(input: CompleteLessonInput) {
  return runLearningTransaction(async tx => {
    const lesson = await tx.microLesson.findUnique({
      where: { id: input.lessonId, isPublished: true },
      include: {
        chapter: { select: { id: true, chapterId: true, order: true } },
      },
    })
    if (
      !lesson ||
      !isCanonicalChapterId(lesson.chapter.chapterId) ||
      lesson.sourceKey !== canonicalLessonSourceKey(lesson.chapter.chapterId)
    ) {
      throw new LearningServiceError('Lekce nenalezena', 404)
    }

    await assertCanonicalChapterUnlocked(tx, input.userId, lesson.chapter)

    const now = new Date()
    const existingProgress = await tx.microLessonProgress.findUnique({
      where: {
        userId_microLessonId: { userId: input.userId, microLessonId: lesson.id },
      },
      select: { completedAt: true, startedAt: true },
    })
    await tx.microLessonProgress.upsert({
      where: {
        userId_microLessonId: { userId: input.userId, microLessonId: lesson.id },
      },
      create: {
        userId: input.userId,
        microLessonId: lesson.id,
        completed: true,
        startedAt: now,
        completedAt: now,
        lastAccessedAt: now,
      },
      update: {
        completed: true,
        completedAt: existingProgress?.completedAt ?? now,
        startedAt: existingProgress?.startedAt ?? now,
        lastAccessedAt: now,
      },
    })

    const [totalLessons, lessonsCompleted, previousChapterProgress] = await Promise.all([
      tx.microLesson.count({
        where: {
          chapterId: lesson.chapter.chapterId,
          isPublished: true,
          sourceKey: canonicalLessonSourceKey(lesson.chapter.chapterId),
        },
      }),
      tx.microLessonProgress.count({
        where: {
          userId: input.userId,
          completed: true,
          microLesson: {
            chapterId: lesson.chapter.chapterId,
            isPublished: true,
            sourceKey: canonicalLessonSourceKey(lesson.chapter.chapterId),
          },
        },
      }),
      tx.chapterProgress.findUnique({
        where: {
          userId_chapterId: { userId: input.userId, chapterId: lesson.chapter.id },
        },
        select: { contentCompleted: true },
      }),
    ])
    const contentCompleted = totalLessons > 0 && lessonsCompleted >= totalLessons
    const chapterProgress = await updateChapterState(tx, input.userId, lesson.chapter, {
      contentCompleted,
      lessonsCompleted,
    })
    const questCategories: QuestCategory[] = [
      QuestCategory.LESSONS_COMPLETED,
      QuestCategory.XP_EARNED,
    ]
    if (contentCompleted && !previousChapterProgress?.contentCompleted) {
      questCategories.push(QuestCategory.CHAPTERS_COMPLETED)
    }
    const reward = await awardCanonicalReward(tx, {
      userId: input.userId,
      sourceType: 'LESSON_COMPLETE',
      sourceId: lesson.id,
      xpAmount: lesson.xpReward,
      lessonIncrement: 1,
      questCategories,
    })
    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: { xp: true, level: true },
    })

    return {
      success: true,
      alreadyCompleted: !reward.awarded,
      xpEarned: reward.xpEarned,
      totalXP: user?.xp ?? 0,
      level: user?.level ?? 1,
      lessonsCompleted,
      progress: chapterProgress.progress,
      contentCompleted: chapterProgress.contentCompleted,
      stars: chapterProgress.stars,
      questProgress: reward.questProgress,
    }
  })
}

export async function applyProjectApproval(
  tx: Prisma.TransactionClient,
  input: {
    userId: string
    chapter: { id: string; chapterId: string; order: number }
    xpAmount: number
    gemAmount: number
  }
) {
  await assertProjectSubmissionAllowed(tx, input.userId, input.chapter)

  const reward = await awardCanonicalReward(tx, {
    userId: input.userId,
    sourceType: 'PROJECT_APPROVED',
    // A project reward is earned once per chapter. Using the canonical chapter
    // id also lets the migration reserve the same claim for legacy approvals.
    sourceId: input.chapter.id,
    xpAmount: input.xpAmount,
    gemAmount: input.gemAmount,
    questCategories: [QuestCategory.XP_EARNED],
  })
  const progress = await updateChapterState(tx, input.userId, input.chapter, {
    projectApproved: true,
  })

  return { ...reward, progress }
}

export async function assertProjectSubmissionAllowed(
  tx: Prisma.TransactionClient,
  userId: string,
  chapter: { id: string; chapterId: string; order: number }
) {
  await assertCanonicalChapterUnlocked(tx, userId, chapter)

  const progress = await tx.chapterProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId: chapter.id } },
    select: { contentCompleted: true, exercisesCompleted: true },
  })
  if (!progress?.contentCompleted || !progress.exercisesCompleted) {
    throw new LearningServiceError(
      'Před odevzdáním projektu dokonči obsah i všechna cvičení kapitoly',
      403
    )
  }
}

/**
 * Guard a public chapter action with the canonical, internal-id progress row.
 * Callers resolve the public slug to Chapter first and then pass both ids here.
 */
export async function assertCanonicalChapterUnlocked(
  tx: Prisma.TransactionClient,
  userId: string,
  chapter: { id: string; chapterId: string; order: number }
) {
  if (!isCanonicalChapterId(chapter.chapterId)) {
    throw new LearningServiceError('Kapitola nenalezena', 404)
  }

  const previousChapterId = canonicalPreviousChapterId(chapter.chapterId)
  if (!previousChapterId) return

  const previous = await tx.chapter.findUnique({
    where: { chapterId: previousChapterId },
    select: { id: true },
  })
  if (!previous) return

  const progress = await tx.chapterProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId: previous.id } },
    select: { contentCompleted: true },
  })
  if (!progress?.contentCompleted) {
    throw new LearningServiceError('Nejprve dokonči předchozí kapitolu', 403)
  }

  // Both ids are deliberately present at this boundary: chapterId is the public
  // slug, while id is the only value allowed in ChapterProgress.
  void chapter.id
  void chapter.chapterId
}

export async function runLearningTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: 'Serializable' })
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
      if (!retryable || attempt === MAX_TRANSACTION_RETRIES) throw error
    }
  }

  throw new Error('Learning transaction retry limit exceeded')
}

export async function awardCanonicalReward(tx: Prisma.TransactionClient, input: RewardInput) {
  if (input.xpAmount < 0 || (input.gemAmount ?? 0) < 0) {
    throw new Error('Canonical rewards cannot be negative')
  }

  const dedupeKey = `${input.sourceType}:${input.sourceId}`
  const inserted = await tx.rewardLedger.createMany({
    data: [
      {
        userId: input.userId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        dedupeKey,
        xpAmount: input.xpAmount,
        gemAmount: input.gemAmount ?? 0,
        metadata: input.metadata,
      },
    ],
    skipDuplicates: true,
  })
  if (inserted.count !== 1) {
    return { awarded: false, xpEarned: 0, gemsEarned: 0, questProgress: [] }
  }

  const user = await tx.user.update({
    where: { id: input.userId },
    data: {
      xp: { increment: input.xpAmount },
      dailyXP: { increment: input.xpAmount },
      gems: input.gemAmount ? { increment: input.gemAmount } : undefined,
    },
    select: { xp: true, level: true },
  })
  const level = calculateLevel(user.xp)
  if (level !== user.level) {
    await tx.user.update({ where: { id: input.userId }, data: { level } })
  }

  await updateStreak(input.userId, input.xpAmount, tx, input.lessonIncrement ?? 0)

  const questProgress = []
  for (const category of input.questCategories ?? []) {
    const increment = category === QuestCategory.XP_EARNED ? input.xpAmount : 1
    questProgress.push(...(await updateQuestProgress(input.userId, category, increment, tx)))
  }
  await updateLeagueXp(tx, input.userId, input.xpAmount)

  return {
    awarded: true,
    xpEarned: input.xpAmount,
    gemsEarned: input.gemAmount ?? 0,
    questProgress,
  }
}

async function updateChapterState(
  tx: Prisma.TransactionClient,
  userId: string,
  chapter: { id: string; chapterId: string },
  patch: ChapterStatePatch
) {
  const current = await tx.chapterProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId: chapter.id } },
  })
  const now = new Date()
  const contentCompleted = current?.contentCompleted || patch.contentCompleted === true
  const exercisesCompleted = current?.exercisesCompleted || patch.exercisesCompleted === true
  const projectApproved = current?.projectApproved || patch.projectApproved === true
  const stars = Number(contentCompleted) + Number(exercisesCompleted) + Number(projectApproved)
  const progress = Math.round((stars / 3) * 100)

  const result = await tx.chapterProgress.upsert({
    where: { userId_chapterId: { userId, chapterId: chapter.id } },
    create: {
      userId,
      chapterId: chapter.id,
      contentCompleted,
      exercisesCompleted,
      projectApproved,
      stars,
      progress,
      lessonsCompleted: patch.lessonsCompleted ?? 0,
      exercisesCorrect: patch.exercisesCorrect ?? 0,
      exercisesTotal: patch.exercisesTotal ?? 0,
      contentCompletedAt: contentCompleted ? now : null,
      exercisesCompletedAt: exercisesCompleted ? now : null,
      projectApprovedAt: projectApproved ? now : null,
      lastAccessedAt: now,
      lastUpdated: now,
    },
    update: {
      contentCompleted,
      exercisesCompleted,
      projectApproved,
      stars: { set: Math.max(current?.stars ?? 0, stars) },
      progress: { set: Math.max(current?.progress ?? 0, progress) },
      lessonsCompleted:
        patch.lessonsCompleted === undefined
          ? undefined
          : { set: Math.max(current?.lessonsCompleted ?? 0, patch.lessonsCompleted) },
      exercisesCorrect:
        patch.exercisesCorrect === undefined
          ? undefined
          : { set: Math.max(current?.exercisesCorrect ?? 0, patch.exercisesCorrect) },
      exercisesTotal:
        patch.exercisesTotal === undefined
          ? undefined
          : { set: Math.max(current?.exercisesTotal ?? 0, patch.exercisesTotal) },
      contentCompletedAt:
        contentCompleted && !current?.contentCompletedAt ? now : current?.contentCompletedAt,
      exercisesCompletedAt:
        exercisesCompleted && !current?.exercisesCompletedAt ? now : current?.exercisesCompletedAt,
      projectApprovedAt:
        projectApproved && !current?.projectApprovedAt ? now : current?.projectApprovedAt,
      lastAccessedAt: now,
      lastUpdated: now,
    },
  })

  const legacyProjection = await tx.chapterCompletion.findUnique({
    where: { userId_chapterId: { userId, chapterId: chapter.chapterId } },
    select: {
      completedChapter: true,
      answeredQuestions: true,
      submittedProject: true,
      stars: true,
    },
  })
  const projectedContent = legacyProjection?.completedChapter || result.contentCompleted
  const projectedExercises = legacyProjection?.answeredQuestions || result.exercisesCompleted
  const projectedProject = legacyProjection?.submittedProject || result.projectApproved
  const projectedStars = Math.max(legacyProjection?.stars ?? 0, result.stars)

  await tx.chapterCompletion.upsert({
    where: { userId_chapterId: { userId, chapterId: chapter.chapterId } },
    create: {
      userId,
      chapterId: chapter.chapterId,
      completedChapter: projectedContent,
      answeredQuestions: projectedExercises,
      submittedProject: projectedProject,
      stars: projectedStars,
      xpEarned: 0,
    },
    update: {
      completedChapter: projectedContent,
      answeredQuestions: projectedExercises,
      submittedProject: projectedProject,
      stars: { set: projectedStars },
    },
  })
  if (result.contentCompleted) {
    await tx.completedChapter.upsert({
      where: { userId_chapterId: { userId, chapterId: chapter.id } },
      create: { userId, chapterId: chapter.id, xpEarned: 0 },
      update: {},
    })
  }

  return result
}

function assertMatchingExerciseReplay(
  replay: { exerciseId: string; answer: Prisma.JsonValue; correct: boolean },
  input: SubmitExerciseAnswerInput
) {
  if (
    replay.exerciseId !== input.exerciseId ||
    canonicalJson(replay.answer) !== canonicalJson(input.answer)
  ) {
    throw new LearningServiceError('Idempotency key byl již použit pro jiný požadavek', 409)
  }
}

function canonicalJson(value: Prisma.JsonValue | Prisma.InputJsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`

  const object = value as Record<string, Prisma.JsonValue | Prisma.InputJsonValue>
  return `{${Object.keys(object)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalJson(object[key] ?? null)}`)
    .join(',')}}`
}

async function getActiveXpMultiplier(tx: Prisma.TransactionClient, userId: string, now: Date) {
  const boost = await tx.userPurchase.findFirst({
    where: {
      userId,
      usedAt: { not: null },
      expiresAt: { gt: now },
      item: { key: { startsWith: 'double_xp_' } },
    },
    select: { item: { select: { effectData: true } } },
  })
  const effect = boost?.item.effectData
  if (!isRecord(effect) || typeof effect.multiplier !== 'number') return 1
  return Math.max(1, Math.floor(effect.multiplier))
}

async function updateLeagueXp(tx: Prisma.TransactionClient, userId: string, xpAmount: number) {
  if (xpAmount <= 0) return

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const membership = await tx.leagueMembership.findFirst({
    where: { userId, league: { weekStart, weekEnd } },
    select: { id: true },
  })
  if (membership) {
    await tx.leagueMembership.update({
      where: { id: membership.id },
      data: { weeklyXP: { increment: xpAmount } },
    })
    return
  }

  const league = await tx.league.upsert({
    where: { tier_weekStart: { tier: 'BRONZE', weekStart } },
    create: { tier: 'BRONZE', weekStart, weekEnd },
    update: { weekEnd },
  })
  await tx.leagueMembership.upsert({
    where: { userId_leagueId: { userId, leagueId: league.id } },
    create: { userId, leagueId: league.id, weeklyXP: xpAmount },
    update: { weeklyXP: { increment: xpAmount } },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
