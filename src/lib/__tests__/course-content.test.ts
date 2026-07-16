import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildCanonicalCourseContent,
  EXPECTED_CHAPTER_COUNT,
  EXPECTED_COLAB_COUNT,
  EXPECTED_EXERCISE_COUNT,
  EXPECTED_NOTEBOOKLM_COUNT,
  EXPECTED_VIDEO_COUNT,
  parseAssessmentMarkdown,
  validateCanonicalCourseContent,
} from '../course-content'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

describe('canonical course content', () => {
  it('parses exactly 40 chapters with 10 answer-keyed questions each', () => {
    const markdown = fs.readFileSync(
      path.join(repoRoot, 'public/prednasky/Otazky_Kapitoly_1-40.md'),
      'utf8'
    )
    const questions = parseAssessmentMarkdown(markdown)

    expect(questions).toHaveLength(EXPECTED_EXERCISE_COUNT)
    expect(
      questions.find(question => question.chapterId === '13' && question.questionNumber === 10)
        ?.questionText
    ).toBe('IDA* (Iterative Deepening A) je varianta A* která:')
    for (let chapterNumber = 1; chapterNumber <= EXPECTED_CHAPTER_COUNT; chapterNumber++) {
      const chapterId = String(chapterNumber).padStart(2, '0')
      const chapterQuestions = questions.filter(question => question.chapterId === chapterId)
      expect(chapterQuestions).toHaveLength(10)
      expect(chapterQuestions.map(question => question.questionNumber)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
      chapterQuestions.forEach(question => {
        expect(question.options).toHaveLength(4)
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(question.correctAnswer).toBeLessThan(4)
      })
    }
  })

  it('builds deterministic full lessons, exercises, resources, and milestones', () => {
    const first = buildCanonicalCourseContent(repoRoot)
    const second = buildCanonicalCourseContent(repoRoot)

    expect(second).toEqual(first)
    expect(validateCanonicalCourseContent(first)).toEqual([])
    expect(first.chapters).toHaveLength(EXPECTED_CHAPTER_COUNT)
    expect(first.chapters.filter(chapter => chapter.videoFile)).toHaveLength(EXPECTED_VIDEO_COUNT)
    expect(first.chapters.filter(chapter => chapter.notebookLmUrl)).toHaveLength(
      EXPECTED_NOTEBOOKLM_COUNT
    )
    expect(first.chapters.filter(chapter => chapter.colabUrl)).toHaveLength(EXPECTED_COLAB_COUNT)
    expect(first.milestones.map(milestone => milestone.order)).toEqual([10, 20, 30, 40])

    for (const chapter of first.chapters) {
      expect(chapter.lesson.sourceKey).toBe(`lesson:${chapter.chapterId}`)
      expect(chapter.lesson.content.trim().length).toBeGreaterThan(0)
      expect(chapter.lesson.isPublished).toBe(true)
      expect(chapter.lesson.exercises).toHaveLength(10)
      chapter.lesson.exercises.forEach((exercise, index) => {
        expect(exercise.sourceKey).toBe(
          `exercise:${chapter.chapterId}:${String(index + 1).padStart(2, '0')}`
        )
        expect(exercise.type).toBe('MULTIPLE_CHOICE')
      })
    }

    expect(first.chapters.find(chapter => chapter.chapterId === '09')?.videoFile).toBeNull()
    expect(first.chapters.find(chapter => chapter.chapterId === '10')?.videoFile).toBeNull()
    expect(
      first.chapters.filter(chapter => chapter.projectTitle).map(chapter => chapter.chapterId)
    ).toEqual(['09', '15', '34', '35'])
    for (const projectChapterId of ['09', '15', '34', '35']) {
      const projectChapter = first.chapters.find(chapter => chapter.chapterId === projectChapterId)
      expect(projectChapter?.projectTitle).toMatch(/projekt/i)
      expect(projectChapter?.projectDescription).toBeTruthy()
      expect(projectChapter?.projectRequirements).toBeTruthy()
    }
  })
})
