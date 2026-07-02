import { test, expect } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb, getTestDb } from './helpers/test-db'

test.describe('Quest Flow', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('loads quests after login and claims a completed XP quest once', async ({ page }) => {
    const user = await createTestUser({
      email: 'quests@example.com',
      username: 'questuser',
      name: 'Quest User',
      password: 'Test123!',
    })

    const db = getTestDb()
    await db.user.update({
      where: { id: user.id },
      data: {
        dailyXP: 100,
      },
    })

    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'quests@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    await page.goto('/quests')
    await expect(page.getByRole('heading', { name: 'Úkoly' })).toBeVisible()
    await expect(page.getByText('XP Sběratel')).toBeVisible()

    const claimButton = page.getByRole('button', { name: 'Claim' }).first()
    await expect(claimButton).toBeVisible()
    await claimButton.click()

    await expect(claimButton).toBeHidden({ timeout: 10000 })

    const userAfterClaim = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { xp: true, gems: true },
    })
    expect(userAfterClaim.xp).toBe(30)
    expect(userAfterClaim.gems).toBe(110)
  })
})
