import { test, expect } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb } from './helpers/test-db'

test.describe('Authentication Flow', () => {
  test.beforeEach(async () => {
    // Clean database before each test
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    // Cleanup and disconnect
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should successfully register a new user', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'testuser@example.com')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'Test123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard or success
    await page.waitForURL(/\/(dashboard|auth\/signin)/, { timeout: 10000 })

    // Should redirect to sign in or dashboard
    const currentUrl = page.url()
    expect(currentUrl.includes('/dashboard') || currentUrl.includes('/auth/signin')).toBeTruthy()
  })

  test('should successfully login with credentials', async ({ page }) => {
    // Create test user
    await createTestUser({
      email: 'login@example.com',
      username: 'loginuser',
      name: 'Login User',
      password: 'Test123!',
    })

    await page.goto('/auth/signin')

    // Fill login form
    await page.fill('input[type="email"]', 'login@example.com')
    await page.fill('input[type="password"]', 'Test123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard')

    // Check if user info is displayed
    const userElement = await page.locator('text=Login User').first()
    await expect(userElement).toBeVisible({ timeout: 5000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'WrongPassword123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('text=/Nesprávný email nebo heslo/i', {
      timeout: 5000,
    })

    // Verify error is shown
    const errorElement = await page.locator('text=/Nesprávný email nebo heslo/i')
    await expect(errorElement).toBeVisible()
  })

  test('should show validation error for empty fields', async ({ page }) => {
    await page.goto('/auth/signin')

    // Try to submit without filling fields
    await page.click('button[type="submit"]')

    // HTML5 validation should prevent submission
    // Check if we're still on signin page
    expect(page.url()).toContain('/auth/signin')
  })

  test('should navigate between signin and signup pages', async ({ page }) => {
    await page.goto('/auth/signin')

    // Click on "Zaregistrujte se" link
    await page.click('text=Zaregistrujte se')

    // Should navigate to signup
    await page.waitForURL('/auth/signup', { timeout: 5000 })
    expect(page.url()).toContain('/auth/signup')

    // Go back to signin
    await page.click('text=Přihlaste se')

    // Should navigate back to signin
    await page.waitForURL('/auth/signin', { timeout: 5000 })
    expect(page.url()).toContain('/auth/signin')
  })
})
