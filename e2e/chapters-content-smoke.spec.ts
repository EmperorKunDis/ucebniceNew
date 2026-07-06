import { expect, test } from '@playwright/test'
import { chapters } from '../src/data/chapters'

test.describe('Chapter content smoke audit', () => {
  test('renders media and lecture sections for every configured chapter', async ({ page }) => {
    await page.route('**/api/chapters/progress?chapterId=*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completed: false }),
      })
    )
    await page.route('**/api/questions?chapterId=*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ questions: [] }),
      })
    )

    for (const chapter of chapters) {
      await test.step(`chapter ${chapter.id}`, async () => {
        await page.goto(`/chapters/${chapter.id}`)

        await expect(page).toHaveURL(new RegExp(`/chapters/${chapter.id}$`))
        await expect(page.getByRole('heading', { name: chapter.title })).toBeVisible()
        await expect(page.getByText(`Kapitola ${chapter.number}`)).toBeVisible()
        await expect(page.getByText('Interaktivní materiály')).toBeVisible()
        await expect(page.getByRole('button', { name: /Kompletní přednáška/ })).toBeVisible()

        const videoSection = page.getByRole('button', { name: /Video přednáška/ })
        await expect(videoSection).toBeVisible()

        if (chapter.videoFile) {
          await expect(page.locator('video source')).toHaveAttribute(
            'src',
            `/api/video/${encodeURIComponent(chapter.videoFile)}`
          )
          await expect(page.getByText('Tato kapitola nemá samostatné video.')).toBeHidden()
        } else {
          await expect(page.locator('video')).toHaveCount(0)
          await expect(page.getByText('Tato kapitola nemá samostatné video.')).toBeVisible()
        }

        if (chapter.notebookLMUrl) {
          await expect(page.getByRole('link', { name: /NotebookLM sešit/ })).toHaveAttribute(
            'href',
            chapter.notebookLMUrl
          )
        }

        if (chapter.colabNotebook) {
          await expect(page.getByRole('link', { name: /Spustit v Colab/ })).toBeVisible()
          await expect(page.getByRole('link', { name: /Stáhnout sešit/ })).toBeVisible()
        }
      })
    }
  })
})
