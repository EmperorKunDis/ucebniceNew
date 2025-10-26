import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Odznaky',
  description:
    'Prohlédněte si všechny dostupné odznaky a sledujte svůj pokrok v získávání achievementů.',
  keywords: ['odznaky', 'achievementy', 'úspěchy', 'badges', 'gamifikace'],
  openGraph: {
    title: 'Odznaky | Učebnice AI',
    description:
      'Prohlédněte si všechny dostupné odznaky a sledujte svůj pokrok v získávání achievementů.',
    type: 'website',
  },
}

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
