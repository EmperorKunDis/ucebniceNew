import { expect, test, type Page } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb, getTestDb } from './helpers/test-db'

const CHAPTER_ID = '01'
const ANSWER_KEY_FIELDS = new Set([
  'answer',
  'answerkey',
  'correctanswer',
  'correctindex',
  'correctoption',
  'correctpairs',
  'correctvalue',
  'expectedanswer',
  'expectedoutput',
  'istrue',
  'solution',
  'solutions',
])

async function signInTestUser(page: Page, email: string) {
  await page.goto('/auth/signin')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Heslo').fill('Test123!')
  await page.getByRole('button', { name: 'Přihlásit se emailem' }).click()
  await page.waitForURL('**/dashboard')
}

function expectNoAnswerKeys(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAnswerKeys)
    return
  }

  if (typeof value !== 'object' || value === null) return

  for (const [key, nestedValue] of Object.entries(value)) {
    expect(ANSWER_KEY_FIELDS.has(key.toLocaleLowerCase('en-US'))).toBe(false)
    expectNoAnswerKeys(nestedValue)
  }
}

function readCorrectIndex(data: unknown) {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('correctIndex' in data) ||
    typeof data.correctIndex !== 'number'
  ) {
    throw new Error('Canonical multiple-choice exercise is missing correctIndex')
  }

  return data.correctIndex
}

test.describe('Canonical v2 learning flow', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('completes content and all ten exercises exactly once through the UI', async ({ page }) => {
    test.setTimeout(120_000)

    const db = getTestDb()
    const email = 'v2-learning@test.com'
    const user = await createTestUser({
      email,
      username: 'v2learning',
      name: 'V2 Learning User',
      xp: 0,
    })
    const chapter = await db.chapter.findUniqueOrThrow({
      where: { chapterId: CHAPTER_ID },
      select: { id: true },
    })
    const lesson = await db.microLesson.findUniqueOrThrow({
      where: { sourceKey: `lesson:${CHAPTER_ID}` },
      select: {
        id: true,
        title: true,
        xpReward: true,
        exercises: {
          where: { sourceKey: { startsWith: `exercise:${CHAPTER_ID}:` } },
          orderBy: { order: 'asc' },
          select: { id: true, question: true, data: true, xpReward: true },
        },
      },
    })

    expect(lesson.exercises).toHaveLength(10)

    const runtimeErrors: string[] = []
    page.on('pageerror', error => runtimeErrors.push(error.message))
    page.on('console', message => {
      if (
        message.type() === 'error' &&
        /hydration|server html|did not match|uncaught/i.test(message.text())
      ) {
        runtimeErrors.push(message.text())
      }
    })

    await signInTestUser(page, email)
    await expect(page.getByRole('contentinfo')).toHaveCount(0)

    await page.locator(`[data-chapter="${CHAPTER_ID}"]`).click()
    await page.waitForURL(`**/learn/${CHAPTER_ID}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toHaveCount(0)

    const lessonResponsePromise = page.waitForResponse(
      response =>
        response.url().includes(`/api/micro-lessons/lesson/${lesson.id}`) &&
        response.request().method() === 'GET' &&
        response.status() === 200
    )
    await page.locator(`a[href="/learn/${CHAPTER_ID}/lesson/${lesson.id}"]`).click()
    await page.waitForURL(`**/learn/${CHAPTER_ID}/lesson/${lesson.id}`)

    const lessonPayload = await (await lessonResponsePromise).json()
    expectNoAnswerKeys(lessonPayload)
    await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pokračovat na cvičení' })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toHaveCount(0)

    await page.getByRole('button', { name: 'Pokračovat na cvičení' }).click()

    for (const exercise of lesson.exercises) {
      await expect(
        page.getByRole('heading', { level: 3, name: exercise.question, exact: true })
      ).toBeVisible()

      const answerGroup = page.getByRole('group', { name: 'Možnosti odpovědi' })
      await answerGroup.getByRole('button').nth(readCorrectIndex(exercise.data)).click()
      await expect(page.getByText('Správně!', { exact: true })).toBeVisible()
      await page.getByRole('button', { name: 'Pokračovat', exact: true }).click()
    }

    await expect(page.getByRole('heading', { level: 1, name: 'Lekce dokončena!' })).toBeVisible()
    await expect(page.getByText('10/10', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 3, name: 'Odevzdej svůj projekt' })
    ).toBeVisible()
    expect(runtimeErrors).toEqual([])

    const [progress, lessonProgress, exerciseProgress, attempts, rewards, updatedUser] =
      await Promise.all([
        db.chapterProgress.findUniqueOrThrow({
          where: { userId_chapterId: { userId: user.id, chapterId: chapter.id } },
        }),
        db.microLessonProgress.findUniqueOrThrow({
          where: { userId_microLessonId: { userId: user.id, microLessonId: lesson.id } },
        }),
        db.exerciseProgress.findMany({ where: { userId: user.id, completed: true } }),
        db.exerciseAttempt.findMany({ where: { userId: user.id } }),
        db.rewardLedger.findMany({ where: { userId: user.id } }),
        db.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true } }),
      ])

    expect(lessonProgress.completed).toBe(true)
    expect(exerciseProgress).toHaveLength(10)
    expect(attempts).toHaveLength(10)
    const learningRewards = rewards.filter(reward =>
      ['LESSON_COMPLETE', 'EXERCISE_CORRECT'].includes(reward.sourceType)
    )
    expect(learningRewards).toHaveLength(11)
    expect(new Set(rewards.map(reward => reward.dedupeKey)).size).toBe(rewards.length)
    expect(progress).toMatchObject({
      contentCompleted: true,
      exercisesCompleted: true,
      projectApproved: false,
      exercisesCorrect: 10,
      exercisesTotal: 10,
      stars: 2,
    })

    const learningXp = learningRewards.reduce((sum, reward) => sum + reward.xpAmount, 0)
    expect(learningXp).toBe(
      lesson.xpReward + lesson.exercises.reduce((sum, exercise) => sum + exercise.xpReward, 0)
    )
    expect(updatedUser.xp).toBe(rewards.reduce((sum, reward) => sum + reward.xpAmount, 0))
  })
})
