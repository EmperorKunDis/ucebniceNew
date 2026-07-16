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
      <button
        type="button"
        disabled={!isUnlocked || !onClick}
        aria-label={`Modul ${module.id}: ${module.name}, ${completedChapters} z ${totalChapters} kapitol${isCompleted ? ', dokončeno' : !isUnlocked ? ', zamčeno' : ''}`}
        className={cn(
          'relative px-6 py-2 rounded-full',
          'flex items-center gap-2',
          'text-sm font-semibold',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/70 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-900',
          isCompleted
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
            : isUnlocked
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-gray-700 text-gray-400',
          isUnlocked && onClick && 'cursor-pointer hover:scale-105 transition-transform',
          (!isUnlocked || !onClick) && 'cursor-default'
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
      </button>

      {/* Progress bar */}
      {isUnlocked && (
        <div
          className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-label={`Pokrok modulu ${module.id}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
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
