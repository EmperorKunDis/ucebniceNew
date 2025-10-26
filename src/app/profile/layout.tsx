import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Zobrazte svůj profil, statistiky, odznaky a pokrok v učení programování',
  robots: {
    index: false, // Don't index user profiles
    follow: true,
  },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
