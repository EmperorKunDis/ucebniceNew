'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface XPCounterProps {
  value: number
  previousValue?: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

export function XPCounter({
  value,
  previousValue,
  size = 'md',
  animate = true,
  className,
}: XPCounterProps) {
  const [displayValue, setDisplayValue] = useState(previousValue ?? value)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!animate || previousValue === undefined || previousValue === value) {
      setDisplayValue(value)
      return
    }

    const startValue = previousValue
    const endValue = value
    const duration = Math.min(1500, Math.abs(endValue - startValue) * 10)
    const startTime = Date.now()

    const animateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue)
      }
    }

    animationRef.current = requestAnimationFrame(animateValue)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, previousValue, animate])

  const sizeClasses = {
    sm: { star: 'w-4 h-4', text: 'text-sm' },
    md: { star: 'w-5 h-5', text: 'text-base' },
    lg: { star: 'w-6 h-6', text: 'text-lg' },
  }

  const sizes = sizeClasses[size]
  const isGaining = previousValue !== undefined && value > previousValue

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <motion.div
        animate={isGaining ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Star className={cn(sizes.star, 'text-yellow-400 fill-yellow-400')} />
      </motion.div>
      <motion.span
        className={cn(sizes.text, 'font-bold text-white tabular-nums')}
        animate={isGaining ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
    </div>
  )
}
