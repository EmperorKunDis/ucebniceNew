'use client'

import { useState, useEffect, useCallback } from 'react'

interface HeartsState {
  hearts: number
  maxHearts: number
  nextRegenAt: string | null
  unlimitedUntil: string | null
  regenRateMinutes: number
  isLoading: boolean
  error: string | null
}

export function useHearts() {
  const [state, setState] = useState<HeartsState>({
    hearts: 5,
    maxHearts: 5,
    nextRegenAt: null,
    unlimitedUntil: null,
    regenRateMinutes: 240,
    isLoading: true,
    error: null,
  })

  const fetchHearts = useCallback(async () => {
    try {
      const res = await fetch('/api/user/hearts')
      if (!res.ok) throw new Error('Failed to fetch hearts')
      const data = await res.json()
      setState(prev => ({
        ...prev,
        hearts: data.hearts,
        maxHearts: data.maxHearts,
        nextRegenAt: data.nextRegenAt,
        unlimitedUntil: data.unlimitedUntil,
        regenRateMinutes: data.regenRateMinutes,
        isLoading: false,
        error: null,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  const loseHeart = useCallback(async () => {
    try {
      const res = await fetch('/api/user/hearts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lose' }),
      })
      if (!res.ok) throw new Error('Failed to lose heart')
      const data = await res.json()
      setState(prev => ({
        ...prev,
        hearts: data.hearts,
      }))
      return data
    } catch (err) {
      console.error('Error losing heart:', err)
      throw err
    }
  }, [])

  const refillHearts = useCallback(async () => {
    try {
      const res = await fetch('/api/user/hearts/refill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'gems' }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to refill')
      }
      const data = await res.json()
      setState(prev => ({
        ...prev,
        hearts: data.hearts,
        maxHearts: data.maxHearts,
      }))
      return data
    } catch (err) {
      console.error('Error refilling hearts:', err)
      throw err
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchHearts()
  }, [fetchHearts])

  // Refetch when regen time passes
  useEffect(() => {
    if (!state.nextRegenAt || state.hearts >= state.maxHearts) return

    const regenTime = new Date(state.nextRegenAt).getTime()
    const now = Date.now()
    const delay = regenTime - now

    if (delay <= 0) {
      fetchHearts()
      return
    }

    const timeout = setTimeout(fetchHearts, delay + 1000) // +1s buffer
    return () => clearTimeout(timeout)
  }, [state.nextRegenAt, state.hearts, state.maxHearts, fetchHearts])

  return {
    ...state,
    loseHeart,
    refillHearts,
    refetch: fetchHearts,
  }
}
