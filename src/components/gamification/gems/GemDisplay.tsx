'use client'

import { cn } from '@/lib/utils'

interface GemDisplayProps {
  gems: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function GemDisplay({ gems, size = 'md', showIcon = true, className }: GemDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-semibold text-cyan-400',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className={cn('flex-shrink-0', iconSizes[size])}>💎</span>}
      <span>{gems.toLocaleString()}</span>
    </div>
  )
}
