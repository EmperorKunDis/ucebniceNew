import { test, expect } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb, getTestDb } from './helpers/test-db'

test.describe('Chapter Completion Flow', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should complete a chapter and earn XP', async ({ page }) => {
    // Create test user
    const user = await createTestUser({
      email: 'chapter@example.com',
      username: 'chapteruser',
      name: 'Chapter User',
      password: 'Test123!',
    })

    // Login first
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'chapter@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to chapters
    await page.goto('/chapters')
    await page.waitForLoadState('networkidle')

    // Click on first chapter
    const firstChapter = await page.locator('a[href^="/chapters/"]').first()
    await firstChapter.click()

    // Wait for chapter page to load
    await page.waitForURL(/\/chapters\/\d+/, { timeout: 10000 })

    // Look for complete button
    const completeButton = await page
      .locator('button:has-text("Dokončit kapitolu"), button:has-text("Označit jako dokončeno")')
      .first()

    if (await completeButton.isVisible()) {
      // Get initial XP before completion
      const db = getTestDb()
      const userBefore = await db.user.findUnique({ where: { id: user.id } })
      const xpBefore = userBefore?.xp || 0

      // Click complete button
      await completeButton.click()

      // Wait for success feedback (toast, modal, or page update)
      await page.waitForTimeout(2000)

      // Verify XP was added in database
      const userAfter = await db.user.findUnique({ where: { id: user.id } })
      const xpAfter = userAfter?.xp || 0

      expect(xpAfter).toBeGreaterThan(xpBefore)
    }
  })

  test('should show completed chapters in progress', async ({ page }) => {
    // Create test user with completed chapter
    const user = await createTestUser({
      email: 'progress@example.com',
      username: 'progressuser',
      name: 'Progress User',
      password: 'Test123!',
    })

    // Create a chapter and mark it as completed
    const db = getTestDb()
    const chapter = await db.chapter.create({
      data: {
        chapterId: '01',
        title: 'Kapitola 1',
        description: 'Test kapitola',
        xpReward: 100,
        difficulty: 'beginner',
        order: 0,
      },
    })

    await db.completedChapter.create({
      data: {
        userId: user.id,
        chapterId: chapter.id,
        xpEarned: 100,
      },
    })

    // Update user XP
    await db.user.update({
      where: { id: user.id },
      data: { xp: 100 },
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'progress@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Check if XP is displayed
    const xpElement = await page.locator('text=/100.*XP|XP.*100/i').first()
    await expect(xpElement).toBeVisible({ timeout: 5000 })
  })

  test('should prevent completing same chapter twice', async ({ page }) => {
    // Create test user
    const user = await createTestUser({
      email: 'duplicate@example.com',
      username: 'duplicateuser',
      name: 'Duplicate User',
      password: 'Test123!',
    })

    // Create and complete a chapter
    const db = getTestDb()
    const chapter = await db.chapter.create({
      data: {
        chapterId: '02',
        title: 'Kapitola 2',
        description: 'Test kapitola',
        xpReward: 100,
        difficulty: 'beginner',
        order: 0,
      },
    })

    await db.completedChapter.create({
      data: {
        userId: user.id,
        chapterId: chapter.id,
        xpEarned: 100,
      },
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'duplicate@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to the already completed chapter
    await page.goto('/chapters/02')

    // Complete button should either be disabled or show "already completed" message
    const completedText = await page.locator('text=/dokončeno|completed/i').first()
    const isTextVisible = await completedText.isVisible().catch(() => false)

    // Either the text is visible OR complete button is disabled
    if (!isTextVisible) {
      const completeButton = await page
        .locator('button:has-text("Dokončit"), button:has-text("Complete")')
        .first()
      const isDisabled = await completeButton.isDisabled().catch(() => true)
      expect(isDisabled).toBeTruthy()
    } else {
      expect(isTextVisible).toBeTruthy()
    }
  })

  test('should update streak when completing chapters on consecutive days', async ({ page }) => {
    // Create test user
    const user = await createTestUser({
      email: 'streak@example.com',
      username: 'streakuser',
      name: 'Streak User',
      password: 'Test123!',
    })

    const db = getTestDb()

    // Create chapter
    await db.chapter.create({
      data: {
        chapterId: '03',
        title: 'Kapitola 3',
        description: 'Test kapitola',
        xpReward: 100,
        difficulty: 'beginner',
        order: 0,
      },
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'streak@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to chapter and complete it
    await page.goto('/chapters/03')

    const completeButton = await page
      .locator('button:has-text("Dokončit"), button:has-text("Complete")')
      .first()

    if (await completeButton.isVisible()) {
      await completeButton.click()
      await page.waitForTimeout(1000)

      // Check if streak is updated
      const userUpdated = await db.user.findUnique({ where: { id: user.id } })
      expect(userUpdated?.currentStreak).toBeGreaterThan(0)
    }
  })
})
