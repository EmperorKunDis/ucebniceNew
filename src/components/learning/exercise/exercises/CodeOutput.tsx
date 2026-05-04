'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeOutputProps {
  /** The code to display */
  code: string
  /** Programming language for syntax highlighting hint */
  language?: string
  /** Question about what the code outputs */
  question: string
  /** Possible output options */
  options: string[]
  /** Index of correct option */
  correctIndex: number
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void
  disabled?: boolean
}

export function CodeOutput({
  code,
  language = 'python',
  question,
  options,
  correctIndex,
  onAnswer,
  disabled = false,
}: CodeOutputProps) {
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
      {/* Code block */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-xl border-b border-gray-700">
          <span className="text-gray-400 text-sm font-mono">{language}</span>
          <span className="text-xs text-gray-500">Co vypíše tento kód?</span>
        </div>
        <pre className="bg-gray-900 p-4 rounded-b-xl overflow-x-auto">
          <code className="text-sm text-green-400 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>

      {/* Question */}
      <p className="text-white text-center mb-4">{question}</p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const state = getOptionState(index)

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={disabled || answered}
              className={cn(
                'p-4 rounded-xl border-2 transition-all relative',
                'font-mono text-sm',
                state === 'default' &&
                  'bg-gray-800 border-gray-700 text-gray-100 hover:border-indigo-400',
                state === 'correct' && 'bg-green-900/30 border-green-500 text-green-100',
                state === 'incorrect' && 'bg-red-900/30 border-red-500 text-red-100',
                (disabled || answered) && 'cursor-default'
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled && !answered ? { scale: 1.05 } : {}}
              whileTap={!disabled && !answered ? { scale: 0.95 } : {}}
            >
              <pre className="whitespace-pre-wrap text-center">{option}</pre>

              {/* Feedback icon */}
              {answered && (state === 'correct' || state === 'incorrect') && (
                <motion.div
                  className={cn(
                    'absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center',
                    state === 'correct' && 'bg-green-500',
                    state === 'incorrect' && 'bg-red-500'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {state === 'correct' ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <X className="w-3 h-3 text-white" />
                  )}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
