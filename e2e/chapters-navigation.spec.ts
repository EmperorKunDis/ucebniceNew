import { expect, test, type APIRequestContext } from '@playwright/test'

async function expectPermanentRedirect(
  request: APIRequestContext,
  source: string,
  destination: string
) {
  const response = await request.get(source, { maxRedirects: 0 })

  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe(destination)
}

test.describe('Legacy chapter route compatibility', () => {
  test('permanently redirects the chapter list to the v2 dashboard', async ({ request }) => {
    await expectPermanentRedirect(request, '/chapters', '/dashboard')
  })

  test('permanently redirects chapter details to the matching v2 route', async ({ request }) => {
    await expectPermanentRedirect(request, '/chapters/01', '/learn/01')
  })

  test('preserves an arbitrary legacy chapter slug at the redirect boundary', async ({
    request,
  }) => {
    await expectPermanentRedirect(request, '/chapters/unknown-slug', '/learn/unknown-slug')
  })

  test('keeps encoded chapter slugs safe in the redirect destination', async ({ request }) => {
    await expectPermanentRedirect(request, '/chapters/chapter%20one', '/learn/chapter%20one')
  })
})
