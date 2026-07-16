'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, BookOpen, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  conceptName: string
  conceptDescription: string | null
  chapterTitle: string
  difficulty: {
    easeFactor: number
    interval: number
    repetitions: number
    lastRating: string | null
  }
  hasExercise: boolean
  onPractice: () => void
  onRate: (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => void
  disabled?: boolean
}

export function ReviewCard({
  conceptName,
  conceptDescription,
  chapterTitle,
  difficulty,
  hasExercise,
  onPractice,
  onRate,
  disabled = false,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false)

  const ratingButtons = [
    {
      rating: 'AGAIN' as const,
      label: 'Znovu',
      color: 'bg-red-500 hover:bg-red-600',
      interval: '1d',
    },
    {
      rating: 'HARD' as const,
      label: 'Těžké',
      color: 'bg-orange-500 hover:bg-orange-600',
      interval: `${Math.max(1, Math.round(difficulty.interval * 0.8))}d`,
    },
    {
      rating: 'GOOD' as const,
      label: 'Dobré',
      color: 'bg-green-500 hover:bg-green-600',
      interval: `${Math.round(difficulty.interval * difficulty.easeFactor)}d`,
    },
    {
      rating: 'EASY' as const,
      label: 'Snadné',
      color: 'bg-blue-500 hover:bg-blue-600',
      interval: `${Math.round(difficulty.interval * difficulty.easeFactor * 1.3)}d`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Card front */}
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: revealed ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="text-sm text-gray-400 mb-2">{chapterTitle}</div>
        <h2 className="text-2xl font-bold text-white mb-4">{conceptName}</h2>

        {!revealed ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Vzpomeň si na tento koncept...</p>
            <button
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ukázat odpověď
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="text-gray-200">{conceptDescription ?? 'Popis není k dispozici.'}</p>
            </div>

            {/* Practice button */}
            {hasExercise && (
              <button
                onClick={onPractice}
                className="w-full mb-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Procvičit s cvičením
              </button>
            )}

            {/* Difficulty info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-4">
              <span>Opakování: {difficulty.repetitions}×</span>
              <span>Interval: {difficulty.interval}d</span>
              <span>EF: {difficulty.easeFactor.toFixed(2)}</span>
            </div>

            {/* Rating buttons */}
            <div className="grid grid-cols-4 gap-2">
              {ratingButtons.map(btn => (
                <button
                  key={btn.rating}
                  disabled={disabled}
                  onClick={() => onRate(btn.rating)}
                  className={cn(
                    'py-3 rounded-lg text-white font-medium transition-colors',
                    btn.color,
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <div>{btn.label}</div>
                  <div className="text-xs opacity-80">{btn.interval}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Help text */}
      {revealed && (
        <motion.p
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Jak dobře jsi si vzpomněl? Vyber obtížnost.
        </motion.p>
      )}

      {/* Reset button */}
      {revealed && (
        <button
          onClick={() => setRevealed(false)}
          className="flex items-center gap-1 mx-auto text-gray-500 hover:text-gray-400 text-sm"
        >
          <RotateCcw className="w-3 h-3" />
          Skrýt
        </button>
      )}
    </div>
  )
}
