'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MultipleChoiceProps {
  question: string
  options: string[]
  onAnswer: (selectedIndex: number) => void
  disabled?: boolean
}

export function MultipleChoice({
  question,
  options,
  onAnswer,
  disabled = false,
}: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (disabled || selectedIndex !== null) return
    setSelectedIndex(index)
    onAnswer(index)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h3 className="mb-6 text-center text-xl font-semibold text-white">{question}</h3>

      <div className="space-y-3" role="group" aria-label="Možnosti odpovědi">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index

          return (
            <motion.button
              key={`${index}-${option}`}
              type="button"
              onClick={() => handleSelect(index)}
              disabled={disabled || selectedIndex !== null}
              aria-pressed={isSelected}
              className={cn(
                'relative w-full rounded-xl border-2 p-4 text-left text-white transition-all',
                isSelected
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-indigo-400 hover:bg-indigo-900/20',
                (disabled || selectedIndex !== null) && 'cursor-default'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={!disabled && selectedIndex === null ? { scale: 1.02 } : {}}
              whileTap={!disabled && selectedIndex === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'
                  )}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
