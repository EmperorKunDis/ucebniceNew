'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface UseGemsReturn {
  gems: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  spend: (amount: number) => Promise<boolean>
  add: (amount: number) => void
}

/**
 * Hook for managing user gems
 * Fetches current gems and provides spend/add methods
 */
export function useGems(): UseGemsReturn {
  const { data: session } = useSession()
  const [gems, setGems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGems = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const res = await fetch('/api/user/stats')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setGems(data.gems ?? 0)
      setError(null)
    } catch (err) {
      setError('Nepodařilo se načíst gemy')
      console.error('Error fetching gems:', err)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchGems()
  }, [fetchGems])

  const spend = useCallback(
    async (amount: number): Promise<boolean> => {
      if (gems < amount) {
        setError('Nedostatek gemů')
        return false
      }

      // Optimistic update
      setGems(prev => prev - amount)
      return true
    },
    [gems]
  )

  const add = useCallback((amount: number) => {
    setGems(prev => prev + amount)
  }, [])

  return {
    gems,
    loading,
    error,
    refetch: fetchGems,
    spend,
    add,
  }
}
