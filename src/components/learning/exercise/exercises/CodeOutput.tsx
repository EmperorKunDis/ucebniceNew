'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CodeOutputProps {
  code: string
  language?: string
  question: string
  options: string[]
  onAnswer: (selectedIndex: number) => void
  disabled?: boolean
}

export function CodeOutput({
  code,
  language = 'python',
  question,
  options,
  onAnswer,
  disabled = false,
}: CodeOutputProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (disabled || selectedIndex !== null) return
    setSelectedIndex(index)
    onAnswer(index)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between rounded-t-xl border-b border-gray-700 bg-gray-900 px-4 py-2">
          <span className="font-mono text-sm text-gray-400">{language}</span>
          <span className="text-xs text-gray-500">Co vypíše tento kód?</span>
        </div>
        <pre className="overflow-x-auto rounded-b-xl bg-gray-900 p-4">
          <code className="whitespace-pre font-mono text-sm text-green-400">{code}</code>
        </pre>
      </div>

      <p className="mb-4 text-center text-white">{question}</p>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="group"
        aria-label="Možné výstupy"
      >
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
                'relative rounded-xl border-2 p-4 font-mono text-sm transition-all',
                isSelected
                  ? 'border-indigo-400 bg-indigo-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-100 hover:border-indigo-400',
                (disabled || selectedIndex !== null) && 'cursor-default'
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              whileHover={!disabled && selectedIndex === null ? { scale: 1.05 } : {}}
              whileTap={!disabled && selectedIndex === null ? { scale: 0.95 } : {}}
            >
              <pre className="whitespace-pre-wrap text-center">{option}</pre>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
