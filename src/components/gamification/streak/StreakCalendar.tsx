'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Snowflake } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayData {
  date: string
  xpEarned: number
  lessonsCompleted: number
  froze: boolean
  active: boolean
}

interface StreakCalendarProps {
  history: DayData[]
  currentStreak: number
  longestStreak: number
  className?: string
}

export function StreakCalendar({
  history,
  currentStreak,
  longestStreak,
  className,
}: StreakCalendarProps) {
  // Create a map of date -> data
  const historyMap = useMemo(() => {
    const map = new Map<string, DayData>()
    history.forEach(day => map.set(day.date, day))
    return map
  }, [history])

  // Generate last 7 weeks of days
  const weeks = useMemo(() => {
    const result: { date: Date; data: DayData | null }[][] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from 7 weeks ago, on Sunday
    const start = new Date(today)
    start.setDate(start.getDate() - 49 + (7 - start.getDay()))

    let currentWeek: { date: Date; data: DayData | null }[] = []

    for (let i = 0; i < 49; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      const dateStr = date.toISOString().split('T')[0] ?? ''
      const data = historyMap.get(dateStr) ?? null

      currentWeek.push({ date, data })

      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    return result
  }, [historyMap])

  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={cn('bg-gray-800/50 rounded-xl p-4', className)}>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="text-white font-bold">{currentStreak}</span>
          <span className="text-gray-400 text-sm">aktuální streak</span>
        </div>
        <div className="text-gray-400 text-sm">
          Nejdelší: <span className="text-white font-semibold">{longestStreak}</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs text-gray-500">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map(({ date, data }, dayIdx) => {
              const isToday = date.getTime() === today.getTime()
              const isFuture = date > today
              const isActive = data?.active ?? false
              const froze = data?.froze ?? false

              return (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                  className={cn(
                    'aspect-square rounded-sm flex items-center justify-center relative',
                    isFuture
                      ? 'bg-gray-700/30'
                      : isActive
                        ? 'bg-gradient-to-br from-orange-500 to-red-500'
                        : froze
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gray-700/50',
                    isToday && 'ring-2 ring-white/50'
                  )}
                  title={`${date.toLocaleDateString('cs-CZ')}${
                    data ? ` - ${data.xpEarned} XP` : ''
                  }`}
                >
                  {froze && !isActive && <Snowflake className="w-3 h-3 text-white/80" />}
                  {isActive && data && data.xpEarned > 100 && (
                    <Flame className="w-3 h-3 text-yellow-300" />
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-orange-500 to-red-500" />
          <span>Aktivní</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-500" />
          <span>Freeze</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-700/50" />
          <span>Neaktivní</span>
        </div>
      </div>
    </div>
  )
}
