import {
  ChatCircle,
  CheckCircle,
  Fire,
  Lightning,
  Lock,
  Play,
  SealCheck,
  Star,
  Trophy,
} from '@phosphor-icons/react/ssr'
import styles from './landing-screens.module.css'

const CHAPTERS = [
  { number: '01', title: 'Co je AI', progress: 100 },
  { number: '02', title: 'První prompt', progress: 100 },
  { number: '03', title: 'Algoritmy', progress: 64 },
  { number: '12', title: 'Machine learning', progress: 0 },
  { number: '24', title: 'Neuronové sítě', progress: 0 },
  { number: '40', title: 'Budoucnost AI', progress: 0 },
]

const PATH_NODES = [
  { label: 'Základy', state: 'done' },
  { label: 'Prompting', state: 'done' },
  { label: 'Algoritmy', state: 'current' },
  { label: 'ML', state: 'locked' },
  { label: 'Neuronky', state: 'locked' },
] as const

function IntroScreen({ reducedMotion }: { reducedMotion?: boolean }) {
  return (
    <div className={`${styles.screen} ${styles.introScreen}`}>
      {reducedMotion ? (
        // Static formed logo for users who opted out of self-playing motion.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.introLogoVideo}
          src="/media/landing/ucebnice-logo-still.jpg"
          alt=""
          data-testid="landing-intro-logo-still"
        />
      ) : (
        // Boot shot: particles converge into the brand mark, then hold on the
        // final frame (no loop, so there is no jump cut back to black).
        <video
          className={styles.introLogoVideo}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          data-testid="landing-intro-logo-video"
        >
          <source src="/media/landing/ucebnice-logo-boot.webm" type="video/webm" />
          <source src="/media/landing/ucebnice-logo-boot.mp4" type="video/mp4" />
        </video>
      )}
      <div className={styles.introCopy}>
        <h1 id="landing-title" className={styles.introTitle}>
          Nauč se programovat AI. <span>A programovat s AI.</span>
        </h1>
        <p className={styles.introSub}>
          40 kapitol od prvního promptu po neuronové sítě — až k certifikátu.
        </p>
        <p className={styles.introStats}>40 kapitol · 400 cvičení · certifikát</p>
      </div>
    </div>
  )
}

function CourseScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <span>KURZ</span>
        <strong>40 kapitol · jedna cesta</strong>
      </header>
      <div className={styles.chapterGrid}>
        {CHAPTERS.map(chapter => (
          <article
            key={chapter.number}
            className={styles.chapterCard}
            data-state={chapter.progress === 100 ? 'done' : chapter.progress > 0 ? 'active' : ''}
          >
            <span className={styles.chapterNumber}>{chapter.number}</span>
            <strong>{chapter.title}</strong>
            <div className={styles.miniProgress}>
              <span style={{ width: `${chapter.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MultimediaScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.player}>
        <span className={styles.playButton}>
          <Play size={44} weight="fill" aria-hidden="true" />
        </span>
        <div className={styles.playerBar}>
          <span />
        </div>
      </div>
      <div className={styles.chipRow}>
        <span>Video lekce</span>
        <span>NotebookLM</span>
        <span>Google Colab</span>
      </div>
    </div>
  )
}

function PracticeScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <span>OTÁZKA 7 / 10</span>
        <strong>Co dělá aktivační funkce?</strong>
      </header>
      <div className={styles.answerList}>
        <span>Ukládá vstupní data</span>
        <span data-state="correct">
          <CheckCircle size={26} weight="fill" aria-hidden="true" /> Rozhoduje o výstupu neuronu
        </span>
        <span>Zrychluje trénink</span>
      </div>
      <p className={styles.xpToast}>
        <Lightning size={22} weight="fill" aria-hidden="true" /> +20 XP · Správně!
      </p>
    </div>
  )
}

function PathScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <span>TVOJE CESTA</span>
        <strong>Kapitola 3 · Algoritmy</strong>
      </header>
      <div className={styles.pathTrack}>
        {PATH_NODES.map(node => (
          <div key={node.label} className={styles.pathNode} data-state={node.state}>
            <span>
              {node.state === 'done' ? (
                <CheckCircle size={30} weight="fill" aria-hidden="true" />
              ) : node.state === 'locked' ? (
                <Lock size={24} aria-hidden="true" />
              ) : (
                <Star size={28} weight="fill" aria-hidden="true" />
              )}
            </span>
            <small>{node.label}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function GamificationScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.statRow}>
        <span className={styles.statPill} data-tone="fire">
          <Fire size={26} weight="duotone" aria-hidden="true" /> 12 dní
        </span>
        <span className={styles.statPill} data-tone="gold">
          <Star size={26} weight="duotone" aria-hidden="true" /> Level 4
        </span>
        <span className={styles.statPill}>
          <Trophy size={26} weight="duotone" aria-hidden="true" /> 18 odznaků
        </span>
      </div>
      <div className={styles.xpBlock}>
        <div className={styles.xpMeta}>
          <strong>Level 4 → 5</strong>
          <span>640 / 800 XP</span>
        </div>
        <div className={styles.xpBar}>
          <span style={{ width: '80%' }} />
        </div>
      </div>
      <p className={styles.questRow}>
        <CheckCircle size={24} weight="fill" aria-hidden="true" /> Denní quest: dokonči 2 cvičení
      </p>
    </div>
  )
}

function TutorScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.chat}>
        <p className={styles.chatUser}>Nechápu rozdíl mezi listem a tuplem…</p>
        <p className={styles.chatAi}>
          <span>
            <ChatCircle size={22} weight="fill" aria-hidden="true" />
          </span>
          List můžeš měnit, tuple ne. Ukážu ti to na příkladu z tvé lekce.
        </p>
      </div>
      <div className={styles.chatInput}>Zeptej se AI tutora…</div>
    </div>
  )
}

function CertificateScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.certificate}>
        <SealCheck size={54} weight="duotone" aria-hidden="true" />
        <span className={styles.certEyebrow}>CERTIFIKÁT ABSOLVENTA</span>
        <strong>Učebnice AI — kurz AI a programování</strong>
        <code>OVĚŘENÍ: UCB-2026-8F3K</code>
      </div>
    </div>
  )
}

function ArenaScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <span>APEX ARÉNA</span>
        <strong>Týdenní liga</strong>
      </header>
      <ol className={styles.leaderboard}>
        <li data-rank="1">
          <span>1</span> Tým Neuronky <em>2 840 XP</em>
        </li>
        <li>
          <span>2</span> Prompt Masters <em>2 610 XP</em>
        </li>
        <li>
          <span>3</span> Colab Crew <em>2 390 XP</em>
        </li>
      </ol>
    </div>
  )
}

const SCREENS: Record<string, (props: { reducedMotion?: boolean }) => React.JSX.Element> = {
  intro: IntroScreen,
  course: CourseScreen,
  multimedia: MultimediaScreen,
  practice: PracticeScreen,
  path: PathScreen,
  gamification: GamificationScreen,
  tutor: TutorScreen,
  certificate: CertificateScreen,
  arena: ArenaScreen,
}

export function LandingScreenContent({
  cueId,
  reducedMotion,
}: {
  cueId: string
  reducedMotion?: boolean
}) {
  const Screen = SCREENS[cueId]
  if (!Screen) return null

  return (
    <div className={styles.screenFrame}>
      <Screen reducedMotion={reducedMotion} />
      <span className={styles.notch} aria-hidden="true" />
      <span className={styles.glare} aria-hidden="true" />
    </div>
  )
}
