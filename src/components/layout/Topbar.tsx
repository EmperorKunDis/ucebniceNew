'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeartDisplay, useHearts } from '@/components/gamification/hearts'
import { StreakDisplay } from '@/components/gamification/streak'
import { XPCounter, LevelBadge } from '@/components/gamification/xp'
import { GemDisplay, useGems } from '@/components/gamification/gems'

interface TopbarProps {
  onMenuClick?: () => void
  showMenu?: boolean
  className?: string
}

export function Topbar({ onMenuClick, showMenu, className }: TopbarProps) {
  const { data: session } = useSession()
  const { hearts, maxHearts, nextRegenAt, unlimitedUntil } = useHearts()
  const { gems } = useGems()
  const [notificationCount] = useState(3) // TODO: Fetch from API
  const pathname = usePathname()

  // Live XP/level/streak from the DB so the HUD updates after earning XP
  // (the NextAuth session is cached client-side and would otherwise stay stale)
  const [liveXp, setLiveXp] = useState<number | null>(null)
  const [liveLevel, setLiveLevel] = useState<number | null>(null)
  const [liveStreak, setLiveStreak] = useState<number | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/stats')
      if (!res.ok) return
      const data = await res.json()
      if (data?.user) {
        setLiveXp(data.user.xp ?? null)
        setLiveLevel(data.user.level ?? null)
        setLiveStreak(data.user.currentStreak ?? null)
      }
    } catch {
      // keep last known values on transient errors
    }
  }, [])

  // Refetch on mount and whenever the route changes (e.g. after finishing a lesson)
  useEffect(() => {
    fetchStats()
  }, [fetchStats, pathname])

  // Refetch when the tab regains focus
  useEffect(() => {
    const onFocus = () => fetchStats()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchStats])

  const displayXp = liveXp ?? session?.user?.xp ?? 0
  const displayLevel = liveLevel ?? session?.user?.level ?? 1
  const displayStreak = liveStreak ?? session?.user?.currentStreak ?? 0

  return (
    <header
      className={cn(
        'h-16 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between',
        className
      )}
    >
      {/* Left side - Menu button (mobile) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Streak */}
        <Link href="/profile" className="hidden sm:block">
          <StreakDisplay streak={displayStreak} size="md" />
        </Link>
      </div>

      {/* Center - XP and Level */}
      <div className="flex items-center gap-4">
        <XPCounter value={displayXp} size="md" />
        <LevelBadge level={displayLevel} size="md" />
      </div>

      {/* Right side - Hearts, Gems, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        {/* Hearts */}
        <Link href="/shop" className="hidden sm:block">
          <HeartDisplay
            hearts={hearts}
            maxHearts={maxHearts}
            nextRegenAt={nextRegenAt}
            unlimitedUntil={unlimitedUntil}
            size="md"
          />
        </Link>

        {/* Gems */}
        <Link href="/shop" className="hidden sm:block">
          <GemDisplay gems={gems} size="md" />
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link href="/profile" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
            {session?.user?.image ? (
              <>
                {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}
