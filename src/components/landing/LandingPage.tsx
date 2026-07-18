import Link from 'next/link'
import { JetBrains_Mono, Montserrat, Open_Sans } from 'next/font/google'
import { ArrowRight, Certificate } from '@phosphor-icons/react/ssr'
import { PublicPageLayout } from '@/components/layout/PublicPageLayout'
import { LandingScrollStory } from './LandingScrollStory'
import styles from './landing.module.css'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '800'],
  variable: '--landing-display',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--landing-body',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--landing-mono',
  display: 'swap',
})

const HERO_TAGS = [
  '40 kapitol a 400 cvičení',
  'Video, NotebookLM a Google Colab',
  'AI Tutor a zpětná vazba k projektům',
  'Gamifikovaná cesta s viditelným progresem',
  'Certifikát a prezentace projektů v Apex Aréně',
]

export function LandingPage() {
  return (
    <PublicPageLayout
      maxWidth="none"
      className={`${styles.shell} ${montserrat.variable} ${openSans.variable} ${jetBrainsMono.variable}`}
      contentClassName={styles.main}
    >
      <div className={styles.landing}>
        <LandingScrollStory />

        <div id="landing-after-story" className={styles.storyExitAnchor} />

        <section className={styles.proofSection} id="obsah" aria-labelledby="proof-heading">
          <div className={styles.proofHeading}>
            <div>
              <p className={styles.eyebrow}>V JEDNOM KURZU</p>
              <h2 id="proof-heading">Všechno, co potřebuješ k postupu.</h2>
            </div>
            <p>
              Obsah, praxe, motivace i ověřený výsledek. Bez přeskakování mezi nástroji a bez
              hledání dalšího kroku.
            </p>
          </div>

          <ul className={styles.heroTags} aria-label="Hlavní funkce Učebnice AI">
            {HERO_TAGS.map(tag => (
              <li key={tag}>
                <span aria-hidden="true" />
                {tag}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-heading">
          <div className={styles.finalCtaIcon} aria-hidden="true">
            <Certificate size={34} />
          </div>
          <p className={styles.eyebrow}>PRVNÍ KAPITOLA ČEKÁ</p>
          <h2 id="final-cta-heading">Otevři první kapitolu.</h2>
          <p>Začni od základů a postupuj vlastním tempem po jedné jasné cestě.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/dashboard">
              Začít kurz <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryButton} href="#obsah">
              Prohlédnout obsah
            </Link>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  )
}
