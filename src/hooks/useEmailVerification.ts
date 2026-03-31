'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'

interface VerificationStatus {
  isVerified: boolean
  loading: boolean
  canAccessChapter: (chapterNumber: number) => boolean
  resendVerification: () => Promise<boolean>
}

const UNVERIFIED_CHAPTER_LIMIT = 3

export function useEmailVerification(): VerificationStatus {
  const { data: session, status } = useSession()
  const [isVerified, setIsVerified] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      // Check if emailVerified exists in session
      // NextAuth stores this in the token
      const verified = !!(session.user as { emailVerified?: Date }).emailVerified
      setIsVerified(verified)
    }
    setLoading(false)
  }, [session, status])

  const canAccessChapter = useCallback(
    (chapterNumber: number) => {
      if (isVerified) return true
      return chapterNumber <= UNVERIFIED_CHAPTER_LIMIT
    },
    [isVerified]
  )

  const resendVerification = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
      })
      return res.ok
    } catch {
      return false
    }
  }, [])

  return {
    isVerified,
    loading,
    canAccessChapter,
    resendVerification,
  }
}
