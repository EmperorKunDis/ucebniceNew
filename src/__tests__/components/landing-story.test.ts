import {
  LANDING_STORY_CUES,
  LANDING_STORY_TRANSITION,
  resolveLandingStoryFrame,
} from '@/components/landing/landing-story'

describe('landing scroll story', () => {
  const sceneHeight = 800

  it('holds the intro pose for the whole first scene', () => {
    expect(resolveLandingStoryFrame(0, sceneHeight)).toEqual({
      cueIndex: 0,
      cueProgress: 0,
      hold: true,
      holdProgress: 0,
      time: 5.9,
    })

    expect(resolveLandingStoryFrame(sceneHeight * 0.9, sceneHeight).time).toBe(5.9)
  })

  it('travels between poses during the transition part of a scene', () => {
    const midTransition = resolveLandingStoryFrame(
      sceneHeight * (1 + LANDING_STORY_TRANSITION / 2),
      sceneHeight
    )

    expect(midTransition.cueIndex).toBe(1)
    expect(midTransition.hold).toBe(false)
    expect(midTransition.holdProgress).toBe(0)
    expect(midTransition.time).toBeGreaterThan(5.9)
    expect(midTransition.time).toBeLessThan(10.5)
    // Ease-in-out is symmetric, so the midpoint lands halfway between poses.
    expect(midTransition.time).toBeCloseTo((5.9 + 10.5) / 2, 5)
  })

  it('pins the video to the cue pose during the hold part of a scene', () => {
    const hold = resolveLandingStoryFrame(sceneHeight * 1.8, sceneHeight)

    expect(hold).toMatchObject({ cueIndex: 1, hold: true, time: 10.5 })
    expect(hold.holdProgress).toBeCloseTo(
      (0.8 - LANDING_STORY_TRANSITION) / (1 - LANDING_STORY_TRANSITION),
      5
    )
  })

  it('clamps before the story and reaches the final pose', () => {
    expect(resolveLandingStoryFrame(-500, sceneHeight).time).toBe(5.9)

    expect(resolveLandingStoryFrame(sceneHeight * LANDING_STORY_CUES.length, sceneHeight)).toEqual({
      cueIndex: 8,
      cueProgress: 1,
      hold: true,
      holdProgress: 1,
      time: 41.9,
    })
  })

  it('keeps cue poses in chronological video order', () => {
    const poses = LANDING_STORY_CUES.map(cue => cue.pose)
    expect([...poses].sort((a, b) => a - b)).toEqual(poses)
  })

  it('keeps the eight approved feature headings in product order', () => {
    expect(LANDING_STORY_CUES.slice(1).map(cue => cue.title)).toEqual([
      'Kompletní kurz AI a programování',
      'Multimediální výuka bez instalace',
      'Procvičování a praktické projekty',
      'Duolingo-style cesta kurzem',
      'Silná gamifikace',
      'AI Tutor a chytré opakování',
      'Testy a ověřitelný certifikát',
      'Komunita a Apex Aréna',
    ])
  })
})
