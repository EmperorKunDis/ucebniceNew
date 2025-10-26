import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Žebříček',
  description:
    'Prohlédněte si žebříček nejlepších studentů. Soutěžte s ostatními a sbírejte XP body.',
  keywords: ['žebříček', 'leaderboard', 'soutěž', 'XP body', 'nejlepší studenti'],
  openGraph: {
    title: 'Žebříček | Učebnice AI',
    description:
      'Prohlédněte si žebříček nejlepších studentů. Soutěžte s ostatními a sbírejte XP body.',
    type: 'website',
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
