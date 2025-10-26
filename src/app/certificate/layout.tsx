import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certifikát',
  description: 'Získejte certifikát o dokončení kurzu programování AI. Dokažte své znalosti.',
  keywords: ['certifikát', 'osvědčení', 'dokončení kurzu', 'AI certifikace'],
  openGraph: {
    title: 'Certifikát | Učebnice AI',
    description: 'Získejte certifikát o dokončení kurzu programování AI. Dokažte své znalosti.',
    type: 'website',
  },
}

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
