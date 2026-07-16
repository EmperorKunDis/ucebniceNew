import { expect, test } from '@playwright/test'
import { chapters } from '../src/data/chapters'

test.describe('All legacy chapter detail URLs', () => {
  test('map every manifest chapter to its canonical v2 lesson path', async ({ request }) => {
    expect(chapters).toHaveLength(40)

    for (const chapter of chapters) {
      await test.step(`chapter ${chapter.id}`, async () => {
        const response = await request.get(`/chapters/${chapter.id}`, { maxRedirects: 0 })

        expect(response.status()).toBe(308)
        expect(response.headers().location).toBe(`/learn/${chapter.id}`)
      })
    }
  })
})
