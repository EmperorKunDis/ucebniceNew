'use client'

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Lightbulb, Zap } from 'lucide-react'
import { GreySurface } from '@/components/ui/grey-surface'
import { Button } from '@/components/ui/button'
import { Question } from '@/data/questions'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  onAnswer: (
    questionId: string,
    answerIndex: number
  ) => Promise<{
    correct: boolean
    explanation: string
    xpEarned: number
    correctAnswer?: {
      index: number
      text?: string
    }
  }>
  alreadyAnswered?: boolean
  correctAnswer?: boolean
}

export const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  onAnswer,
  alreadyAnswered = false,
  correctAnswer = false,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(alreadyAnswered)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(alreadyAnswered ? correctAnswer : null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [serverCorrectAnswer, setServerCorrectAnswer] = useState<{
    index: number
    text?: string
  } | null>(null)

  const handleSubmit = async () => {
    if (selectedOption === null) return

    setSubmitting(true)
    try {
      const result = await onAnswer(question.id, selectedOption)
      setIsCorrect(result.correct)
      setExplanation(result.explanation)
      setXpEarned(result.xpEarned)
      setServerCorrectAnswer(result.correctAnswer ?? null)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setSubmitted(false)
    setIsCorrect(null)
    setExplanation(null)
    setXpEarned(0)
    setServerCorrectAnswer(null)
  }

  return (
    <GreySurface className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <span className="text-purple-400 font-semibold text-sm">{questionNumber}</span>
        </div>
        <h3 className="text-lg font-medium text-white flex-1">{question.question}</h3>
      </div>

      <div className="space-y-3 mb-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index
          const correctIndex =
            serverCorrectAnswer?.index ??
            (typeof question.correctAnswer === 'number' ? question.correctAnswer : null)
          const showCorrect = submitted && correctIndex !== null && index === correctIndex
          const showIncorrect = submitted && isSelected && !isCorrect

          return (
            <motion.button
              key={index}
              onClick={() => !submitted && setSelectedOption(index)}
              disabled={submitted}
              whileHover={!submitted ? { scale: 1.02 } : {}}
              whileTap={!submitted ? { scale: 0.98 } : {}}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${submitted ? 'cursor-default' : 'cursor-pointer'}
                ${isSelected && !submitted ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'}
                ${showCorrect ? 'border-green-500 bg-green-500/10' : ''}
                ${showIncorrect ? 'border-red-500 bg-red-500/10' : ''}
                ${!submitted ? 'hover:border-purple-400' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{option}</span>
                {showCorrect && <Check className="w-5 h-5 text-green-400" />}
                {showIncorrect && <X className="w-5 h-5 text-red-400" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {!submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {submitting ? 'Kontroluji...' : 'Odpovědět'}
            </Button>
          </motion.div>
        )}

        {submitted && explanation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}
          >
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}
              />
              <div className="flex-1">
                <p
                  className={`font-semibold mb-1 ${isCorrect ? 'text-green-300' : 'text-orange-300'}`}
                >
                  {isCorrect
                    ? 'Správně!'
                    : `Správná odpověď: ${
                        serverCorrectAnswer?.text ??
                        (typeof question.correctAnswer === 'number'
                          ? question.options[question.correctAnswer]
                          : 'není dostupná')
                      }`}
                </p>
                <p className="text-gray-300 text-sm">{explanation}</p>
              </div>
            </div>
            {isCorrect && xpEarned > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-500/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">+{xpEarned} XP</span>
              </div>
            )}
            {!isCorrect && (
              <Button onClick={handleRetry} variant="secondary" className="mt-4 w-full">
                Zkusit znovu
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GreySurface>
  )
})
