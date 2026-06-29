'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Target, Loader2, ArrowRight } from 'lucide-react'
import { ExercisePlayer, type Exercise } from '@/components/learning/exercise'
import { useHearts } from '@/components/gamification/hearts'
import { Confetti } from '@/components/gamification/celebrations'

interface PracticeData {
  chapterId: string
  chapterTitle: string
  exercises: Exercise[]
}

export default function PracticePage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.chapterId as string

  const { loseHeart } = useHearts()

  const [data, setData] = useState<PracticeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [xpEarned, setXpEarned] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const fetchExercises = useCallback(async () => {
    try {
      // Fetch random exercises for practice
      const res = await fetch(`/api/micro-lessons/${chapterId}?practice=true&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()

      // Flatten exercises from all lessons
      const exercises =
        json.data?.lessons?.flatMap((l: { exercises?: Exercise[] }) => l.exercises ?? []) ?? []

      setData({
        chapterId,
        chapterTitle: json.data?.title ?? 'Procvičování',
        exercises: exercises.slice(0, 10),
      })
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const handleExerciseComplete = (isCorrect: boolean, earnedXP: number) => {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    if (isCorrect) {
      setXpEarned(prev => prev + earnedXP)
    } else {
      loseHeart()
    }

    setTimeout(() => {
      if (data && currentIndex < data.exercises.length - 1) {
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

  if (!data || data.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <Target className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Žádná cvičení k dispozici</h2>
        <button onClick={handleClose} className="text-indigo-400 hover:underline">
          Zpět na kapitolu
        </button>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / data.exercises.length) * 100

  if (isComplete) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Confetti isActive={true} pieceCount={60} />

        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Target className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Procvičování dokončeno!</h1>
          <p className="text-gray-400 mb-8">{data.chapterTitle}</p>

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

          <button
            onClick={handleClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Pokračovat
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    )
  }

  const currentExercise = data.exercises[currentIndex]
  if (!currentExercise) return null

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={handleClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-gray-400 text-sm">
          {currentIndex + 1}/{data.exercises.length}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <ExercisePlayer
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            showHints={true}
          />
        </div>
      </main>
    </div>
  )
}
