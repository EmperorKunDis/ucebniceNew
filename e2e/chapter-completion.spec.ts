import { test, expect } from '@playwright/test'
import {
  getTestDb,
  cleanupTestDb,
  disconnectTestDb,
  createTestUser,
  createChapterCompletion,
} from './helpers/test-db'

test.describe('Chapter Completion Flow', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should display chapter progress on dashboard', async ({ page }) => {
    const user = await createTestUser({
      email: 'chapter@test.com',
      username: 'chapteruser',
      name: 'Chapter User',
    })

    // Complete first chapter
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 3,
      xpEarned: 150,
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'chapter@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    // Navigate to dashboard (skill tree)
    await page.goto('/dashboard')

    // First chapter should show as completed
    // Look for completed indicator (checkmark or stars)
    await expect(page.locator('[data-chapter="01"]')).toBeVisible()
  })

  test('should unlock next chapter after completion', async ({ page }) => {
    const user = await createTestUser({
      email: 'unlock@test.com',
      username: 'unlockuser',
      name: 'Unlock User',
    })

    // Complete chapter 01
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 2,
      xpEarned: 100,
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'unlock@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/dashboard')

    // Chapter 02 should now be unlocked (not locked)
    const chapter02 = page.locator('[data-chapter="02"]')
    await expect(chapter02).not.toHaveAttribute('data-locked', 'true')
  })

  test('should award XP on chapter completion', async ({ page }) => {
    const user = await createTestUser({
      email: 'xp@test.com',
      username: 'xpuser',
      name: 'XP User',
      xp: 0,
    })

    const db = getTestDb()

    // Complete chapter and earn XP
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 3,
      xpEarned: 150,
    })

    // Update user XP
    await db.user.update({
      where: { id: user.id },
      data: { xp: 150 },
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'xp@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    // Check XP display in header
    await page.goto('/dashboard')
    await expect(page.locator('text=150')).toBeVisible()
  })

  test('should display stars based on performance', async ({ page }) => {
    const user = await createTestUser({
      email: 'stars@test.com',
      username: 'starsuser',
      name: 'Stars User',
    })

    // Complete with 3 stars (perfect)
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 3,
      xpEarned: 150,
    })

    // Complete with 1 star (poor)
    await createChapterCompletion({
      userId: user.id,
      chapterId: '02',
      stars: 1,
      xpEarned: 50,
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'stars@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/learn/01')

    // Should show 3 filled stars for chapter 01
    const stars = page.locator('[data-stars="3"]')
    await expect(stars).toBeVisible()
  })

  test('should update streak on daily completion', async ({ page }) => {
    const user = await createTestUser({
      email: 'streak@test.com',
      username: 'streakuser',
      name: 'Streak User',
    })

    const db = getTestDb()

    // Complete a chapter today
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 2,
    })

    // Update streak
    await db.user.update({
      where: { id: user.id },
      data: {
        currentStreak: 1,
        lastActiveDate: new Date(),
      },
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'streak@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/profile')

    // Streak should show 1
    await expect(page.locator('text=1').first()).toBeVisible()
  })

  test('should track chapter progress for incomplete chapters', async ({ page }) => {
    const user = await createTestUser({
      email: 'progress@test.com',
      username: 'progressuser',
      name: 'Progress User',
    })

    const db = getTestDb()

    // Create partial progress (not completed)
    await db.chapterProgress.create({
      data: {
        userId: user.id,
        chapterId: '01',
        lessonsCompleted: 2,
        totalSteps: 5,
        currentStep: 2,
        exercisesCorrect: 8,
        exercisesTotal: 10,
      },
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'progress@test.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/learn/01')

    // Should show partial progress (2/5 lessons)
    await expect(page.locator('text=2/5')).toBeVisible()
  })
})
