'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultipleChoiceProps {
  question: string
  options: string[]
  correctIndex: number
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void
  disabled?: boolean
  showFeedback?: boolean
}

export function MultipleChoice({
  question,
  options,
  correctIndex,
  onAnswer,
  disabled = false,
  showFeedback = true,
}: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (index: number) => {
    if (disabled || answered) return

    setSelectedIndex(index)
    setAnswered(true)
    const isCorrect = index === correctIndex
    onAnswer(index, isCorrect)
  }

  const getOptionState = (index: number) => {
    if (!answered) return 'default'
    if (index === correctIndex) return 'correct'
    if (index === selectedIndex && index !== correctIndex) return 'incorrect'
    return 'default'
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question */}
      <h3 className="text-xl font-semibold text-white mb-6 text-center">{question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const state = getOptionState(index)

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={disabled || answered}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all relative',
                'hover:border-indigo-400 hover:bg-indigo-900/20',
                state === 'default' && 'bg-gray-800 border-gray-700 text-white',
                state === 'correct' && 'bg-green-900/30 border-green-500 text-green-100',
                state === 'incorrect' && 'bg-red-900/30 border-red-500 text-red-100',
                (disabled || answered) &&
                  'cursor-default hover:border-gray-700 hover:bg-transparent'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled && !answered ? { scale: 1.02 } : {}}
              whileTap={!disabled && !answered ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                {/* Option letter */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                    state === 'default' && 'bg-gray-700 text-gray-300',
                    state === 'correct' && 'bg-green-500 text-white',
                    state === 'incorrect' && 'bg-red-500 text-white'
                  )}
                >
                  {showFeedback && state === 'correct' ? (
                    <Check className="w-4 h-4" />
                  ) : showFeedback && state === 'incorrect' ? (
                    <X className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + index) // A, B, C, D
                  )}
                </div>

                {/* Option text */}
                <span className="flex-1">{option}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
