'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Loader2, CheckCircle } from 'lucide-react'
import { ReviewCard } from './ReviewCard'
import { ReviewComplete } from './ReviewComplete'
import { ExercisePlayer, type Exercise } from '@/components/learning/exercise'

interface ReviewCardData {
  id: string
  conceptId: string
  conceptName: string
  conceptDescription: string | null
  chapterTitle: string
  chapterId: string
  exercise: {
    id: string
    type: string
    question: string
    data: Record<string, unknown>
    hints: string[]
    xpReward: number
  } | null
  difficulty: {
    easeFactor: number
    interval: number
    repetitions: number
    lastRating: string | null
  }
}

interface ReviewSessionProps {
  onComplete?: (stats: { reviewed: number; correct: number; xpEarned: number }) => void
}

export function ReviewSession({ onComplete }: ReviewSessionProps) {
  const [cards, setCards] = useState<ReviewCardData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showExercise, setShowExercise] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    xpEarned: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const requestKeys = useRef(new Map<string, { rating: string; key: string }>())

  // Fetch due cards
  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/review/session?limit=20')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCards(data.data.cards)
    } catch (error) {
      console.error('Error fetching review cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    const card = cards[currentIndex]
    if (!card || submittingRef.current) return

    submittingRef.current = true
    setSubmitting(true)

    const previousRequest = requestKeys.current.get(card.id)
    const idempotencyKey =
      previousRequest?.rating === rating ? previousRequest.key : crypto.randomUUID()
    requestKeys.current.set(card.id, { rating, key: idempotencyKey })

    try {
      const res = await fetch('/api/review/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          cardId: card.id,
          rating,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit review rating')

      const correct = data.data?.correct === true
      const nextStats = {
        reviewed: sessionStats.reviewed + 1,
        correct: sessionStats.correct + (correct ? 1 : 0),
        xpEarned: sessionStats.xpEarned + (data.data?.xpEarned ?? 0),
      }
      setSessionStats(nextStats)
      requestKeys.current.delete(card.id)

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowExercise(false)
      } else {
        // Session complete
        setIsComplete(true)
        onComplete?.(nextStats)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleExerciseComplete = (isCorrect: boolean, _xpEarned: number) => {
    // Auto-rate based on exercise result (XP already tracked via API)
    const rating = isCorrect ? 'GOOD' : 'AGAIN'
    handleRating(rating)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Vše hotovo!</h2>
        <p className="text-gray-400">Nemáš žádné karty k opakování. Vrať se později.</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <ReviewComplete
        reviewed={sessionStats.reviewed}
        correct={sessionStats.correct}
        xpEarned={sessionStats.xpEarned}
        onContinue={() => window.location.reload()}
      />
    )
  }

  const currentCard = cards[currentIndex]
  if (!currentCard) return null

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span className="text-gray-400">Opakování</span>
        </div>
        <div className="text-gray-400">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {showExercise && currentCard.exercise ? (
          <motion.div
            key={`exercise-${currentCard.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ExercisePlayer
              exercise={{
                id: currentCard.exercise.id,
                type: currentCard.exercise.type as Exercise['type'],
                question: currentCard.exercise.question,
                data: currentCard.exercise.data,
                hints: currentCard.exercise.hints,
                xpReward: currentCard.exercise.xpReward,
              }}
              onComplete={handleExerciseComplete}
              showHints={true}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`card-${currentCard.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ReviewCard
              conceptName={currentCard.conceptName}
              conceptDescription={currentCard.conceptDescription}
              chapterTitle={currentCard.chapterTitle}
              difficulty={currentCard.difficulty}
              hasExercise={!!currentCard.exercise}
              onPractice={() => setShowExercise(true)}
              onRate={handleRating}
              disabled={submitting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
