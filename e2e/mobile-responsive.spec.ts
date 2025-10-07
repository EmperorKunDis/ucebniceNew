import { test, expect, devices } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb } from './helpers/test-db'

test.describe('Mobile Responsive Tests', () => {
  test.beforeEach(async () => {
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should display mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size

    await page.goto('/')

    // Mobile menu button should be visible
    const menuButton = await page.locator('button:has(svg), button[aria-label*="menu" i]').first()
    await expect(menuButton).toBeVisible({ timeout: 5000 })

    // Desktop navigation should be hidden
    const desktopNav = await page.locator('nav >> text=Kapitoly').first()
    const isDesktopNavHidden = await desktopNav.isHidden().catch(() => true)
    expect(isDesktopNavHidden).toBeTruthy()
  })

  test('should open and close mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Click menu button to open
    const menuButton = await page.locator('button:has(svg), button[aria-label*="menu" i]').first()
    await menuButton.click()

    // Wait for menu to appear
    await page.waitForTimeout(500)

    // Menu items should be visible
    const menuItem = await page.locator('text=Kapitoly, text=Dashboard, text=Profil').first()
    await expect(menuItem).toBeVisible({ timeout: 3000 })

    // Click to close (might be X button or overlay)
    const closeButton = await page.locator('button:has(svg), button[aria-label*="close" i]').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should display chapters list correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/chapters')
    await page.waitForLoadState('networkidle')

    // Chapter cards should be stacked vertically
    const chapterCards = await page.locator('[href^="/chapters/"]')
    const count = await chapterCards.count()

    expect(count).toBeGreaterThan(0)

    // Verify cards are properly sized for mobile
    if (count > 0) {
      const firstCard = chapterCards.first()
      const box = await firstCard.boundingBox()

      if (box) {
        // Card should take most of screen width (with some padding)
        expect(box.width).toBeGreaterThan(300)
        expect(box.width).toBeLessThan(375)
      }
    }
  })

  test('should login successfully on mobile device', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Create test user
    await createTestUser({
      email: 'mobile@example.com',
      username: 'mobileuser',
      name: 'Mobile User',
      password: 'Test123!',
    })

    await page.goto('/auth/signin')

    // Fill login form on mobile
    await page.fill('input[type="email"]', 'mobile@example.com')
    await page.fill('input[type="password"]', 'Test123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should navigate to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('should be usable on tablet portrait', async ({ page }) => {
    // iPad mini size
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/')

    // Navigation should be visible or accessible
    const navElement = await page.locator('nav').first()
    await expect(navElement).toBeVisible({ timeout: 5000 })

    // Content should fit properly
    const mainContent = await page.locator('main, [role="main"]').first()
    const box = await mainContent.boundingBox()

    if (box) {
      expect(box.width).toBeLessThanOrEqual(768)
    }
  })

  test('should be usable on tablet landscape', async ({ page }) => {
    // iPad landscape
    await page.setViewportSize({ width: 1024, height: 768 })

    await page.goto('/')

    // Desktop navigation should be visible on landscape tablet
    const navElement = await page.locator('nav').first()
    await expect(navElement).toBeVisible({ timeout: 5000 })
  })

  test('should display profile correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Create test user
    await createTestUser({
      email: 'profile-mobile@example.com',
      username: 'profilemobile',
      name: 'Profile Mobile',
      password: 'Test123!',
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'profile-mobile@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Profile content should be visible
    const profileContent = await page.locator('text=Profile Mobile, text=profilemobile').first()
    await expect(profileContent).toBeVisible({ timeout: 5000 })
  })

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/chapters')
    await page.waitForLoadState('networkidle')

    // Tap on first chapter (mobile touch)
    const firstChapter = await page.locator('a[href^="/chapters/"]').first()

    if (await firstChapter.isVisible()) {
      // Simulate mobile tap
      await firstChapter.tap()

      // Should navigate to chapter page
      await page.waitForURL(/\/chapters\/\d+/, { timeout: 10000 })
      expect(page.url()).toMatch(/\/chapters\/\d+/)
    }
  })

  test('should display achievement cards responsively on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Create test user
    await createTestUser({
      email: 'achievement-mobile@example.com',
      username: 'achievementmobile',
      name: 'Achievement Mobile',
      password: 'Test123!',
    })

    // Login
    await page.goto('/auth/signin')
    await page.fill('input[type="email"]', 'achievement-mobile@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to achievements page
    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    // Achievement grid should be visible
    const achievementContainer = await page.locator('main, [role="main"]').first()
    await expect(achievementContainer).toBeVisible({ timeout: 5000 })

    // Check if content fits in viewport
    const box = await achievementContainer.boundingBox()
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375)
    }
  })

  test('should navigate properly on small mobile device', async ({ page }) => {
    // Very small device (iPhone SE 1st gen)
    await page.setViewportSize({ width: 320, height: 568 })

    await page.goto('/')

    // Should still be functional
    const content = await page.locator('body').first()
    await expect(content).toBeVisible()

    // Navigation should work
    await page.goto('/chapters')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/chapters')
  })
})
