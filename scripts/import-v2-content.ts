import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Prisma, PrismaClient } from '@prisma/client'
import {
  assertCanonicalCourseContent,
  buildCanonicalCourseContent,
  type CanonicalCourseContent,
} from '../src/lib/course-content'
import {
  canonicalExerciseSourceKey,
  canonicalLessonSourceKey,
} from '../src/lib/canonical-content-keys'

type ImportMode = 'check' | 'dry-run' | 'apply'

export interface ContentImportSummary {
  chapters: number
  lessons: number
  exercises: number
  legacyQuestions: number
  milestones: number
}

function parseMode(argv: string[]): ImportMode {
  const selectedModes = [
    argv.includes('--check') ? 'check' : null,
    argv.includes('--dry-run') ? 'dry-run' : null,
    argv.includes('--apply') ? 'apply' : null,
  ].filter((mode): mode is ImportMode => mode !== null)

  if (selectedModes.length > 1) {
    throw new Error('Použij pouze jeden režim: --check, --dry-run, nebo --apply')
  }

  return selectedModes[0] ?? 'check'
}

function summarize(course: CanonicalCourseContent): ContentImportSummary {
  const exercises = course.chapters.reduce(
    (total, chapter) => total + chapter.lesson.exercises.length,
    0
  )

  return {
    chapters: course.chapters.length,
    lessons: course.chapters.length,
    exercises,
    legacyQuestions: exercises,
    milestones: course.milestones.length,
  }
}

export async function inspectExistingContent(
  prisma: PrismaClient,
  course: CanonicalCourseContent
): Promise<Record<string, number>> {
  const lessonKeys = course.chapters.map(chapter => chapter.lesson.sourceKey)
  const exerciseKeys = course.chapters.flatMap(chapter =>
    chapter.lesson.exercises.map(exercise => exercise.sourceKey)
  )
  const milestoneKeys = course.milestones.map(milestone => milestone.sourceKey)

  const [
    chapters,
    lessons,
    exercises,
    legacyQuestions,
    milestones,
    totalChapters,
    totalLessons,
    totalExercises,
    totalLegacyQuestions,
    totalMilestones,
    publishedCanonicalLessons,
    totalPublishedLessons,
    canonicalExercisesInCanonicalLessons,
    totalExercisesInCanonicalLessons,
  ] = await Promise.all([
    prisma.chapter.count({
      where: { chapterId: { in: course.chapters.map(chapter => chapter.chapterId) } },
    }),
    prisma.microLesson.count({ where: { sourceKey: { in: lessonKeys } } }),
    prisma.exercise.count({ where: { sourceKey: { in: exerciseKeys } } }),
    prisma.question.count({
      where: {
        chapter: { chapterId: { in: course.chapters.map(chapter => chapter.chapterId) } },
      },
    }),
    prisma.courseMilestone.count({ where: { sourceKey: { in: milestoneKeys } } }),
    prisma.chapter.count(),
    prisma.microLesson.count(),
    prisma.exercise.count(),
    prisma.question.count(),
    prisma.courseMilestone.count(),
    prisma.microLesson.count({
      where: { sourceKey: { in: lessonKeys }, isPublished: true },
    }),
    prisma.microLesson.count({ where: { isPublished: true } }),
    prisma.exercise.count({
      where: {
        sourceKey: { in: exerciseKeys },
        microLesson: { sourceKey: { in: lessonKeys }, isPublished: true },
      },
    }),
    prisma.exercise.count({
      where: { microLesson: { sourceKey: { in: lessonKeys }, isPublished: true } },
    }),
  ])

  return {
    chapters,
    lessons,
    exercises,
    legacyQuestions,
    milestones,
    totalChapters,
    totalLessons,
    totalExercises,
    totalLegacyQuestions,
    totalMilestones,
    nonCanonicalChapters: Math.max(0, totalChapters - chapters),
    nonCanonicalLessons: Math.max(0, totalLessons - lessons),
    nonCanonicalExercises: Math.max(0, totalExercises - exercises),
    nonCanonicalMilestones: Math.max(0, totalMilestones - milestones),
    publishedCanonicalLessons,
    publishedNonCanonicalLessons: Math.max(0, totalPublishedLessons - publishedCanonicalLessons),
    canonicalExercisesInCanonicalLessons,
    nonCanonicalExercisesInCanonicalLessons: Math.max(
      0,
      totalExercisesInCanonicalLessons - canonicalExercisesInCanonicalLessons
    ),
  }
}

export async function validateCanonicalDatabaseContent(
  prisma: PrismaClient,
  course: CanonicalCourseContent
): Promise<{ publishedLessons: number; exercises: number }> {
  const expectedLessonKeys = course.chapters.map(chapter =>
    canonicalLessonSourceKey(chapter.chapterId)
  )
  const lessons = await prisma.microLesson.findMany({
    where: { sourceKey: { in: expectedLessonKeys }, isPublished: true },
    select: {
      id: true,
      sourceKey: true,
      chapterId: true,
      exercises: { select: { sourceKey: true } },
    },
  })
  const lessonByKey = new Map(lessons.map(lesson => [lesson.sourceKey, lesson]))
  const issues: string[] = []
  let exerciseCount = 0

  for (const chapter of course.chapters) {
    const lessonKey = canonicalLessonSourceKey(chapter.chapterId)
    const lesson = lessonByKey.get(lessonKey)
    if (!lesson) {
      issues.push(`${lessonKey}: chybí publikovaná canonical lekce`)
      continue
    }
    if (lesson.chapterId !== chapter.chapterId) {
      issues.push(`${lessonKey}: je připojena ke kapitole ${lesson.chapterId}`)
    }

    const actualKeys = new Set(lesson.exercises.map(exercise => exercise.sourceKey))
    for (const exercise of chapter.lesson.exercises) {
      const exerciseKey = canonicalExerciseSourceKey(chapter.chapterId, exercise.order)
      if (!actualKeys.has(exerciseKey)) issues.push(`${exerciseKey}: chybí canonical cvičení`)
      else exerciseCount += 1
    }
  }

  if (lessons.length !== course.chapters.length) {
    issues.push(`publikované canonical lekce: ${lessons.length}/${course.chapters.length}`)
  }
  const expectedExerciseCount = course.chapters.reduce(
    (total, chapter) => total + chapter.lesson.exercises.length,
    0
  )
  if (exerciseCount !== expectedExerciseCount) {
    issues.push(`canonical cvičení: ${exerciseCount}/${expectedExerciseCount}`)
  }
  if (issues.length > 0) {
    throw new Error(`DB canonical content validation failed:\n${issues.join('\n')}`)
  }

  return { publishedLessons: lessons.length, exercises: exerciseCount }
}

export async function importCanonicalCourseContent(
  prisma: PrismaClient,
  course: CanonicalCourseContent
): Promise<ContentImportSummary> {
  assertCanonicalCourseContent(course)

  for (const chapter of course.chapters) {
    await prisma.$transaction(async tx => {
      const chapterRecord = await tx.chapter.upsert({
        where: { chapterId: chapter.chapterId },
        update: {
          title: chapter.title,
          description: chapter.description,
          videoFile: chapter.videoFile,
          notebookLmUrl: chapter.notebookLmUrl,
          colabUrl: chapter.colabUrl,
          projectTitle: chapter.projectTitle,
          projectDescription: chapter.projectDescription,
          projectRequirements: chapter.projectRequirements,
          xpReward: chapter.xpReward,
          difficulty: chapter.difficulty,
          order: chapter.order,
          module: chapter.module,
        },
        create: {
          chapterId: chapter.chapterId,
          title: chapter.title,
          description: chapter.description,
          videoFile: chapter.videoFile,
          notebookLmUrl: chapter.notebookLmUrl,
          colabUrl: chapter.colabUrl,
          projectTitle: chapter.projectTitle,
          projectDescription: chapter.projectDescription,
          projectRequirements: chapter.projectRequirements,
          xpReward: chapter.xpReward,
          difficulty: chapter.difficulty,
          order: chapter.order,
          module: chapter.module,
        },
      })

      const [lessonBySourceKey, lessonBySlot] = await Promise.all([
        tx.microLesson.findUnique({ where: { sourceKey: chapter.lesson.sourceKey } }),
        tx.microLesson.findUnique({
          where: {
            chapterId_order: {
              chapterId: chapter.chapterId,
              order: chapter.lesson.order,
            },
          },
        }),
      ])
      if (lessonBySourceKey && lessonBySlot && lessonBySourceKey.id !== lessonBySlot.id) {
        throw new Error(
          `Kolize canonical lesson ${chapter.lesson.sourceKey}: sourceKey a chapter/order ukazují na různé DB řádky.`
        )
      }
      const existingLesson = lessonBySourceKey ?? lessonBySlot

      const lessonRecord = existingLesson
        ? await tx.microLesson.update({
            where: { id: existingLesson.id },
            data: {
              sourceKey: chapter.lesson.sourceKey,
              chapterId: chapter.chapterId,
              order: chapter.lesson.order,
              title: chapter.lesson.title,
              content: chapter.lesson.content,
              summary: chapter.lesson.summary,
              xpReward: chapter.lesson.xpReward,
              isPublished: chapter.lesson.isPublished,
            },
          })
        : await tx.microLesson.create({
            data: {
              sourceKey: chapter.lesson.sourceKey,
              chapterId: chapter.chapterId,
              order: chapter.lesson.order,
              title: chapter.lesson.title,
              content: chapter.lesson.content,
              summary: chapter.lesson.summary,
              xpReward: chapter.lesson.xpReward,
              isPublished: chapter.lesson.isPublished,
            },
          })

      for (const exercise of chapter.lesson.exercises) {
        const [exerciseBySourceKey, exercisesInSlot] = await Promise.all([
          tx.exercise.findUnique({ where: { sourceKey: exercise.sourceKey } }),
          tx.exercise.findMany({
            where: { microLessonId: lessonRecord.id, order: exercise.order },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            take: 2,
          }),
        ])
        if (exercisesInSlot.length > 1) {
          throw new Error(
            `Kolize canonical exercise ${exercise.sourceKey}: lesson/order obsahuje více DB řádků.`
          )
        }
        const exerciseBySlot = exercisesInSlot[0]
        if (exerciseBySourceKey && exerciseBySlot && exerciseBySourceKey.id !== exerciseBySlot.id) {
          throw new Error(
            `Kolize canonical exercise ${exercise.sourceKey}: sourceKey a lesson/order ukazují na různé DB řádky.`
          )
        }
        const existingExercise = exerciseBySourceKey ?? exerciseBySlot
        const exerciseData = exercise.data as unknown as Prisma.InputJsonValue

        if (existingExercise) {
          await tx.exercise.update({
            where: { id: existingExercise.id },
            data: {
              sourceKey: exercise.sourceKey,
              microLessonId: lessonRecord.id,
              order: exercise.order,
              type: exercise.type,
              difficulty: exercise.difficulty,
              question: exercise.question,
              data: exerciseData,
              explanation: exercise.explanation,
              hints: exercise.hints,
              xpReward: exercise.xpReward,
            },
          })
        } else {
          await tx.exercise.create({
            data: {
              sourceKey: exercise.sourceKey,
              microLessonId: lessonRecord.id,
              order: exercise.order,
              type: exercise.type,
              difficulty: exercise.difficulty,
              question: exercise.question,
              data: exerciseData,
              explanation: exercise.explanation,
              hints: exercise.hints,
              xpReward: exercise.xpReward,
            },
          })
        }

        await tx.question.upsert({
          where: {
            chapterId_questionNumber: {
              chapterId: chapterRecord.id,
              questionNumber: exercise.order,
            },
          },
          update: {
            questionText: exercise.question,
            options: exercise.data.options,
            correctAnswer: exercise.data.correctIndex,
            explanation: exercise.explanation,
            difficulty: exercise.difficulty,
            xpReward: exercise.xpReward,
          },
          create: {
            chapterId: chapterRecord.id,
            questionNumber: exercise.order,
            questionText: exercise.question,
            options: exercise.data.options,
            correctAnswer: exercise.data.correctIndex,
            explanation: exercise.explanation,
            difficulty: exercise.difficulty,
            xpReward: exercise.xpReward,
          },
        })
      }
    })
  }

  for (const milestone of course.milestones) {
    const chapter = await prisma.chapter.findUniqueOrThrow({
      where: { chapterId: milestone.chapterId },
      select: { id: true },
    })

    await prisma.courseMilestone.upsert({
      where: { sourceKey: milestone.sourceKey },
      update: {
        chapterId: chapter.id,
        order: milestone.order,
        title: milestone.title,
        description: milestone.description,
        testRequired: milestone.testRequired,
        certificateEligible: milestone.certificateEligible,
        isPublished: milestone.isPublished,
      },
      create: {
        sourceKey: milestone.sourceKey,
        chapterId: chapter.id,
        order: milestone.order,
        title: milestone.title,
        description: milestone.description,
        testRequired: milestone.testRequired,
        certificateEligible: milestone.certificateEligible,
        isPublished: milestone.isPublished,
      },
    })
  }

  return summarize(course)
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
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const course = buildCanonicalCourseContent(repoRoot)
  assertCanonicalCourseContent(course)
  const planned = summarize(course)

  if (mode === 'check') {
    console.log('Canonical content check passed.')
    console.log(JSON.stringify(planned, null, 2))
    return
  }

  const database = await createPrismaClient()
  try {
    if (mode === 'dry-run') {
      const existing = await inspectExistingContent(database.prisma, course)
      console.log('Canonical content dry-run passed. No writes were performed.')
      console.log(JSON.stringify({ planned, existing }, null, 2))
      return
    }

    const imported = await importCanonicalCourseContent(database.prisma, course)
    const databaseValidation = await validateCanonicalDatabaseContent(database.prisma, course)
    console.log('Canonical content import completed.')
    console.log(JSON.stringify({ imported, databaseValidation }, null, 2))
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
