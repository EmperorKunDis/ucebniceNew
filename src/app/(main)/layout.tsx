'use client'

import { MainLayout } from '@/components/layout'

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  // TODO: Re-enable auth check after testing
  // const { status } = useSession()
  // if (status === 'unauthenticated') redirect('/auth/signin')

  return <MainLayout>{children}</MainLayout>
}
