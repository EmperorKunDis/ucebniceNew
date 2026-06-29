'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pair {
  left: string
  right: string
}

interface MatchPairsProps {
  pairs: Pair[]
  onAnswer: (matches: Map<number, number>, isCorrect: boolean) => void
  disabled?: boolean
}

export function MatchPairs({ pairs, onAnswer, disabled = false }: MatchPairsProps) {
  // Shuffle right side for display
  const [rightOrder] = useState<number[]>(() => {
    const indices = pairs.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = indices[i]!
      indices[i] = indices[j]!
      indices[j] = temp
    }
    return indices
  })

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Map<number, number>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Map<number, boolean>>(new Map())

  const handleLeftClick = useCallback(
    (index: number) => {
      if (disabled || submitted || matches.has(index)) return
      setSelectedLeft(index)
    },
    [disabled, submitted, matches]
  )

  const handleSubmit = useCallback(
    (finalMatches: Map<number, number>) => {
      if (submitted) return

      const newResults = new Map<number, boolean>()
      finalMatches.forEach((rightIndex, leftIndex) => {
        // Correct if left index matches the original right index (pairs[leftIndex].right === pairs[rightIndex].right)
        // Since pairs are in order, leftIndex should match rightIndex for correct pair
        newResults.set(leftIndex, leftIndex === rightIndex)
      })

      setResults(newResults)
      setSubmitted(true)

      const allCorrect = Array.from(newResults.values()).every(Boolean)
      onAnswer(finalMatches, allCorrect)
    },
    [submitted, onAnswer]
  )

  const handleRightClick = useCallback(
    (shuffledIndex: number) => {
      if (disabled || submitted || selectedLeft === null) return

      // Check if this right item is already matched
      const rightOriginalIndex = rightOrder[shuffledIndex] ?? 0
      const alreadyMatched = Array.from(matches.values()).includes(rightOriginalIndex)
      if (alreadyMatched) return

      const newMatches = new Map(matches)
      newMatches.set(selectedLeft, rightOriginalIndex)
      setMatches(newMatches)
      setSelectedLeft(null)

      // Auto-submit when all matched
      if (newMatches.size === pairs.length) {
        setTimeout(() => handleSubmit(newMatches), 500)
      }
    },
    [disabled, submitted, selectedLeft, matches, pairs.length, rightOrder, handleSubmit]
  )

  const isLeftMatched = (index: number) => matches.has(index)
  const isRightMatched = (originalIndex: number) =>
    Array.from(matches.values()).includes(originalIndex)

  const getMatchedRightForLeft = (leftIndex: number) => {
    const rightOriginalIndex = matches.get(leftIndex)
    if (rightOriginalIndex === undefined) return null
    return pairs[rightOriginalIndex]?.right ?? null
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-lg text-white text-center mb-6">Spoj správné páry</h3>

      <div className="grid grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const isMatched = isLeftMatched(index)
            const isSelected = selectedLeft === index
            const isCorrect = submitted && results.get(index)
            const isIncorrect = submitted && results.has(index) && !results.get(index)

            return (
              <motion.button
                key={`left-${index}`}
                onClick={() => handleLeftClick(index)}
                disabled={disabled || submitted || isMatched}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all text-left relative',
                  !isMatched &&
                    !isSelected &&
                    'bg-gray-800 border-gray-700 hover:border-indigo-400',
                  isSelected && 'bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-400/50',
                  isMatched && !submitted && 'bg-gray-700 border-gray-600 opacity-60',
                  isCorrect && 'bg-green-900/30 border-green-500',
                  isIncorrect && 'bg-red-900/30 border-red-500'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-white">{pair.left}</span>

                {isMatched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-400">
                    <Link2 className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{getMatchedRightForLeft(index)}</span>
                  </div>
                )}

                {submitted && (
                  <motion.div
                    className={cn(
                      'absolute -right-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center',
                      isCorrect && 'bg-green-500',
                      isIncorrect && 'bg-red-500'
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {isCorrect ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="space-y-3">
          {rightOrder.map((originalIndex, shuffledIndex) => {
            const pair = pairs[originalIndex]
            if (!pair) return null
            const isMatched = isRightMatched(originalIndex)

            return (
              <motion.button
                key={`right-${shuffledIndex}`}
                onClick={() => handleRightClick(shuffledIndex)}
                disabled={disabled || submitted || isMatched || selectedLeft === null}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all text-left',
                  !isMatched && 'bg-gray-800 border-gray-700',
                  !isMatched &&
                    selectedLeft !== null &&
                    'hover:border-indigo-400 hover:bg-indigo-900/20',
                  isMatched && 'bg-gray-700 border-gray-600 opacity-60',
                  selectedLeft === null && !isMatched && 'cursor-default'
                )}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: shuffledIndex * 0.1 }}
              >
                <span className="text-white">{pair.right}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Reset button if not all matched and not submitted */}
      {matches.size > 0 && !submitted && (
        <motion.button
          onClick={() => {
            setMatches(new Map())
            setSelectedLeft(null)
          }}
          className="mt-6 mx-auto block text-gray-400 hover:text-white text-sm underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Resetovat páry
        </motion.button>
      )}
    </div>
  )
}
