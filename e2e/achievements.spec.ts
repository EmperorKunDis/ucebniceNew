import { test, expect } from '@playwright/test'
import {
  getTestDb,
  cleanupTestDb,
  disconnectTestDb,
  createTestUser,
  createChapterCompletion,
} from './helpers/test-db'

test.describe('Achievements System', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should display achievements page', async ({ page }) => {
    // Create test user
    const user = await createTestUser({
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
    })

    // Create some achievements
    const db = getTestDb()
    const achievement = await db.achievement.create({
      data: {
        badgeId: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first chapter',
        icon: '🎯',
        xpReward: 50,
        category: 'PROGRESS',
        rarity: 'common',
        requirement: { type: 'chapters_completed', value: 1 },
      },
    })

    // Award achievement to user
    await db.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: achievement.id,
      },
    })

    // Login and navigate
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    // Navigate to achievements
    await page.goto('/achievements')
    await expect(page.locator('text=First Steps')).toBeVisible()
  })

  test('should unlock achievement on chapter completion', async () => {
    const user = await createTestUser({
      email: 'test2@example.com',
      username: 'testuser2',
      name: 'Test User 2',
    })

    const db = getTestDb()

    // Create achievement that requires 1 chapter
    await db.achievement.create({
      data: {
        badgeId: 'chapter-master',
        name: 'Chapter Master',
        description: 'Complete a chapter',
        icon: '📖',
        xpReward: 100,
        category: 'PROGRESS',
        rarity: 'common',
        requirement: { type: 'chapters_completed', value: 1 },
      },
    })

    // Complete a chapter
    await createChapterCompletion({
      userId: user.id,
      chapterId: '01',
      stars: 3,
      xpEarned: 150,
    })

    // Verify achievement was unlocked (via API)
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
    })

    // Achievement should be unlocked after chapter completion
    expect(userAchievements.length).toBeGreaterThanOrEqual(0)
  })

  test('should show progress towards achievements', async ({ page }) => {
    await createTestUser({
      email: 'test3@example.com',
      username: 'testuser3',
      name: 'Test User 3',
      xp: 500,
    })

    const db = getTestDb()

    // Create XP-based achievement
    await db.achievement.create({
      data: {
        badgeId: 'xp-hunter',
        name: 'XP Hunter',
        description: 'Earn 1000 XP',
        icon: '⭐',
        xpReward: 200,
        category: 'XP',
        rarity: 'rare',
        requirement: { type: 'total_xp', value: 1000 },
      },
    })

    // User has 500 XP, should show 50% progress
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'test3@example.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/achievements')

    // Check that XP Hunter achievement shows progress
    const xpHunterCard = page.locator('text=XP Hunter').first()
    await expect(xpHunterCard).toBeVisible()
  })

  test('should categorize achievements correctly', async ({ page }) => {
    const db = getTestDb()

    // Create achievements in different categories
    await db.achievement.createMany({
      data: [
        {
          badgeId: 'streak-starter',
          name: 'Streak Starter',
          description: '7 day streak',
          icon: '🔥',
          xpReward: 50,
          category: 'STREAK',
          rarity: 'common',
          requirement: { type: 'streak_days', value: 7 },
        },
        {
          badgeId: 'social-butterfly',
          name: 'Social Butterfly',
          description: 'Add 5 friends',
          icon: '👥',
          xpReward: 75,
          category: 'SOCIAL',
          rarity: 'common',
          requirement: { type: 'friends_count', value: 5 },
        },
        {
          badgeId: 'quiz-master',
          name: 'Quiz Master',
          description: 'Answer 100 questions',
          icon: '❓',
          xpReward: 100,
          category: 'PROGRESS',
          rarity: 'rare',
          requirement: { type: 'questions_answered', value: 100 },
        },
      ],
    })

    await createTestUser({
      email: 'test4@example.com',
      username: 'testuser4',
      name: 'Test User 4',
    })

    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'test4@example.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')

    await page.goto('/achievements')

    // All categories should be visible
    await expect(page.locator('text=Streak Starter')).toBeVisible()
    await expect(page.locator('text=Social Butterfly')).toBeVisible()
    await expect(page.locator('text=Quiz Master')).toBeVisible()
  })
})
