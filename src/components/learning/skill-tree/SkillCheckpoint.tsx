'use client'

import { motion } from 'framer-motion'
import { Trophy, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Module {
  id: number
  name: string
  chaptersRange: string[]
}

interface SkillCheckpointProps {
  module: Module
  position: { x: number; y: number }
  isUnlocked: boolean
  isCompleted: boolean
  completedChapters: number
  totalChapters: number
  onClick?: () => void
}

export function SkillCheckpoint({
  module,
  position,
  isUnlocked,
  isCompleted,
  completedChapters,
  totalChapters,
  onClick,
}: SkillCheckpointProps) {
  const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0

  return (
    <motion.div
      className={cn(
        'absolute transform -translate-x-1/2',
        'flex flex-col items-center gap-2',
        !isUnlocked && 'opacity-50'
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: module.id * 0.15 }}
    >
      {/* Module banner */}
      <div
        className={cn(
          'relative px-6 py-2 rounded-full',
          'flex items-center gap-2',
          'text-sm font-semibold',
          isCompleted
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
            : isUnlocked
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-gray-700 text-gray-400',
          isUnlocked && 'cursor-pointer hover:scale-105 transition-transform'
        )}
        onClick={isUnlocked ? onClick : undefined}
      >
        {isCompleted ? (
          <Trophy className="w-4 h-4" />
        ) : !isUnlocked ? (
          <Lock className="w-4 h-4" />
        ) : null}

        <span>
          Modul {module.id}: {module.name}
        </span>
      </div>

      {/* Progress bar */}
      {isUnlocked && (
        <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isCompleted
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400'
                : 'bg-gradient-to-r from-indigo-400 to-purple-400'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </div>
      )}

      {/* Chapter count */}
      <span className="text-xs text-gray-400">
        {completedChapters}/{totalChapters} kapitol
      </span>
    </motion.div>
  )
}
