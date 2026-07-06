'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export const userStatsQueryKey = ['user-stats'] as const

interface UserStatsResponse {
  user: {
    id: string
    name: string | null
    email: string | null
    username: string | null
    image: string | null
    xp: number
    level: number
    currentStreak: number
    longestStreak: number
    createdAt: string
  }
}

async function fetchUserStats(): Promise<UserStatsResponse> {
  const res = await fetch('/api/user/stats')

  if (!res.ok) {
    throw new Error('Failed to fetch user stats')
  }

  return res.json()
}

export function useUserStats() {
  const { status } = useSession()

  return useQuery({
    queryKey: userStatsQueryKey,
    queryFn: fetchUserStats,
    enabled: status === 'authenticated',
  })
}
