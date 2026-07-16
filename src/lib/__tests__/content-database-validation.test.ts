import { describe, expect, it, vi } from 'vitest'
import { validateCanonicalDatabaseContent } from '../../../scripts/import-v2-content'
import type { CanonicalCourseContent } from '../course-content'

const course = {
  chapters: [
    {
      chapterId: '01',
      lesson: {
        exercises: Array.from({ length: 10 }, (_, index) => ({ order: index + 1 })),
      },
    },
  ],
  milestones: [],
} as CanonicalCourseContent

describe('canonical database content validation', () => {
  it('accepts exactly ten canonical exercises while preserving DB-only extras', async () => {
    const prisma = {
      microLesson: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'lesson-1',
            sourceKey: 'lesson:01',
            chapterId: '01',
            exercises: [
              ...Array.from({ length: 10 }, (_, index) => ({
                sourceKey: `exercise:01:${String(index + 1).padStart(2, '0')}`,
              })),
              { sourceKey: 'exercise:01:11' },
              { sourceKey: null },
            ],
          },
        ]),
      },
    }

    await expect(validateCanonicalDatabaseContent(prisma as never, course)).resolves.toEqual({
      publishedLessons: 1,
      exercises: 10,
    })
  })

  it('fails when a canonical exercise is missing', async () => {
    const prisma = {
      microLesson: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'lesson-1',
            sourceKey: 'lesson:01',
            chapterId: '01',
            exercises: Array.from({ length: 9 }, (_, index) => ({
              sourceKey: `exercise:01:${String(index + 1).padStart(2, '0')}`,
            })),
          },
        ]),
      },
    }

    await expect(validateCanonicalDatabaseContent(prisma as never, course)).rejects.toThrow(
      'exercise:01:10'
    )
  })
})
