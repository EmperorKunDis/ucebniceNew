'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrueFalseProps {
  statement: string
  onAnswer: (selected: boolean) => void
  disabled?: boolean
}

export function TrueFalse({ statement, onAnswer, disabled = false }: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null)

  const handleSelect = (value: boolean) => {
    if (disabled || selected !== null) return
    setSelected(value)
    onAnswer(value)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 rounded-xl bg-gray-800 p-6">
        <p className="text-center text-xl text-white">{statement}</p>
      </div>

      <div className="grid grid-cols-2 gap-4" role="group" aria-label="Pravda nebo nepravda">
        {[true, false].map(value => {
          const isSelected = selected === value
          const Icon = value ? ThumbsUp : ThumbsDown

          return (
            <motion.button
              key={String(value)}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={disabled || selected !== null}
              aria-pressed={isSelected}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                isSelected
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-indigo-400 hover:bg-indigo-900/20',
                (disabled || selected !== null) && 'cursor-default'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: value ? 0 : 0.1 }}
              whileHover={!disabled && selected === null ? { scale: 1.05 } : {}}
              whileTap={!disabled && selected === null ? { scale: 0.95 } : {}}
            >
              <Icon className={cn('h-10 w-10', value ? 'text-green-400' : 'text-red-400')} />
              <span className="text-lg font-semibold text-white">
                {value ? 'Pravda' : 'Nepravda'}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
