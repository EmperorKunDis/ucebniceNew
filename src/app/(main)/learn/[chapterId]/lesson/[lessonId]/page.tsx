'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExercisePlayer, type Exercise } from '@/components/learning/exercise'
import { useHearts } from '@/components/gamification/hearts'
import { Confetti, XPGainAnimation } from '@/components/gamification/celebrations'

interface LessonData {
  id: string
  title: string
  chapterId: string
  chapterTitle: string
  exercises: Exercise[]
  xpReward: number
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string

  const { hearts, loseHeart } = useHearts()

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [xpEarned, setXpEarned] = useState(0)
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean
    xp: number
  } | null>(null)

  const fetchLesson = useCallback(async () => {
    try {
      const res = await fetch(`/api/micro-lessons/lesson/${lessonId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLesson(data.data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  const handleExerciseComplete = (isCorrect: boolean, earnedXP: number) => {
    setLastAnswer({ correct: isCorrect, xp: earnedXP })
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    if (isCorrect) {
      setXpEarned(prev => prev + earnedXP)
      setShowXPAnimation(true)
      setTimeout(() => setShowXPAnimation(false), 1500)
    } else {
      loseHeart()
    }

    // Move to next exercise after delay
    setTimeout(() => {
      setLastAnswer(null)
      if (lesson && currentIndex < lesson.exercises.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setIsComplete(true)
      }
    }, 1500)
  }

  const handleClose = () => {
    router.push(`/learn/${chapterId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!lesson || lesson.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <h2 className="text-xl font-semibold text-white mb-4">Lekce nenalezena</h2>
        <button onClick={handleClose} className="text-indigo-400 hover:underline">
          Zpět na kapitolu
        </button>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / lesson.exercises.length) * 100

  // Lesson Complete Screen
  if (isComplete) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Confetti isActive={true} pieceCount={80} />

        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">Lekce dokončena!</h1>
          <p className="text-gray-400 mb-8">{lesson.title}</p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(star => (
              <motion.span
                key={star}
                className={cn('text-4xl', star <= stars ? 'opacity-100' : 'opacity-30')}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: star * 0.2 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{accuracy}%</div>
              <div className="text-sm text-gray-400">Přesnost</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-500">+{xpEarned}</div>
              <div className="text-sm text-gray-400">XP</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {score.correct}/{score.total}
              </div>
              <div className="text-sm text-gray-400">Správně</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Pokračovat
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentExercise = lesson.exercises[currentIndex]
  if (!currentExercise) return null

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={handleClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1 text-red-500">
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-semibold">{hearts}</span>
        </div>
      </header>

      {/* Exercise */}
      <main className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto"
          >
            <ExercisePlayer
              exercise={currentExercise}
              onComplete={handleExerciseComplete}
              showHints={true}
            />
          </motion.div>
        </AnimatePresence>

        {/* Answer Feedback Overlay */}
        <AnimatePresence>
          {lastAnswer && (
            <motion.div
              className={cn(
                'fixed inset-x-0 bottom-0 p-6 flex items-center gap-4',
                lastAnswer.correct ? 'bg-green-500/90' : 'bg-red-500/90'
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
            >
              {lastAnswer.correct ? (
                <>
                  <CheckCircle className="w-8 h-8 text-white" />
                  <div className="flex-1">
                    <div className="text-white font-semibold">Správně!</div>
                    <div className="text-white/80">+{lastAnswer.xp} XP</div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-white" />
                  <div className="flex-1">
                    <div className="text-white font-semibold">Špatně</div>
                    <div className="text-white/80">Zkus to příště lépe</div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* XP Animation */}
      <XPGainAnimation amount={lastAnswer?.xp ?? 0} isVisible={showXPAnimation} />
    </div>
  )
}
