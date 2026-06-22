'use client'

import { motion } from 'framer-motion'
import { Lock, Star, CheckCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SkillNodeData {
  id: string
  title: string
  description?: string | null
  module: number
  order: number
  status: 'completed' | 'active' | 'locked'
  stars: number
  xpReward: number
  difficulty: string
  position: { x: number; y: number }
  prerequisites: string[]
  progress: number
  lessonsCompleted: number
  exercisesCorrect: number
  exercisesTotal: number
  reviewDue: number
}

interface SkillNodeProps {
  node: SkillNodeData
  onClick?: (node: SkillNodeData) => void
  isSelected?: boolean
}

export function SkillNode({ node, onClick, isSelected }: SkillNodeProps) {
  const { status, stars, title } = node

  // Colors based on status
  const statusStyles = {
    completed: {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      border: 'border-yellow-300',
      shadow: 'shadow-yellow-400/50',
      ring: 'ring-yellow-300/50',
    },
    active: {
      bg: 'bg-gradient-to-br from-green-400 to-green-600',
      border: 'border-green-300',
      shadow: 'shadow-green-400/50',
      ring: 'ring-green-300/50',
    },
    locked: {
      bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
      border: 'border-gray-400',
      shadow: 'shadow-gray-400/30',
      ring: 'ring-gray-400/30',
    },
  }

  const styles = statusStyles[status]

  // Module colors for variety
  const moduleColors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-indigo-500 to-indigo-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700',
    'from-red-500 to-red-700',
  ]

  const moduleColor =
    status === 'locked'
      ? 'from-gray-500 to-gray-700'
      : moduleColors[(node.module - 1) % moduleColors.length]

  return (
    <motion.div
      className={cn(
        'absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2',
        status === 'locked' && 'cursor-not-allowed opacity-60'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: node.order * 0.05 }}
      whileHover={status !== 'locked' ? { scale: 1.1 } : undefined}
      whileTap={status !== 'locked' ? { scale: 0.95 } : undefined}
      onClick={() => status !== 'locked' && onClick?.(node)}
    >
      {/* Glow effect for active */}
      {status === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400/30 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Main circle */}
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center',
          `bg-gradient-to-br ${moduleColor}`,
          'border-4',
          styles.border,
          'shadow-lg',
          styles.shadow,
          isSelected && `ring-4 ${styles.ring}`
        )}
      >
        {/* Icon based on status */}
        {status === 'locked' ? (
          <Lock className="w-6 h-6 text-gray-300" />
        ) : status === 'completed' ? (
          <CheckCircle className="w-7 h-7 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-1" />
        )}

        {/* Progress ring for active nodes */}
        {status === 'active' && node.progress > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${node.progress * 2.89} 289`}
            />
          </svg>
        )}
      </div>

      {/* Stars display */}
      {status === 'completed' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          {[1, 2, 3].map(starNum => (
            <Star
              key={starNum}
              className={cn(
                'w-4 h-4',
                starNum <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
              )}
            />
          ))}
        </div>
      )}

      {/* Chapter number badge */}
      <div
        className={cn(
          'absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          status === 'locked' ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-800'
        )}
      >
        {node.id}
      </div>

      {/* Review due badge */}
      {node.reviewDue > 0 && (
        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
          {node.reviewDue}
        </div>
      )}

      {/* Title tooltip on hover */}
      <div
        className={cn(
          'absolute top-full mt-2 left-1/2 -translate-x-1/2',
          'bg-gray-900/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded',
          'whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity',
          'pointer-events-none'
        )}
      >
        {title}
      </div>
    </motion.div>
  )
}
