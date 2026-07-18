import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Učebnice AI — kurz AI a programování',
  description:
    '40 navazujících kapitol, video, NotebookLM, Google Colab, interaktivní cvičení a gamifikovaná cesta k ověřitelnému certifikátu.',
}

export default function HomePage() {
  return <LandingPage />
}
