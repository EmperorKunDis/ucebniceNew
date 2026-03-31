'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

export function LevelBadge({ level, size = 'md', animate = false, className }: LevelBadgeProps) {
  // Color gradient based on level
  const getGradient = () => {
    if (level >= 50) return 'from-purple-400 via-pink-500 to-red-500' // Legendary
    if (level >= 30) return 'from-yellow-400 via-orange-500 to-red-500' // Master
    if (level >= 20) return 'from-cyan-400 via-blue-500 to-indigo-500' // Expert
    if (level >= 10) return 'from-green-400 via-emerald-500 to-teal-500' // Intermediate
    return 'from-gray-400 via-gray-500 to-gray-600' // Beginner
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-14 h-14 text-xl',
  }

  const Component = animate ? motion.div : 'div'
  const animationProps = animate
    ? {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity },
      }
    : {}

  return (
    <Component
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shadow-lg',
        `bg-gradient-to-br ${getGradient()}`,
        sizeClasses[size],
        className
      )}
      {...animationProps}
    >
      {level}
    </Component>
  )
}
