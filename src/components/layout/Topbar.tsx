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
import { useUserStats } from '@/hooks/useUserStats'

interface TopbarProps {
  onMenuClick?: () => void
  showMenu?: boolean
  className?: string
}

export function Topbar({ onMenuClick, showMenu, className }: TopbarProps) {
  const { data: session } = useSession()
  const { hearts, maxHearts, nextRegenAt, unlimitedUntil } = useHearts()
  const { gems } = useGems()
  const [notificationCount, setNotificationCount] = useState<number | null>(null)
  const pathname = usePathname()
  const { data: userStats, refetch: refetchUserStats } = useUserStats()

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=1')
      if (!res.ok) {
        setNotificationCount(null)
        return
      }

      const data = await res.json()
      setNotificationCount(data?.data?.unreadCount ?? 0)
    } catch {
      setNotificationCount(null)
    }
  }, [])

  // Refetch on mount and whenever the route changes (e.g. after finishing a lesson)
  useEffect(() => {
    refetchUserStats()
    fetchNotificationCount()
  }, [refetchUserStats, fetchNotificationCount, pathname])

  // Refetch when the tab regains focus
  useEffect(() => {
    const onFocus = () => {
      refetchUserStats()
      fetchNotificationCount()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetchUserStats, fetchNotificationCount])

  const displayXp = userStats?.user.xp ?? session?.user?.xp ?? 0
  const displayLevel = userStats?.user.level ?? session?.user?.level ?? 1
  const displayStreak = userStats?.user.currentStreak ?? session?.user?.currentStreak ?? 0

  return (
    <header
      className={cn(
        'h-16 bg-gray-950/95 border-b border-white/10 px-4 flex items-center justify-between backdrop-blur-xl',
        className
      )}
    >
      {/* Left side - Menu button (mobile) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={showMenu ? 'Zavřít navigaci' : 'Otevřít navigaci'}
        >
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Streak */}
        <Link href="/profile" className="hidden sm:block">
          <StreakDisplay streak={displayStreak} size="md" />
        </Link>
      </div>

      {/* Center - XP and Level */}
      <div className="flex items-center gap-4" data-testid="topbar-xp">
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
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Notifikace"
        >
          <Bell className="w-5 h-5" />
          {notificationCount !== null && notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link href="/profile" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/40 to-purple-500/40 border border-white/10 overflow-hidden">
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
