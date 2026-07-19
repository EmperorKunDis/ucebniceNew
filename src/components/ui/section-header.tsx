'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  children: React.ReactNode
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
  delay?: number
}

export function SectionHeader({
  children,
  subtitle,
  align = 'center',
  className,
  delay = 0,
}: SectionHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
  }

  return (
    <div className={cn(alignClasses[align], className)}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-4"
      >
        <span className="bg-gradient-to-r from-[#44d8ed] via-[#b371ff] to-[#ed6be8] bg-clip-text text-transparent">
          {children}
        </span>
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
