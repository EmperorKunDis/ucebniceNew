'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/user-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setUser, reset } = useUserStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Synchronizovat NextAuth session s Zustand store
      setUser({
        userId: session.user.id,
        username: session.user.username || session.user.name || 'User',
        email: session.user.email,
        avatar: session.user.image || undefined,
      })
    } else if (status === 'unauthenticated') {
      // Vymazat uživatele ze store při odhlášení
      reset()
    }
  }, [session, status, setUser, reset])

  return <>{children}</>
}