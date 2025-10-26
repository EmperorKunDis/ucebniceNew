import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aréna',
  description: 'Vyzkoušejte své dovednosti v aréně. Hackathony a výzvy pro pokročilé studenty.',
  keywords: ['aréna', 'hackathon', 'výzvy', 'soutěže', 'coding challenges'],
  openGraph: {
    title: 'Aréna | Učebnice AI',
    description: 'Vyzkoušejte své dovednosti v aréně. Hackathony a výzvy pro pokročilé studenty.',
    type: 'website',
  },
}

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
