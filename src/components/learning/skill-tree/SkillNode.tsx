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
  const isLocked = status === 'locked'
  const statusLabel =
    status === 'completed' ? 'dokončeno' : status === 'active' ? 'aktivní' : 'zamčeno'
  const tooltipId = `skill-node-${node.id}-tooltip`

  // Colors based on status
  // Design system: success green marks completion, violet marks the one
  // actionable node, locked stays quiet.
  const statusStyles = {
    completed: {
      bg: 'bg-gradient-to-br from-[#43d69a] to-[#2fae7b]',
      border: 'border-[#7ee6bd]',
      shadow: 'shadow-[#43d69a]/50',
      ring: 'ring-[#43d69a]/50',
    },
    active: {
      bg: 'bg-gradient-to-br from-[#846bff] to-[#5234e8]',
      border: 'border-[#a895ff]',
      shadow: 'shadow-[#6747ff]/50',
      ring: 'ring-[#a895ff]/50',
    },
    locked: {
      bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
      border: 'border-gray-400',
      shadow: 'shadow-gray-400/30',
      ring: 'ring-gray-400/30',
    },
  }

  const styles = statusStyles[status]

  // Modules walk the learning gradient (cyan → magenta): the colour of the
  // path itself tells how far in the course you are.
  const moduleColors = [
    'from-[#44d8ed] to-[#2fa8c9]',
    'from-[#5d9cff] to-[#3f74d6]',
    'from-[#846bff] to-[#5234e8]',
    'from-[#b371ff] to-[#8a46d9]',
    'from-[#ed6be8] to-[#c247bd]',
    'from-[#6747ff] to-[#4a2fd0]',
    'from-[#44d8ed] to-[#3f74d6]',
    'from-[#b371ff] to-[#c247bd]',
  ]

  const moduleColor =
    status === 'locked'
      ? 'from-gray-500 to-gray-700'
      : moduleColors[(node.module - 1) % moduleColors.length]

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      data-chapter={node.id}
      data-locked={isLocked ? 'true' : 'false'}
      data-stars={stars}
      aria-label={`Kapitola ${node.id}: ${title}, ${statusLabel}, ${stars} ze 3 hvězd`}
      aria-pressed={isSelected}
      aria-describedby={tooltipId}
      className={cn(
        'group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full text-left',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/70 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-900',
        isLocked && 'cursor-not-allowed opacity-60'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: node.order * 0.05 }}
      whileHover={!isLocked ? { scale: 1.1 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onClick={() => !isLocked && onClick?.(node)}
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
          <Lock className="w-6 h-6 text-gray-300" aria-hidden="true" />
        ) : status === 'completed' ? (
          <CheckCircle className="w-7 h-7 text-white" aria-hidden="true" />
        ) : (
          <Play className="w-6 h-6 text-white ml-1" aria-hidden="true" />
        )}

        {/* Progress ring for active nodes */}
        {status === 'active' && node.progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
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
          'whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity',
          'pointer-events-none'
        )}
        id={tooltipId}
        role="tooltip"
      >
        {title}
      </div>
    </motion.button>
  )
}
