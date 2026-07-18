# Landing page - AI Context

## PURPOSE

Public Učebnice AI marketing page following the `Učebnice AI · 1.0` dark-first design system.
Apple-style scroll story: the mockup MacBook travels between nine fixed poses; while a pose holds,
an HTML "screen" layer is projected onto the laptop display (intro claim on a white slide, then one
feature vignette per stop) next to the marketing copy panel.

## EXPORTS

- `LandingPage` — server-rendered public wrapper, proof strip, and final CTA.
- `LandingScrollStory` — the only client boundary; plays the lid-opening shot once on load, then
  maps native page scroll to video time (transition 42 % of a scene, hold 58 %).
- `LandingScreenContent` — the nine projected screens (intro + 8 feature vignettes) authored on a
  fixed 1240x800 canvas (`landing-screens.module.css`).
- `landing-story` — approved copy, per-cue video `pose` timestamps, measured display `quad`
  corners, and the pure scroll-to-frame resolver (`resolveLandingStoryFrame`).
- `screen-projection` — homography → CSS `matrix3d` mapping the screen canvas onto the display
  quad for the current stage size.
- `landing.module.css` — scoped landing tokens, sticky story layout, and static responsive fallback.

## MEDIA PIPELINE

`UcebniceMockup2.mov` (repo root) has a green-screen display. Assets in `public/media/landing/`
are produced offline with ffmpeg: a `geq` alpha mask (`g>60 && g>1.6r && g>1.6b`) keys the green,
one alpha `erosion` removes fringe, `despill`, then the cutout is composited over `#0b0d14` so the
display reads as "off" while the laptop travels. Exports use `-g 8` for precise scrubbing; the
poster is processed frame 0 (closed lid). Re-measure `quad` corners if the source video changes
(corner extremes of the green mask, normalized to 1920x1080).

## GOTCHAS

1. Keep the five hero claims and eight feature descriptions in the approved order.
2. Do not claim free access, 24/7 AI availability, free GPU, projects in every chapter, or unverified
   student counts.
3. Primary CTA is solid violet. Learning gradients are for progress; reward gradients are only for
   XP, gamification, achievements, and certificate accents.
4. Apart from the one-shot opening animation the video is always paused in desktop mode. Do not
   intercept `wheel`; native scrolling sets `currentTime` through one `requestAnimationFrame`.
5. Screen overlays are only visible during holds (`frame.hold`) — while the laptop moves the
   display must stay dark, otherwise the projection visibly detaches.
6. `.introScreen .introTitle` intentionally doubles specificity to beat the generic `.landing h1`
   color; the h1 with `id="landing-title"` must stay inside the intro screen (SEO/a11y + e2e).
7. Reduced-motion and sub-900 px visitors get the static intro composition (video parked on the
   intro pose, projected white slide, CTAs) plus all eight feature cards in document flow.
8. Public partner logos are rendered by `PublicShell`; do not add a second footer here.
9. E2E coverage: `e2e/smoke.spec.ts` asserts pose times (10.5, 21.2, intro 5.9), hold-based
   `data-active` panels, and the paused/parked states — update tests and `landing-story.test.ts`
   together with any pose change.
