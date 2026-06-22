'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakDisplayProps {
  streak: number
  isEndangered?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onClick?: () => void
  className?: string
}

export function StreakDisplay({
  streak,
  isEndangered = false,
  size = 'md',
  showLabel = false,
  onClick,
  className,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: { flame: 'w-4 h-4', text: 'text-sm', container: 'gap-0.5' },
    md: { flame: 'w-5 h-5', text: 'text-base', container: 'gap-1' },
    lg: { flame: 'w-7 h-7', text: 'text-xl', container: 'gap-1.5' },
  }

  const sizes = sizeClasses[size]

  // Milestone colors
  const getStreakColor = () => {
    if (streak >= 365) return 'text-purple-400'
    if (streak >= 100) return 'text-cyan-400'
    if (streak >= 30) return 'text-yellow-400'
    if (streak >= 7) return 'text-orange-400'
    return 'text-orange-500'
  }

  return (
    <div
      className={cn(
        'flex items-center cursor-pointer hover:opacity-80 transition-opacity',
        sizes.container,
        className
      )}
      onClick={onClick}
    >
      <motion.div
        className="relative"
        animate={
          isEndangered
            ? { scale: [1, 1.1, 1], rotate: [-5, 5, -5, 0] }
            : streak > 0
              ? { scale: [1, 1.05, 1] }
              : {}
        }
        transition={{
          duration: isEndangered ? 0.5 : 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <Flame
          className={cn(
            sizes.flame,
            streak > 0 ? getStreakColor() : 'text-gray-500',
            streak > 0 && 'fill-current'
          )}
        />
        {isEndangered && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>

      <span
        className={cn(sizes.text, 'font-bold', streak > 0 ? getStreakColor() : 'text-gray-500')}
      >
        {streak}
      </span>

      {showLabel && (
        <span className={cn('text-gray-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {streak === 1 ? 'den' : streak >= 2 && streak <= 4 ? 'dny' : 'dní'}
        </span>
      )}
    </div>
  )
}
