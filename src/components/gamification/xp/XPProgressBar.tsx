'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface XPProgressBarProps {
  currentXP: number
  level: number
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Calculate XP thresholds for a level
function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

function getXPForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

export function XPProgressBar({
  currentXP,
  level,
  showLabels = true,
  size = 'md',
  className,
}: XPProgressBarProps) {
  const levelStart = getXPForLevel(level)
  const levelEnd = getXPForNextLevel(level)
  const xpInLevel = currentXP - levelStart
  const xpNeeded = levelEnd - levelStart
  const progress = Math.min(100, (xpInLevel / xpNeeded) * 100)

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm' },
    lg: { bar: 'h-3', text: 'text-base' },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className={cn('flex justify-between mb-1', sizes.text)}>
          <span className="text-gray-400">
            Level {level} → {level + 1}
          </span>
          <span className="text-gray-300">
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
      )}

      <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', sizes.bar)}>
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
