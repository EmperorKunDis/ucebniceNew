import type { Metadata } from 'next'
import { PublicShell } from '@/components/layout/PublicShell'

export const metadata: Metadata = {
  title: 'Přihlášení',
  description: 'Přihlaste se do Učebnice AI a pokračujte v učení programování s AI asistentem',
  robots: {
    index: false, // Don't index auth pages
    follow: true,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell showNavigation={false}>{children}</PublicShell>
}
