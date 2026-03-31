'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FillInBlankProps {
  /** Text with ___ as placeholder for blanks */
  text: string
  /** Correct answers for each blank */
  answers: string[]
  /** Alternative accepted answers */
  alternatives?: string[][]
  onAnswer: (userAnswers: string[], isCorrect: boolean) => void
  disabled?: boolean
  caseSensitive?: boolean
}

export function FillInBlank({
  text,
  answers,
  alternatives = [],
  onAnswer,
  disabled = false,
  caseSensitive = false,
}: FillInBlankProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(answers.length).fill(''))
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Split text by blanks
  const parts = text.split('___')

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const checkAnswer = (userAnswer: string, index: number): boolean => {
    const normalize = (s: string) => (caseSensitive ? s.trim() : s.trim().toLowerCase())

    const correctAnswer = normalize(answers[index] ?? '')
    const userNormalized = normalize(userAnswer)

    if (userNormalized === correctAnswer) return true

    // Check alternatives
    const alts = alternatives[index] ?? []
    return alts.some(alt => normalize(alt) === userNormalized)
  }

  const handleInputChange = (value: string, index: number) => {
    if (disabled || submitted) return
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (index < answers.length - 1) {
        inputRefs.current[index + 1]?.focus()
      } else {
        handleSubmit()
      }
    } else if (e.key === 'Tab' && !e.shiftKey && index === answers.length - 1) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (submitted || disabled) return

    const checkResults = userAnswers.map((answer, i) => checkAnswer(answer, i))
    setResults(checkResults)
    setSubmitted(true)

    const allCorrect = checkResults.every(Boolean)
    onAnswer(userAnswers, allCorrect)
  }

  let blankIndex = 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Text with blanks */}
      <div className="text-lg text-white leading-relaxed mb-6 p-4 bg-gray-800 rounded-xl">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block mx-1 align-middle">
                <motion.input
                  ref={el => {
                    inputRefs.current[blankIndex] = el
                  }}
                  type="text"
                  value={userAnswers[blankIndex]}
                  onChange={e => handleInputChange(e.target.value, blankIndex)}
                  onKeyDown={e => handleKeyDown(e, blankIndex)}
                  disabled={disabled || submitted}
                  className={cn(
                    'w-32 px-2 py-1 rounded-lg text-center font-mono',
                    'border-2 transition-all outline-none',
                    !submitted && 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500',
                    submitted &&
                      results[blankIndex] &&
                      'bg-green-900/50 border-green-500 text-green-100',
                    submitted && !results[blankIndex] && 'bg-red-900/50 border-red-500 text-red-100'
                  )}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: blankIndex++ * 0.1 }}
                />
                {submitted && (
                  <span className="inline-flex items-center ml-1">
                    {results[blankIndex - 1] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-green-400 text-sm ml-1">
                        ({answers[blankIndex - 1]})
                      </span>
                    )}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Submit button */}
      {!submitted && (
        <motion.button
          onClick={handleSubmit}
          disabled={disabled || userAnswers.some(a => !a.trim())}
          className={cn(
            'w-full py-3 rounded-xl font-semibold transition-all',
            'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
            'hover:from-indigo-600 hover:to-purple-600',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Zkontrolovat
        </motion.button>
      )}
    </div>
  )
}
