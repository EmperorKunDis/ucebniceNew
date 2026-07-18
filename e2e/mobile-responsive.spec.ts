import { expect, test, type Page } from '@playwright/test'
import { cleanupTestDb, createTestUser, disconnectTestDb } from './helpers/test-db'

const MOBILE_VIEWPORT = { width: 375, height: 667 }

async function useAnonymousSession(page: Page) {
  await page.route('**/api/auth/session', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  )
}

async function signInWithCredentials(page: Page, email: string) {
  await page.goto('/auth/signin')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Heslo').fill('Test123!')
  await page.getByRole('button', { name: 'Přihlásit se emailem' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test.describe('Public responsive shell', () => {
  test.beforeEach(async ({ page }) => {
    await useAnonymousSession(page)
  })

  test('should display only the mobile menu trigger on small screens', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)

    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Hlavní navigace' })).toBeHidden()
  })

  test('should open and close mobile menu', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)

    await page.goto('/')

    const openButton = page.getByRole('button', { name: 'Otevřít hlavní navigaci' })
    await openButton.click()

    const mobileNavigation = page.getByRole('navigation', { name: 'Mobilní navigace' })
    await expect(mobileNavigation).toBeVisible()
    await expect(mobileNavigation.getByRole('link', { name: 'Kurz', exact: true })).toBeVisible()
    await expect(mobileNavigation.getByRole('link', { name: 'Apex Aréna' })).toBeVisible()
    await expect(mobileNavigation.getByRole('link', { name: 'Žebříček' })).toBeVisible()

    const closeButton = page.getByRole('button', { name: 'Zavřít hlavní navigaci' })
    await expect(closeButton).toHaveAttribute('aria-expanded', 'true')
    await closeButton.click()
    await expect(mobileNavigation).toBeHidden()
    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  test('should preserve the permanent chapters redirect on mobile clients', async ({ request }) => {
    const response = await request.get('/chapters', { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe('/dashboard')
  })

  test('should be usable on tablet portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toBeVisible()
    const mainContent = page.getByRole('main')
    await expect(mainContent).toBeVisible()
    const box = await mainContent.boundingBox()

    expect(box).not.toBeNull()
    expect(box!.width).toBeLessThanOrEqual(768)
  })

  test('should be usable on tablet landscape', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })

    await page.goto('/')

    await expect(page.getByRole('navigation', { name: 'Hlavní navigace' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toBeHidden()
  })

  test('should expose the canonical course link in the touch menu', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)

    await page.goto('/')
    await page.getByRole('button', { name: 'Otevřít hlavní navigaci' }).click()

    const mobileNavigation = page.getByRole('navigation', { name: 'Mobilní navigace' })
    await expect(mobileNavigation.getByRole('link', { name: 'Kurz', exact: true })).toHaveAttribute(
      'href',
      '/dashboard'
    )
  })

  test('should navigate properly on small mobile device', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })

    await page.goto('/')

    await expect(page.getByRole('main')).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Nauč se programovat AI. A programovat s AI.',
      })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toBeVisible()
  })
})

test.describe('Authenticated mobile flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await cleanupTestDb()
  })

  test.afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  test('should login successfully on mobile device', async ({ page }) => {
    await createTestUser({
      email: 'mobile@example.com',
      username: 'mobileuser',
      name: 'Mobile User',
      password: 'Test123!',
    })

    await signInWithCredentials(page, 'mobile@example.com')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should display profile correctly on mobile', async ({ page }) => {
    await createTestUser({
      email: 'profile-mobile@example.com',
      username: 'profilemobile',
      name: 'Profile Mobile',
      password: 'Test123!',
    })

    await signInWithCredentials(page, 'profile-mobile@example.com')
    await page.goto('/profile')

    await expect(page.getByRole('heading', { level: 1, name: 'Profile Mobile' })).toBeVisible()
    await expect(page.getByText('@profilemobile', { exact: true })).toBeVisible()
  })

  test('should display achievement cards responsively on mobile', async ({ page }) => {
    await createTestUser({
      email: 'achievement-mobile@example.com',
      username: 'achievementmobile',
      name: 'Achievement Mobile',
      password: 'Test123!',
    })

    await signInWithCredentials(page, 'achievement-mobile@example.com')
    await page.goto('/achievements')

    await expect(page.getByRole('heading', { name: 'Úspěchy a odznaky' })).toBeVisible()
    const achievementContainer = page.getByRole('main')
    await expect(achievementContainer).toBeVisible()

    const box = await achievementContainer.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width)
  })
})
