'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  iconColor?: string
  className?: string
  delay?: number
}

export const StatCard = memo(function StatCard({
  icon,
  value,
  label,
  iconColor = 'text-purple-400',
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn('relative group', className)}
    >
      {/* Background layer */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-purple-500/30 transition-all duration-300" />

      {/* Content layer */}
      <div className="relative p-6 text-center">
        <div className={cn('w-8 h-8 mx-auto mb-2', iconColor)}>{icon}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </motion.div>
  )
})
