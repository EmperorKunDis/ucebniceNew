'use client'

import { useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin')
    }
  }, [router, status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
      </div>
    )
  }

  return <MainLayout>{children}</MainLayout>
}
