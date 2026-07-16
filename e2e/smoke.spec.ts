import { expect, test, type Page } from '@playwright/test'

async function isolatePublicPageFromBackendApis(page: Page) {
  const unexpectedApiRequests: string[] = []

  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname

    if (pathname === '/api/auth/session') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
      return
    }

    unexpectedApiRequests.push(pathname)
    await route.fulfill({ status: 503, body: 'Unexpected API request in public smoke test' })
  })

  return unexpectedApiRequests
}

test.describe('Database-independent public Chromium smoke', () => {
  test('should render the public landing shell without backend data', async ({ page }) => {
    const unexpectedApiRequests = await isolatePublicPageFromBackendApis(page)
    const hydrationErrors: string[] = []

    page.on('console', message => {
      if (
        message.type() === 'error' &&
        /hydration|server html|did not match/i.test(message.text())
      ) {
        hydrationErrors.push(message.text())
      }
    })

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /Nauč se programovat/ })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByAltText('Loga partnerů Učebnice AI')).toBeVisible()
    expect(unexpectedApiRequests).toEqual([])
    expect(hydrationErrors).toEqual([])
  })

  test('should expose the mobile navigation to keyboard users', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await isolatePublicPageFromBackendApis(page)
    // Keyboard behavior is a hydrated client interaction. Waiting for the
    // public shell to go idle avoids testing a key press before React has
    // attached the button handler.
    await page.goto('/', { waitUntil: 'networkidle' })

    const skipLink = page.getByRole('link', { name: 'Přeskočit na obsah' })
    const homeLink = page.getByRole('link', { name: 'Učebnice AI – domů' })
    const menuButton = page.getByRole('button', { name: 'Otevřít hlavní navigaci' })

    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(homeLink).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(menuButton).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Zavřít hlavní navigaci' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )

    const mobileNavigation = page.getByRole('navigation', { name: 'Mobilní navigace' })
    await expect(mobileNavigation).toBeVisible()
    await expect(mobileNavigation.getByRole('link', { name: 'Kurz' })).toHaveAttribute(
      'href',
      '/dashboard'
    )

    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Otevřít hlavní navigaci' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    await expect(mobileNavigation).toBeHidden()
  })

  test('should return permanent legacy chapter redirects without following them', async ({
    request,
  }) => {
    const listResponse = await request.get('/chapters', { maxRedirects: 0 })
    const detailResponse = await request.get('/chapters/01', { maxRedirects: 0 })

    expect(listResponse.status()).toBe(308)
    expect(listResponse.headers().location).toBe('/dashboard')
    expect(detailResponse.status()).toBe(308)
    expect(detailResponse.headers().location).toBe('/learn/01')
  })
})
