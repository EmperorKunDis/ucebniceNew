export interface ScreenQuad {
  tl: readonly [number, number]
  tr: readonly [number, number]
  br: readonly [number, number]
  bl: readonly [number, number]
}

export interface LandingStoryCue {
  id: string
  /** Video timestamp (s) where the laptop holds still for this cue. */
  pose: number
  /** Corners of the laptop display at the pose, normalized to the 1920x1080 video frame. */
  quad: ScreenQuad
  number?: string
  eyebrow: string
  title: string
  description: string
  proof?: string
  kind: 'intro' | 'feature'
  reward?: boolean
}

export const LANDING_STORY_CUES: readonly LandingStoryCue[] = [
  {
    id: 'intro',
    pose: 5.9,
    quad: {
      tl: [0.2927, 0.0519],
      tr: [0.7703, 0.0398],
      br: [0.7922, 0.5861],
      bl: [0.3031, 0.6278],
    },
    eyebrow: 'UČEBNICE AI',
    title: 'Nauč se programovat AI. A programovat s AI.',
    description:
      '40 kapitol od prvního promptu po neuronové sítě. S videem, NotebookLM, Google Colabem a jasnou cestou až k certifikátu.',
    kind: 'intro',
  },
  {
    id: 'course',
    pose: 10.5,
    quad: {
      tl: [0.3771, 0.0556],
      tr: [0.8573, 0.0685],
      br: [0.8427, 0.65],
      bl: [0.3479, 0.5917],
    },
    number: '01',
    eyebrow: 'OD ZÁKLADŮ PO BUDOUCNOST AI',
    title: 'Kompletní kurz AI a programování',
    description:
      '40 navazujících kapitol od základů AI přes algoritmy a machine learning až po neuronové sítě, etiku a budoucnost AI.',
    proof: '40 navazujících kapitol',
    kind: 'feature',
  },
  {
    id: 'multimedia',
    pose: 15.6,
    quad: {
      tl: [0.2646, 0.0667],
      tr: [0.7438, 0.063],
      br: [0.7578, 0.612],
      bl: [0.2646, 0.6287],
    },
    number: '02',
    eyebrow: 'UČENÍ BEZ INSTALACE',
    title: 'Multimediální výuka bez instalace',
    description:
      'Plné textové lekce, 38 videí, 38 NotebookLM zdrojů a 40 praktických Google Colab notebooků.',
    proof: 'Text · video · NotebookLM · Colab',
    kind: 'feature',
  },
  {
    id: 'practice',
    pose: 18.4,
    quad: {
      tl: [0.3031, 0.0491],
      tr: [0.7807, 0.0352],
      br: [0.8036, 0.5824],
      bl: [0.3156, 0.6269],
    },
    number: '03',
    eyebrow: 'PROCVIČUJ A STAVĚJ',
    title: 'Procvičování a praktické projekty',
    description:
      '400 interaktivních testových otázek s vysvětlením a projekty ve vybraných kapitolách, včetně AI zpětné vazby.',
    proof: '400 otázek · projekty ve vybraných kapitolách',
    kind: 'feature',
  },
  {
    id: 'path',
    pose: 21.2,
    quad: {
      tl: [0.2651, 0.0685],
      tr: [0.7453, 0.0667],
      br: [0.7573, 0.6157],
      bl: [0.2635, 0.6287],
    },
    number: '04',
    eyebrow: 'PROGRES, KTERÝ JE VIDĚT',
    title: 'Duolingo-style cesta kurzem',
    description:
      'Vizuální skill tree, postupné odemykání kapitol a hvězdičkový progres za obsah, cvičení a schválené projekty.',
    proof: 'Obsah · cvičení · schválený projekt',
    kind: 'feature',
  },
  {
    id: 'gamification',
    pose: 26.5,
    quad: {
      tl: [0.3594, 0.0611],
      tr: [0.8391, 0.0741],
      br: [0.8276, 0.6509],
      bl: [0.3333, 0.6009],
    },
    number: '05',
    eyebrow: 'MOTIVACE, KTERÁ DRŽÍ RYTMUS',
    title: 'Silná gamifikace',
    description:
      'XP, levely, streaky, srdíčka, gemy, achievementy, denní a týdenní questy, ligy, žebříčky a obchod.',
    proof: 'XP · streak · questy · ligy',
    kind: 'feature',
    reward: true,
  },
  {
    id: 'tutor',
    pose: 28.6,
    quad: {
      tl: [0.2656, 0.0704],
      tr: [0.7464, 0.0676],
      br: [0.7578, 0.6185],
      bl: [0.2635, 0.6287],
    },
    number: '06',
    eyebrow: 'AI PO RUCE',
    title: 'AI Tutor a chytré opakování',
    description:
      'Osobní AI pomocník a spaced repetition pro opakování témat, která student potřebuje procvičit.',
    proof: 'Pomoc k lekci · spaced repetition',
    kind: 'feature',
  },
  {
    id: 'certificate',
    pose: 34.6,
    quad: {
      tl: [0.2661, 0.0685],
      tr: [0.7464, 0.0676],
      br: [0.7578, 0.6176],
      bl: [0.2625, 0.6287],
    },
    number: '07',
    eyebrow: 'OVĚŘENÝ VÝSLEDEK',
    title: 'Testy a ověřitelný certifikát',
    description:
      'Milníkové testy, závěrečný test a projekt, PDF certifikát s unikátním veřejně ověřitelným kódem.',
    proof: 'Milníky · závěrečný test · PDF certifikát',
    kind: 'feature',
    reward: true,
  },
  {
    id: 'arena',
    pose: 41.9,
    quad: {
      tl: [0.2547, 0.0731],
      tr: [0.7682, 0.0778],
      br: [0.7911, 0.65],
      bl: [0.2354, 0.6528],
    },
    number: '08',
    eyebrow: 'UKAŽ, CO UMÍŠ',
    title: 'Komunita a Apex Aréna',
    description:
      'Přátelé, hackathony, týmy, prezentace projektů a profily absolventů směrem k firmám a zaměstnavatelům.',
    proof: 'Týmy · hackathony · profily absolventů',
    kind: 'feature',
    reward: true,
  },
] as const

/**
 * Fraction of each scroll scene spent travelling between poses. The rest of
 * the scene pins the video to the cue pose so the on-screen HTML overlay is
 * perfectly registered with the (still) laptop display.
 */
export const LANDING_STORY_TRANSITION = 0.42

export interface LandingStoryFrame {
  cueIndex: number
  /** 0..1 progress within the cue scene. */
  cueProgress: number
  /** True while the video is pinned to the cue pose. */
  hold: boolean
  /** 0..1 progress within the hold (0 while travelling). */
  holdProgress: number
  time: number
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export function resolveLandingStoryFrame(
  offsetPx: number,
  sceneHeightPx: number,
  cues: readonly LandingStoryCue[] = LANDING_STORY_CUES
): LandingStoryFrame {
  if (cues.length === 0 || sceneHeightPx <= 0) {
    return { cueIndex: 0, cueProgress: 0, hold: true, holdProgress: 0, time: 0 }
  }

  const sceneCount = cues.length
  const sceneFloat = clamp(offsetPx, 0, sceneHeightPx * sceneCount) / sceneHeightPx
  const cueIndex = Math.min(Math.floor(sceneFloat), sceneCount - 1)
  const cueProgress = sceneFloat >= sceneCount ? 1 : clamp(sceneFloat - cueIndex, 0, 1)
  const cue = cues[cueIndex]!

  if (cueIndex === 0) {
    return { cueIndex, cueProgress, hold: true, holdProgress: cueProgress, time: cue.pose }
  }

  if (cueProgress < LANDING_STORY_TRANSITION) {
    const previous = cues[cueIndex - 1]!
    const eased = easeInOutCubic(cueProgress / LANDING_STORY_TRANSITION)

    return {
      cueIndex,
      cueProgress,
      hold: false,
      holdProgress: 0,
      time: previous.pose + (cue.pose - previous.pose) * eased,
    }
  }

  return {
    cueIndex,
    cueProgress,
    hold: true,
    holdProgress: (cueProgress - LANDING_STORY_TRANSITION) / (1 - LANDING_STORY_TRANSITION),
    time: cue.pose,
  }
}
