'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FillInBlankProps {
  text: string
  onAnswer: (userAnswers: string[]) => void
  disabled?: boolean
}

export function FillInBlank({ text, onAnswer, disabled = false }: FillInBlankProps) {
  const parts = text.split('___')
  const blankCount = Math.max(0, parts.length - 1)
  const [userAnswers, setUserAnswers] = useState<string[]>(() =>
    Array.from({ length: blankCount }, () => '')
  )
  const [submitted, setSubmitted] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (value: string, index: number) => {
    if (disabled || submitted) return
    setUserAnswers(answers => answers.map((answer, i) => (i === index ? value : answer)))
  }

  const handleSubmit = () => {
    if (submitted || disabled || userAnswers.some(answer => !answer.trim())) return
    setSubmitted(true)
    onAnswer(userAnswers)
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'Enter') return
    event.preventDefault()

    if (index < blankCount - 1) {
      inputRefs.current[index + 1]?.focus()
    } else {
      handleSubmit()
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 rounded-xl bg-gray-800 p-4 text-lg leading-relaxed text-white">
        {parts.map((part, index) => (
          <span key={`${index}-${part.slice(0, 12)}`}>
            {part}
            {index < blankCount && (
              <motion.input
                ref={element => {
                  inputRefs.current[index] = element
                }}
                type="text"
                value={userAnswers[index] ?? ''}
                onChange={event => handleInputChange(event.target.value, index)}
                onKeyDown={event => handleKeyDown(event, index)}
                disabled={disabled || submitted}
                aria-label={`Doplň chybějící část ${index + 1}`}
                className={cn(
                  'mx-1 inline-block w-32 rounded-lg border-2 px-2 py-1 text-center font-mono outline-none transition-all',
                  'border-gray-600 bg-gray-700 text-white focus:border-indigo-500',
                  submitted && 'border-indigo-400 bg-indigo-500/20'
                )}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
              />
            )}
          </span>
        ))}
      </div>

      {blankCount === 0 ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Toto cvičení neobsahuje žádné doplňovací pole.
        </p>
      ) : (
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || submitted || userAnswers.some(answer => !answer.trim())}
          className={cn(
            'w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold text-white transition-all',
            'hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Odeslat odpověď
        </motion.button>
      )}
    </div>
  )
}
