'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lightbulb, Check, X, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MultipleChoice, FillInBlank, TrueFalse, CodeOutput, MatchPairs } from './exercises'

export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_BLANK'
  | 'TRUE_FALSE'
  | 'CODE_OUTPUT'
  | 'MATCH_PAIRS'

export interface Exercise {
  id: string
  type: ExerciseType
  question: string
  data: Record<string, unknown>
  explanation?: string
  hints?: string[]
  xpReward: number
}

interface ExercisePlayerProps {
  exercise: Exercise
  onComplete: (isCorrect: boolean, xpEarned: number) => void
  onHeartLost?: () => void
  heartsRemaining?: number
  showHints?: boolean
}

export function ExercisePlayer({
  exercise,
  onComplete,
  onHeartLost,
  heartsRemaining = 5,
  showHints = true,
}: ExercisePlayerProps) {
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAnswer = (correct: boolean) => {
    setAnswered(true)
    setIsCorrect(correct)

    if (!correct && onHeartLost) {
      onHeartLost()
    }

    // Show explanation after a short delay
    setTimeout(() => setShowExplanation(true), 500)
  }

  const handleContinue = () => {
    // Calculate XP (reduced by hints used)
    const hintPenalty = hintsUsed * 2
    const xpEarned = isCorrect ? Math.max(1, exercise.xpReward - hintPenalty) : 0
    onComplete(isCorrect, xpEarned)
  }

  const handleHint = () => {
    if (exercise.hints && hintsUsed < exercise.hints.length) {
      setHintsUsed(prev => prev + 1)
    }
  }

  const renderExercise = () => {
    const { type, data } = exercise

    switch (type) {
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoice
            question={exercise.question}
            options={data.options as string[]}
            correctIndex={data.correctIndex as number}
            onAnswer={(_, correct) => handleAnswer(correct)}
            disabled={answered}
          />
        )

      case 'FILL_IN_BLANK':
        return (
          <FillInBlank
            text={data.text as string}
            answers={data.answers as string[]}
            alternatives={data.alternatives as string[][] | undefined}
            onAnswer={(_, correct) => handleAnswer(correct)}
            disabled={answered}
          />
        )

      case 'TRUE_FALSE':
        return (
          <TrueFalse
            statement={exercise.question}
            isTrue={data.isTrue as boolean}
            onAnswer={(_, correct) => handleAnswer(correct)}
            disabled={answered}
          />
        )

      case 'CODE_OUTPUT':
        return (
          <CodeOutput
            code={data.code as string}
            language={data.language as string}
            question={exercise.question}
            options={data.options as string[]}
            correctIndex={data.correctIndex as number}
            onAnswer={(_, correct) => handleAnswer(correct)}
            disabled={answered}
          />
        )

      case 'MATCH_PAIRS':
        return (
          <MatchPairs
            pairs={data.pairs as { left: string; right: string }[]}
            onAnswer={(_, correct) => handleAnswer(correct)}
            disabled={answered}
          />
        )

      default:
        return <p className="text-red-400">Neznámý typ cvičení: {type}</p>
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Header with hearts */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'w-5 h-5',
                i < heartsRemaining ? 'text-red-500 fill-red-500' : 'text-gray-600'
              )}
            />
          ))}
        </div>

        {/* Hint button */}
        {showHints && exercise.hints && exercise.hints.length > 0 && !answered && (
          <button
            onClick={handleHint}
            disabled={hintsUsed >= exercise.hints.length}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
              hintsUsed < exercise.hints.length
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            <Lightbulb className="w-4 h-4" />
            <span>
              Nápověda ({exercise.hints.length - hintsUsed}/{exercise.hints.length})
            </span>
          </button>
        )}
      </div>

      {/* Hints display */}
      {hintsUsed > 0 && (
        <div className="mb-6 space-y-2">
          {exercise.hints?.slice(0, hintsUsed).map((hint, i) => (
            <motion.div
              key={i}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              💡 {hint}
            </motion.div>
          ))}
        </div>
      )}

      {/* Exercise content */}
      {renderExercise()}

      {/* Feedback section */}
      <AnimatePresence>
        {answered && showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            {/* Result banner */}
            <div
              className={cn(
                'p-4 rounded-xl mb-4 flex items-center gap-3',
                isCorrect
                  ? 'bg-green-900/30 border border-green-500/50'
                  : 'bg-red-900/30 border border-red-500/50'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                )}
              >
                {isCorrect ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p
                  className={cn('font-bold text-lg', isCorrect ? 'text-green-400' : 'text-red-400')}
                >
                  {isCorrect ? 'Správně!' : 'Špatně'}
                </p>
                {!isCorrect && (
                  <p className="text-gray-400 text-sm">Neboj, z chyb se člověk učí!</p>
                )}
              </div>
              {isCorrect && (
                <div className="ml-auto text-yellow-400 font-bold">
                  +{Math.max(1, exercise.xpReward - hintsUsed * 2)} XP
                </div>
              )}
            </div>

            {/* Explanation */}
            {exercise.explanation && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <h4 className="text-white font-semibold mb-2">Vysvětlení</h4>
                <p className="text-gray-300 text-sm">{exercise.explanation}</p>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className={cn(
                'w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
                isCorrect
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600',
                'text-white'
              )}
            >
              Pokračovat
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
