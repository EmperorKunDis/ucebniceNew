import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kapitoly',
  description:
    'Procházejte kapitoly kurzu programování s AI. Učte se Python, strojové učení a deep learning.',
  keywords: ['kapitoly', 'lekce', 'Python tutoriál', 'AI kurz', 'strojové učení'],
  openGraph: {
    title: 'Kapitoly kurzu | Učebnice AI',
    description:
      'Procházejte kapitoly kurzu programování s AI. Učte se Python, strojové učení a deep learning.',
    type: 'website',
  },
}

export default function ChaptersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
