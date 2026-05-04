'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrueFalseProps {
  statement: string
  isTrue: boolean
  onAnswer: (selected: boolean, isCorrect: boolean) => void
  disabled?: boolean
}

export function TrueFalse({ statement, isTrue, onAnswer, disabled = false }: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (value: boolean) => {
    if (disabled || answered) return

    setSelected(value)
    setAnswered(true)
    const isCorrect = value === isTrue
    onAnswer(value, isCorrect)
  }

  const getButtonState = (value: boolean) => {
    if (!answered) return 'default'
    if (value === isTrue) return 'correct'
    if (value === selected && value !== isTrue) return 'incorrect'
    return 'default'
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Statement */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <p className="text-xl text-white text-center">{statement}</p>
      </div>

      {/* True/False buttons */}
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map(value => {
          const state = getButtonState(value)
          const Icon = value ? ThumbsUp : ThumbsDown
          const FeedbackIcon = state === 'correct' ? Check : state === 'incorrect' ? X : null

          return (
            <motion.button
              key={String(value)}
              onClick={() => handleSelect(value)}
              disabled={disabled || answered}
              className={cn(
                'p-6 rounded-xl border-2 transition-all relative',
                'flex flex-col items-center gap-3',
                state === 'default' &&
                  'bg-gray-800 border-gray-700 hover:border-indigo-400 hover:bg-indigo-900/20',
                state === 'correct' && 'bg-green-900/30 border-green-500',
                state === 'incorrect' && 'bg-red-900/30 border-red-500',
                (disabled || answered) && 'cursor-default'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: value ? 0 : 0.1 }}
              whileHover={!disabled && !answered ? { scale: 1.05 } : {}}
              whileTap={!disabled && !answered ? { scale: 0.95 } : {}}
            >
              <Icon
                className={cn(
                  'w-10 h-10',
                  state === 'default' && (value ? 'text-green-400' : 'text-red-400'),
                  state === 'correct' && 'text-green-400',
                  state === 'incorrect' && 'text-red-400'
                )}
              />
              <span
                className={cn(
                  'text-lg font-semibold',
                  state === 'default' && 'text-white',
                  state === 'correct' && 'text-green-100',
                  state === 'incorrect' && 'text-red-100'
                )}
              >
                {value ? 'Pravda' : 'Nepravda'}
              </span>

              {/* Feedback icon */}
              {FeedbackIcon && (
                <motion.div
                  className={cn(
                    'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                    state === 'correct' && 'bg-green-500',
                    state === 'incorrect' && 'bg-red-500'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <FeedbackIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
