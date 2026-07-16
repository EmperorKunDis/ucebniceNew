import fs from 'node:fs'
import path from 'node:path'
import { chapters, type Chapter as ChapterManifestEntry } from '../data/chapters'
import { canonicalExerciseSourceKey, canonicalLessonSourceKey } from './canonical-content-keys'
import { GITHUB_CONFIG } from './constants'

export const EXPECTED_CHAPTER_COUNT = 40
export const EXPECTED_EXERCISE_COUNT = 400
export const EXPECTED_EXERCISES_PER_CHAPTER = 10
export const EXPECTED_VIDEO_COUNT = 38
export const EXPECTED_NOTEBOOKLM_COUNT = 38
export const EXPECTED_COLAB_COUNT = 40
export const CHAPTERS_WITHOUT_VIDEO = new Set(['09', '10'])
export const PROJECT_CHAPTER_IDS = new Set(['09', '15', '34', '35'])

export interface ParsedAssessmentQuestion {
  chapterId: string
  questionNumber: number
  questionText: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface MultipleChoiceExerciseData {
  options: string[]
  correctIndex: number
}

export interface CanonicalExerciseContent {
  sourceKey: string
  order: number
  type: 'MULTIPLE_CHOICE'
  difficulty: 'MEDIUM'
  question: string
  data: MultipleChoiceExerciseData
  explanation: string
  hints: string[]
  xpReward: number
}

export interface CanonicalLessonContent {
  sourceKey: string
  order: number
  title: string
  content: string
  summary: string
  xpReward: number
  isPublished: true
  exercises: CanonicalExerciseContent[]
}

export interface CanonicalChapterContent {
  chapterId: string
  order: number
  module: number
  title: string
  description: string
  difficulty: 'MEDIUM'
  xpReward: number
  videoFile: string | null
  notebookLmUrl: string | null
  colabUrl: string | null
  projectTitle: string | null
  projectDescription: string | null
  projectRequirements: string | null
  lesson: CanonicalLessonContent
}

export interface CanonicalMilestoneContent {
  sourceKey: string
  chapterId: string
  order: number
  title: string
  description: string
  testRequired: true
  certificateEligible: boolean
  isPublished: true
}

export interface CanonicalCourseContent {
  chapters: CanonicalChapterContent[]
  milestones: CanonicalMilestoneContent[]
}

export interface ContentValidationIssue {
  path: string
  message: string
}

interface ProjectMetadata {
  title: string
  description: string | null
  requirements: string | null
}

export class CourseContentValidationError extends Error {
  constructor(readonly issues: ContentValidationIssue[]) {
    super(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'))
    this.name = 'CourseContentValidationError'
  }
}

function expectedChapterId(number: number): string {
  return String(number).padStart(2, '0')
}

function parseQuestionBlock(
  chapterId: string,
  questionNumber: number,
  block: string
): ParsedAssessmentQuestion {
  const questionLine = block
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(
      line =>
        line.length > 0 &&
        line !== '---' &&
        !/^[a-d]\)\s+/.test(line) &&
        !/^\*\*(Správná odpověď|Vysvětlení):/.test(line)
    )
  const questionText = questionLine
    ?.replace(/\\([*_])/g, '$1')
    .replace(/^\s*[*_]+/, '')
    .replace(/[*_]+\s*$/, '')
    .replace(/([\p{L}\p{N}])_([)\s])/gu, '$1$2')
  const optionMatches = [...block.matchAll(/^([a-d])\)\s+(.+)$/gm)]
  const correctAnswerLetter = block.match(/^\*\*Správná odpověď:\*\*\s+([a-d])\)/m)?.[1]
  const explanation = block.match(/^\*\*Vysvětlení:\*\*\s+(.+)$/m)?.[1]

  if (!questionText?.trim()) {
    throw new Error(`Kapitola ${chapterId}, otázka ${questionNumber}: chybí text otázky`)
  }
  if (optionMatches.length !== 4) {
    throw new Error(
      `Kapitola ${chapterId}, otázka ${questionNumber}: očekávány 4 možnosti, nalezeno ${optionMatches.length}`
    )
  }
  if (!correctAnswerLetter) {
    throw new Error(`Kapitola ${chapterId}, otázka ${questionNumber}: chybí správná odpověď`)
  }
  if (!explanation?.trim()) {
    throw new Error(`Kapitola ${chapterId}, otázka ${questionNumber}: chybí vysvětlení`)
  }

  return {
    chapterId,
    questionNumber,
    questionText: questionText.trim(),
    options: optionMatches.map(match => (match[2] ?? '').trim()),
    correctAnswer: correctAnswerLetter.charCodeAt(0) - 'a'.charCodeAt(0),
    explanation: explanation.trim(),
  }
}

export function parseAssessmentMarkdown(markdown: string): ParsedAssessmentQuestion[] {
  const chapterSections = markdown.split(/^## Kapitola (\d+):[^\n]*$/gm)
  const parsedQuestions: ParsedAssessmentQuestion[] = []

  for (let index = 1; index < chapterSections.length; index += 2) {
    const chapterNumberText = chapterSections[index]
    const chapterBlock = chapterSections[index + 1]
    if (!chapterNumberText || chapterBlock === undefined) continue

    const chapterId = expectedChapterId(Number.parseInt(chapterNumberText, 10))
    const questionSections = chapterBlock.split(/^### Otázka (\d+)\s*$/gm)

    for (let questionIndex = 1; questionIndex < questionSections.length; questionIndex += 2) {
      const questionNumberText = questionSections[questionIndex]
      const questionBlock = questionSections[questionIndex + 1]
      if (!questionNumberText || questionBlock === undefined) continue

      parsedQuestions.push(
        parseQuestionBlock(chapterId, Number.parseInt(questionNumberText, 10), questionBlock)
      )
    }
  }

  return parsedQuestions
}

function buildColabUrl(notebook: string | undefined): string | null {
  if (!notebook) return null

  return `https://colab.research.google.com/github/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${notebook}`
}

function extractProjectMetadata(markdown: string): ProjectMetadata | null {
  const lines = markdown.split(/\r?\n/)
  const projectHeadingIndex = lines.findIndex(line => /^#{1,6}\s+.*projekt/i.test(line))
  if (projectHeadingIndex < 0) return null

  const heading = lines[projectHeadingIndex] ?? ''
  const headingLevel = heading.match(/^(#{1,6})/)?.[1]?.length ?? 6
  const bodyLines: string[] = []

  for (let index = projectHeadingIndex + 1; index < lines.length; index++) {
    const line = lines[index] ?? ''
    const nextHeadingLevel = line.match(/^(#{1,6})\s+/)?.[1]?.length
    if (nextHeadingLevel !== undefined && nextHeadingLevel <= headingLevel) break
    bodyLines.push(line)
  }

  const requirements = bodyLines.join('\n').trim()
  const firstParagraph = requirements
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.replace(/^#{1,6}\s+/gm, '').trim())
    .find(Boolean)

  return {
    title: heading.replace(/^#{1,6}\s+/, '').trim(),
    description: firstParagraph ?? null,
    requirements: requirements || null,
  }
}

function buildChapter(
  manifestEntry: ChapterManifestEntry,
  markdown: string,
  questions: ParsedAssessmentQuestion[]
): CanonicalChapterContent {
  const project =
    extractProjectMetadata(markdown) ??
    (PROJECT_CHAPTER_IDS.has(manifestEntry.id)
      ? {
          title: manifestEntry.title,
          description: manifestEntry.description,
          requirements: markdown,
        }
      : null)

  return {
    chapterId: manifestEntry.id,
    order: manifestEntry.number,
    module: Math.ceil(manifestEntry.number / 5),
    title: manifestEntry.title,
    description: manifestEntry.description,
    difficulty: 'MEDIUM',
    xpReward: 100,
    videoFile: manifestEntry.videoFile ?? null,
    notebookLmUrl: manifestEntry.notebookLMUrl ?? null,
    colabUrl: buildColabUrl(manifestEntry.colabNotebook),
    projectTitle: project?.title ?? null,
    projectDescription: project?.description ?? null,
    projectRequirements: project?.requirements ?? null,
    lesson: {
      sourceKey: canonicalLessonSourceKey(manifestEntry.id),
      order: 1,
      title: manifestEntry.title,
      content: markdown,
      summary: manifestEntry.description,
      xpReward: 100,
      isPublished: true,
      exercises: questions.map(question => ({
        sourceKey: canonicalExerciseSourceKey(manifestEntry.id, question.questionNumber),
        order: question.questionNumber,
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        question: question.questionText,
        data: {
          options: question.options,
          correctIndex: question.correctAnswer,
        },
        explanation: question.explanation,
        hints: [],
        xpReward: 10,
      })),
    },
  }
}

function buildMilestones(): CanonicalMilestoneContent[] {
  return [10, 20, 30, 40].map(order => ({
    sourceKey: `milestone:${order}`,
    chapterId: expectedChapterId(order),
    order,
    title: order === 40 ? 'Závěrečný milník' : `Milník po kapitole ${order}`,
    description:
      order === 40
        ? 'Dokončení všech 40 kapitol a zpřístupnění závěrečného testu.'
        : `Ověření znalostí z kapitol ${order - 9}–${order}.`,
    testRequired: true,
    certificateEligible: order === 40,
    isPublished: true,
  }))
}

export function buildCanonicalCourseContent(repoRoot: string): CanonicalCourseContent {
  const assessmentPath = path.join(repoRoot, 'public', 'prednasky', 'Otazky_Kapitoly_1-40.md')
  const assessments = parseAssessmentMarkdown(fs.readFileSync(assessmentPath, 'utf8'))
  const questionsByChapter = new Map<string, ParsedAssessmentQuestion[]>()

  for (const question of assessments) {
    const chapterQuestions = questionsByChapter.get(question.chapterId) ?? []
    chapterQuestions.push(question)
    questionsByChapter.set(question.chapterId, chapterQuestions)
  }

  const canonicalChapters = chapters.map(chapter => {
    const lecturePath = path.join(repoRoot, 'public', 'prednasky', chapter.lectureFile)
    const markdown = fs.readFileSync(lecturePath, 'utf8')
    const chapterQuestions = questionsByChapter.get(chapter.id) ?? []

    return buildChapter(chapter, markdown, chapterQuestions)
  })

  return {
    chapters: canonicalChapters,
    milestones: buildMilestones(),
  }
}

export function validateCanonicalCourseContent(
  course: CanonicalCourseContent
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = []
  const chapterIds = new Set<string>()
  const lessonKeys = new Set<string>()
  const exerciseKeys = new Set<string>()

  if (course.chapters.length !== EXPECTED_CHAPTER_COUNT) {
    issues.push({
      path: 'chapters',
      message: `očekáváno ${EXPECTED_CHAPTER_COUNT}, nalezeno ${course.chapters.length}`,
    })
  }

  course.chapters.forEach((chapter, index) => {
    const expectedId = expectedChapterId(index + 1)
    const chapterPath = `chapter:${chapter.chapterId}`

    if (chapter.chapterId !== expectedId) {
      issues.push({ path: chapterPath, message: `očekávané ID ${expectedId}` })
    }
    if (chapterIds.has(chapter.chapterId)) {
      issues.push({ path: chapterPath, message: 'duplicitní chapterId' })
    }
    chapterIds.add(chapter.chapterId)

    if (!chapter.lesson.content.trim()) {
      issues.push({ path: `${chapterPath}.lesson.content`, message: 'prázdný Markdown obsah' })
    }
    if (!chapter.lesson.isPublished) {
      issues.push({ path: `${chapterPath}.lesson.isPublished`, message: 'lekce není publikovaná' })
    }
    if (chapter.lesson.sourceKey !== canonicalLessonSourceKey(chapter.chapterId)) {
      issues.push({ path: `${chapterPath}.lesson.sourceKey`, message: 'nestabilní sourceKey' })
    }
    if (lessonKeys.has(chapter.lesson.sourceKey)) {
      issues.push({ path: `${chapterPath}.lesson.sourceKey`, message: 'duplicitní sourceKey' })
    }
    lessonKeys.add(chapter.lesson.sourceKey)

    if (chapter.lesson.exercises.length !== EXPECTED_EXERCISES_PER_CHAPTER) {
      issues.push({
        path: `${chapterPath}.lesson.exercises`,
        message: `očekáváno ${EXPECTED_EXERCISES_PER_CHAPTER}, nalezeno ${chapter.lesson.exercises.length}`,
      })
    }

    chapter.lesson.exercises.forEach((exercise, exerciseIndex) => {
      const expectedOrder = exerciseIndex + 1
      const exercisePath = `${chapterPath}.exercise:${exercise.order}`

      if (exercise.order !== expectedOrder) {
        issues.push({ path: exercisePath, message: `očekávané pořadí ${expectedOrder}` })
      }
      if (exercise.sourceKey !== canonicalExerciseSourceKey(chapter.chapterId, exercise.order)) {
        issues.push({ path: `${exercisePath}.sourceKey`, message: 'nestabilní sourceKey' })
      }
      if (exercise.type !== 'MULTIPLE_CHOICE') {
        issues.push({ path: exercisePath, message: 'exercise musí být MULTIPLE_CHOICE' })
      }
      if (exercise.data.options.length !== 4) {
        issues.push({ path: exercisePath, message: 'exercise musí mít přesně 4 možnosti' })
      }
      if (
        !Number.isInteger(exercise.data.correctIndex) ||
        exercise.data.correctIndex < 0 ||
        exercise.data.correctIndex >= exercise.data.options.length
      ) {
        issues.push({ path: exercisePath, message: 'correctIndex je mimo rozsah možností' })
      }
      if (exerciseKeys.has(exercise.sourceKey)) {
        issues.push({ path: exercisePath, message: 'duplicitní sourceKey' })
      }
      exerciseKeys.add(exercise.sourceKey)
    })

    const shouldHaveVideo = !CHAPTERS_WITHOUT_VIDEO.has(chapter.chapterId)
    if (shouldHaveVideo !== Boolean(chapter.videoFile)) {
      issues.push({ path: `${chapterPath}.videoFile`, message: 'neočekávaná video konfigurace' })
    }
    if (shouldHaveVideo !== Boolean(chapter.notebookLmUrl)) {
      issues.push({
        path: `${chapterPath}.notebookLmUrl`,
        message: 'neočekávaná NotebookLM konfigurace',
      })
    }
    if (!chapter.colabUrl) {
      issues.push({ path: `${chapterPath}.colabUrl`, message: 'chybí Colab zdroj' })
    }
    const shouldHaveProject = PROJECT_CHAPTER_IDS.has(chapter.chapterId)
    if (
      shouldHaveProject !==
      Boolean(chapter.projectTitle && chapter.projectDescription && chapter.projectRequirements)
    ) {
      issues.push({
        path: `${chapterPath}.project`,
        message: 'neočekávaná projektová metadata',
      })
    }

    for (const [field, value, expectedHost] of [
      ['notebookLmUrl', chapter.notebookLmUrl, 'notebooklm.google.com'],
      ['colabUrl', chapter.colabUrl, 'colab.research.google.com'],
    ] as const) {
      if (!value) continue
      try {
        const url = new URL(value)
        if (url.protocol !== 'https:' || url.hostname !== expectedHost) {
          issues.push({ path: `${chapterPath}.${field}`, message: 'neočekávaná externí URL' })
        }
      } catch {
        issues.push({ path: `${chapterPath}.${field}`, message: 'neplatná externí URL' })
      }
    }
  })

  const totalExercises = course.chapters.reduce(
    (total, chapter) => total + chapter.lesson.exercises.length,
    0
  )
  if (totalExercises !== EXPECTED_EXERCISE_COUNT) {
    issues.push({
      path: 'exercises',
      message: `očekáváno ${EXPECTED_EXERCISE_COUNT}, nalezeno ${totalExercises}`,
    })
  }

  const configuredVideos = course.chapters.filter(chapter => chapter.videoFile).length
  if (configuredVideos !== EXPECTED_VIDEO_COUNT) {
    issues.push({
      path: 'videos',
      message: `očekáváno ${EXPECTED_VIDEO_COUNT}, nalezeno ${configuredVideos}`,
    })
  }

  const configuredNotebookLm = course.chapters.filter(chapter => chapter.notebookLmUrl).length
  if (configuredNotebookLm !== EXPECTED_NOTEBOOKLM_COUNT) {
    issues.push({
      path: 'notebookLm',
      message: `očekáváno ${EXPECTED_NOTEBOOKLM_COUNT}, nalezeno ${configuredNotebookLm}`,
    })
  }

  const configuredColab = course.chapters.filter(chapter => chapter.colabUrl).length
  if (configuredColab !== EXPECTED_COLAB_COUNT) {
    issues.push({
      path: 'colab',
      message: `očekáváno ${EXPECTED_COLAB_COUNT}, nalezeno ${configuredColab}`,
    })
  }

  if (
    course.milestones.length !== 4 ||
    course.milestones.some(
      (milestone, index) =>
        milestone.order !== (index + 1) * 10 ||
        milestone.chapterId !== expectedChapterId((index + 1) * 10) ||
        milestone.sourceKey !== `milestone:${(index + 1) * 10}`
    )
  ) {
    issues.push({ path: 'milestones', message: 'očekávány milníky 10, 20, 30 a 40' })
  }

  return issues
}

export function assertCanonicalCourseContent(course: CanonicalCourseContent): void {
  const issues = validateCanonicalCourseContent(course)
  if (issues.length > 0) throw new CourseContentValidationError(issues)
}
