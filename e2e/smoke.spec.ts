import { expect, test, type Page } from '@playwright/test'

const HERO_TAGS = [
  '40 kapitol a 400 cvičení',
  'Video, NotebookLM a Google Colab',
  'AI Tutor a zpětná vazba k projektům',
  'Gamifikovaná cesta s viditelným progresem',
  'Certifikát a prezentace projektů v Apex Aréně',
]

const FEATURES = [
  {
    id: 'course',
    heading: 'Kompletní kurz AI a programování',
    description:
      '40 navazujících kapitol od základů AI přes algoritmy a machine learning až po neuronové sítě, etiku a budoucnost AI.',
  },
  {
    id: 'multimedia',
    heading: 'Multimediální výuka bez instalace',
    description:
      'Plné textové lekce, 38 videí, 38 NotebookLM zdrojů a 40 praktických Google Colab notebooků.',
  },
  {
    id: 'practice',
    heading: 'Procvičování a praktické projekty',
    description:
      '400 interaktivních testových otázek s vysvětlením a projekty ve vybraných kapitolách, včetně AI zpětné vazby.',
  },
  {
    id: 'path',
    heading: 'Duolingo-style cesta kurzem',
    description:
      'Vizuální skill tree, postupné odemykání kapitol a hvězdičkový progres za obsah, cvičení a schválené projekty.',
  },
  {
    id: 'gamification',
    heading: 'Silná gamifikace',
    description:
      'XP, levely, streaky, srdíčka, gemy, achievementy, denní a týdenní questy, ligy, žebříčky a obchod.',
  },
  {
    id: 'tutor',
    heading: 'AI Tutor a chytré opakování',
    description:
      'Osobní AI pomocník a spaced repetition pro opakování témat, která student potřebuje procvičit.',
  },
  {
    id: 'certificate',
    heading: 'Testy a ověřitelný certifikát',
    description:
      'Milníkové testy, závěrečný test a projekt, PDF certifikát s unikátním veřejně ověřitelným kódem.',
  },
  {
    id: 'arena',
    heading: 'Komunita a Apex Aréna',
    description:
      'Přátelé, hackathony, týmy, prezentace projektů a profily absolventů směrem k firmám a zaměstnavatelům.',
  },
]

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
    const main = page.getByRole('main')
    await expect(main).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Nauč se programovat AI. A programovat s AI.',
      })
    ).toBeVisible()
    await expect(
      main.getByRole('link', { name: 'Začít kurz', exact: true }).first()
    ).toHaveAttribute('href', '/dashboard')
    await expect(main.getByRole('link', { name: 'Prohlédnout obsah' }).first()).toHaveAttribute(
      'href',
      '#obsah'
    )

    for (const tag of HERO_TAGS) {
      await expect(page.getByText(tag, { exact: true })).toBeVisible()
    }

    for (const feature of FEATURES) {
      const panel = page.locator(`[data-story-cue="${feature.id}"]`)
      await expect(panel.locator('h3')).toHaveText(feature.heading)
      await expect(panel).toContainText(feature.description)
    }

    const heroVideo = page.getByTestId('landing-macbook-video')
    await expect(heroVideo).toBeVisible()
    await expect(heroVideo).toHaveAttribute('poster', '/media/landing/ucebnice-scroll-poster.jpg')
    await expect(heroVideo.locator('source')).toHaveCount(3)
    await expect(heroVideo).not.toHaveAttribute('autoplay')
    await expect(heroVideo).not.toHaveAttribute('loop')
    // The lid-opening shot may still be auto-playing right after load; once it
    // finishes, the reel parks on the intro pose and stays paused.
    await expect
      .poll(() => heroVideo.evaluate(video => (video as HTMLVideoElement).paused), {
        timeout: 15_000,
      })
      .toBe(true)
    await expect(page.getByText(/24\/7|GPU zdarma|tisícům studentů|Začít zdarma/)).toHaveCount(0)
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByAltText('Loga partnerů Učebnice AI')).toBeVisible()
    expect(unexpectedApiRequests).toEqual([])
    expect(hydrationErrors).toEqual([])
  })

  test('should scrub the paused MacBook reel forward and backward with native page scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await isolatePublicPageFromBackendApis(page)
    await page.goto('/', { waitUntil: 'networkidle' })

    const heroVideo = page.getByTestId('landing-macbook-video')
    const sceneHeight = 900 - 64
    await expect(heroVideo).toHaveAttribute('data-scrub', 'enabled')

    await page.evaluate(y => {
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, y)
    }, sceneHeight * 4.5)

    // Half-way through a scene is inside the hold window, so the video is
    // pinned to the cue pose and the copy panel is active.
    await expect(page.locator('[data-story-cue="path"]')).toHaveAttribute('data-active', 'true')
    await expect
      .poll(() => heroVideo.evaluate(video => (video as HTMLVideoElement).currentTime))
      .toBeCloseTo(21.2, 1)

    await page.evaluate(y => window.scrollTo(0, y), sceneHeight * 1.5)

    await expect(page.locator('[data-story-cue="course"]')).toHaveAttribute('data-active', 'true')
    await expect
      .poll(() => heroVideo.evaluate(video => (video as HTMLVideoElement).currentTime))
      .toBeCloseTo(10.5, 1)
    expect(await heroVideo.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true)
  })

  test('should respect reduced motion for the MacBook feature reel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await isolatePublicPageFromBackendApis(page)
    await page.goto('/', { waitUntil: 'networkidle' })

    const heroVideo = page.getByTestId('landing-macbook-video')
    await expect(heroVideo).toHaveAttribute('data-motion', 'reduced')
    // Scrubbing stays available: every frame is driven by the user's own
    // scroll, so it does not count as self-playing motion.
    await expect(heroVideo).toHaveAttribute('data-scrub', 'enabled')
    await expect(heroVideo).not.toHaveAttribute('autoplay')

    // The self-playing lid-opening intro is skipped; the reel parks on the
    // intro pose and waits for the user.
    expect(await heroVideo.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true)
    await expect
      .poll(() => heroVideo.evaluate(video => (video as HTMLVideoElement).currentTime))
      .toBeCloseTo(5.9, 1)

    // Scroll still scrubs the reel to the cue pose, with playback paused.
    const sceneHeight = 900 - 64
    await page.evaluate(y => {
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, y)
    }, sceneHeight * 1.5)

    await expect(page.locator('[data-story-cue="course"]')).toHaveAttribute('data-active', 'true')
    await expect
      .poll(() => heroVideo.evaluate(video => (video as HTMLVideoElement).currentTime))
      .toBeCloseTo(10.5, 1)
    expect(await heroVideo.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true)
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
    await expect(mobileNavigation.getByRole('link', { name: 'Kurz', exact: true })).toHaveAttribute(
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
