'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Infinity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeartDisplayProps {
  hearts: number
  maxHearts: number
  nextRegenAt: string | null
  unlimitedUntil: string | null
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export function HeartDisplay({
  hearts,
  maxHearts,
  nextRegenAt,
  unlimitedUntil,
  size = 'md',
  onClick,
  className,
}: HeartDisplayProps) {
  const [timeUntilRegen, setTimeUntilRegen] = useState<string | null>(null)
  const isUnlimited = unlimitedUntil && new Date(unlimitedUntil) > new Date()

  // Timer for next heart regeneration
  useEffect(() => {
    if (!nextRegenAt || isUnlimited) {
      setTimeUntilRegen(null)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const regenTime = new Date(nextRegenAt).getTime()
      const diff = regenTime - now

      if (diff <= 0) {
        setTimeUntilRegen(null)
        return
      }

      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      if (hours > 0) {
        setTimeUntilRegen(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeUntilRegen(`${minutes}m ${seconds}s`)
      } else {
        setTimeUntilRegen(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [nextRegenAt, isUnlimited])

  const sizeClasses = {
    sm: { heart: 'w-4 h-4', text: 'text-xs', container: 'gap-0.5' },
    md: { heart: 'w-5 h-5', text: 'text-sm', container: 'gap-1' },
    lg: { heart: 'w-6 h-6', text: 'text-base', container: 'gap-1.5' },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'flex items-center cursor-pointer hover:opacity-80 transition-opacity',
        sizes.container,
        className
      )}
      onClick={onClick}
    >
      {isUnlimited ? (
        <>
          <div className="relative">
            <Heart className={cn(sizes.heart, 'text-red-500 fill-red-500')} />
            <Infinity className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-400" />
          </div>
          <span className={cn(sizes.text, 'text-red-400 font-bold')}>∞</span>
        </>
      ) : (
        <>
          <div className={cn('flex', sizes.container)}>
            <AnimatePresence mode="popLayout">
              {Array.from({ length: maxHearts }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Heart
                    className={cn(
                      sizes.heart,
                      i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-600 fill-gray-600/20'
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {timeUntilRegen && hearts < maxHearts && (
            <span className={cn(sizes.text, 'text-gray-400 ml-1')}>{timeUntilRegen}</span>
          )}
        </>
      )}
    </div>
  )
}
