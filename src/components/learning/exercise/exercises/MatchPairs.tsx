'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SubmittedPair {
  left: string
  right: string
}

interface MatchPairsProps {
  leftItems: string[]
  rightItems: string[]
  onAnswer: (matches: SubmittedPair[]) => void
  disabled?: boolean
}

export function MatchPairs({ leftItems, rightItems, onAnswer, disabled = false }: MatchPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Map<number, number>>(new Map())
  const [submitted, setSubmitted] = useState(false)

  const handleLeftClick = useCallback(
    (index: number) => {
      if (disabled || submitted || matches.has(index)) return
      setSelectedLeft(index)
    },
    [disabled, matches, submitted]
  )

  const submitMatches = useCallback(
    (finalMatches: Map<number, number>) => {
      if (submitted) return

      const answer = [...finalMatches.entries()].flatMap(([leftIndex, rightIndex]) => {
        const left = leftItems[leftIndex]
        const right = rightItems[rightIndex]
        return left === undefined || right === undefined ? [] : [{ left, right }]
      })

      setSubmitted(true)
      onAnswer(answer)
    },
    [leftItems, onAnswer, rightItems, submitted]
  )

  const handleRightClick = useCallback(
    (rightIndex: number) => {
      if (disabled || submitted || selectedLeft === null) return
      if ([...matches.values()].includes(rightIndex)) return

      const nextMatches = new Map(matches)
      nextMatches.set(selectedLeft, rightIndex)
      setMatches(nextMatches)
      setSelectedLeft(null)

      if (nextMatches.size === leftItems.length) {
        window.setTimeout(() => submitMatches(nextMatches), 250)
      }
    },
    [disabled, leftItems.length, matches, selectedLeft, submitMatches, submitted]
  )

  const matchedRightLabel = (leftIndex: number) => {
    const rightIndex = matches.get(leftIndex)
    return rightIndex === undefined ? null : rightItems[rightIndex]
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h3 className="mb-6 text-center text-lg text-white">Spoj správné páry</h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <div className="space-y-3" aria-label="Levá strana párů">
          {leftItems.map((leftItem, index) => {
            const isMatched = matches.has(index)
            const isSelected = selectedLeft === index

            return (
              <motion.button
                key={`${index}-${leftItem}`}
                type="button"
                onClick={() => handleLeftClick(index)}
                disabled={disabled || submitted || isMatched}
                aria-pressed={isSelected}
                className={cn(
                  'relative w-full rounded-xl border-2 p-4 text-left transition-all',
                  !isMatched &&
                    !isSelected &&
                    'border-gray-700 bg-gray-800 hover:border-indigo-400',
                  isSelected && 'border-indigo-500 bg-indigo-900/50 ring-2 ring-indigo-400/50',
                  isMatched && 'border-gray-600 bg-gray-700 opacity-70'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <span className="text-white">{leftItem}</span>
                {isMatched && (
                  <span className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    {matchedRightLabel(index)}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="space-y-3" aria-label="Pravá strana párů">
          {rightItems.map((rightItem, index) => {
            const isMatched = [...matches.values()].includes(index)

            return (
              <motion.button
                key={`${index}-${rightItem}`}
                type="button"
                onClick={() => handleRightClick(index)}
                disabled={disabled || submitted || isMatched || selectedLeft === null}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  !isMatched && 'border-gray-700 bg-gray-800',
                  !isMatched &&
                    selectedLeft !== null &&
                    'hover:border-indigo-400 hover:bg-indigo-900/20',
                  isMatched && 'border-gray-600 bg-gray-700 opacity-70',
                  selectedLeft === null && !isMatched && 'cursor-default'
                )}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <span className="text-white">{rightItem}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {matches.size > 0 && !submitted && (
        <motion.button
          type="button"
          onClick={() => {
            setMatches(new Map())
            setSelectedLeft(null)
          }}
          className="mx-auto mt-6 block text-sm text-gray-400 underline hover:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Resetovat páry
        </motion.button>
      )}
    </div>
  )
}
