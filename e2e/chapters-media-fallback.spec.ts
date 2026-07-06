import { expect, test } from '@playwright/test'

test.describe('Chapter media fallback', () => {
  for (const chapter of [
    { id: '09', title: 'Mini projekt' },
    { id: '10', title: 'Shrnutí a opakování' },
  ]) {
    test(`shows intentional no-video copy for chapter ${chapter.id}`, async ({ page }) => {
      await page.goto(`/chapters/${chapter.id}`)

      await expect(page.getByRole('heading', { name: chapter.title })).toBeVisible()
      await expect(page.getByRole('button', { name: /Video přednáška/ })).toBeVisible()
      await expect(page.getByText('Tato kapitola nemá samostatné video.')).toBeVisible()
      await expect(page.getByText(/Absence videa je u této kapitoly záměrná/)).toBeVisible()
      await expect(page.getByText('Kompletní přednáška')).toBeVisible()
    })
  }
})
