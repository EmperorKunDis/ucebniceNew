'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/user-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setUser, resetUser } = useUserStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Synchronizovat NextAuth session s Zustand store
      setUser({
        userId: session.user.id,
        username: session.user.username || session.user.name || 'User',
        email: session.user.email,
        avatar: session.user.image || undefined,
        xp: session.user.xp || 0,
        level: session.user.level || 1,
        currentStreak: session.user.currentStreak || 0,
        longestStreak: session.user.longestStreak || 0,
      })
    } else if (status === 'unauthenticated') {
      // Vymazat uživatele ze store při odhlášení
      resetUser()
    }
  }, [session, status, setUser, resetUser])

  return <>{children}</>
}