import { expect, test } from '@playwright/test'

test.describe('Chapters navigation smoke audit', () => {
  test('lists chapters and opens a matching chapter detail', async ({ page }) => {
    await page.route('**/api/chapters/all-progress', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ progress: {} }),
      })
    )

    await page.goto('/chapters')

    await expect(page.getByRole('heading', { name: 'Kapitoly kurzu' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Modul 1: Úvod do umělé inteligence' })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /Kapitola 01/ })).toContainText(
      'Co je umělá inteligence?'
    )
    await expect(page.getByText('02. Historie AI')).toBeVisible()
    await expect(page.getByText('Dokončete předchozí kapitolu').first()).toBeVisible()

    await page.getByRole('link', { name: /Kapitola 01/ }).click()

    await expect(page).toHaveURL(/\/chapters\/01$/)
    await expect(page.getByRole('heading', { name: 'Co je umělá inteligence?' })).toBeVisible()
    await expect(page.getByText('Kapitola 1')).toBeVisible()
    await expect(page.getByText('Kompletní přednáška')).toBeVisible()
    await expect(page.getByRole('button', { name: /Seznam kapitol/ })).toBeVisible()
  })

  test('keeps next navigation locked until the current chapter is complete', async ({ page }) => {
    await page.route('**/api/chapters/progress?chapterId=01', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completed: false }),
      })
    )

    await page.goto('/chapters/01')

    const nextChapter = page.getByRole('button', { name: /Zamčená kapitola\s+2\. Historie AI/ })
    await expect(nextChapter).toBeVisible()
    await expect(nextChapter).toBeDisabled()
  })

  test('unlocks previous and next navigation when chapter progress allows it', async ({ page }) => {
    await page.route('**/api/chapters/progress?chapterId=02', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completed: true }),
      })
    )

    await page.goto('/chapters/02')

    await expect(page.getByRole('heading', { name: 'Historie AI' })).toBeVisible()

    await page
      .getByRole('button', { name: /Předchozí kapitola\s+1\. Co je umělá inteligence\?/ })
      .click()
    await expect(page).toHaveURL(/\/chapters\/01$/)

    await page.goto('/chapters/02')
    const nextChapter = page.getByRole('button', { name: /Další kapitola\s+3\. Budoucnost AI/ })
    await expect(nextChapter).toBeEnabled()

    await nextChapter.click()
    await expect(page).toHaveURL(/\/chapters\/03$/)
    await expect(page.getByRole('heading', { name: 'Budoucnost AI' })).toBeVisible()
  })

  test('links the final chapter navigation to the certificate flow', async ({ page }) => {
    await page.route('**/api/chapters/progress?chapterId=40', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completed: true }),
      })
    )

    await page.goto('/chapters/40')

    await expect(page.getByRole('heading', { name: 'Závěr a reflexe' })).toBeVisible()
    await page.getByRole('button', { name: /Získat certifikát/ }).click()
    await expect(page).toHaveURL(/\/certificate$/)
  })

  test('returns not found for unknown chapter IDs', async ({ page }) => {
    const response = await page.goto('/chapters/999')

    expect(response?.status()).toBe(404)
  })
})
