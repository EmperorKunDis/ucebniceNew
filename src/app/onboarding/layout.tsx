import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/PublicShell'

export const metadata: Metadata = {
  title: 'Vítejte',
  description: 'Začněte svou cestu k programování s AI. Nastavte si profil a začněte se učit.',
  robots: {
    index: false, // Don't index onboarding pages
    follow: true,
  },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell showNavigation={false}>{children}</PublicShell>
}
