'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExercisePlayer, type Exercise } from '@/components/learning/exercise'
import { useHearts } from '@/components/gamification/hearts'
import { Confetti, XPGainAnimation } from '@/components/gamification/celebrations'
import { LessonArticle } from '@/components/learning/LessonArticle'
import { ProjectSubmission } from '@/components/chapters/ProjectSubmission'

interface LessonData {
  id: string
  title: string
  chapterId: string
  chapterTitle: string
  content?: string | null
  videoFile?: string | null
  notebookLMUrl?: string | null
  notebookLmUrl?: string | null
  colabNotebook?: string | null
  colabUrl?: string | null
  projectTitle?: string | null
  projectDescription?: string | null
  projectRequirements?: string | null
  progress?: {
    contentCompleted?: boolean
    exercisesCompleted?: boolean
    projectApproved?: boolean
  }
  exercises: Exercise[]
  xpReward: number
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string

  const { hearts, refetch: refetchHearts } = useHearts()

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [xpEarned, setXpEarned] = useState(0)
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(() => new Set())
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean
    xp: number
  } | null>(null)
  const [phase, setPhase] = useState<'content' | 'exercises'>('content')
  const [contentSubmitting, setContentSubmitting] = useState(false)

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

  const completeLesson = async () => {
    const response = await fetch(`/api/micro-lessons/lesson/${lessonId}/complete`, {
      method: 'POST',
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || 'Nepodařilo se uložit dokončení lekce')
    }

    return data as { xpEarned?: number }
  }

  const handleExerciseComplete = (isCorrect: boolean, earnedXP: number) => {
    const currentExerciseId = lesson?.exercises[currentIndex]?.id
    const alreadyCounted = currentExerciseId ? completedExerciseIds.has(currentExerciseId) : false

    setCompletionError(null)
    setLastAnswer({ correct: isCorrect, xp: earnedXP })

    if (!alreadyCounted) {
      if (currentExerciseId) {
        setCompletedExerciseIds(prev => new Set(prev).add(currentExerciseId))
      }

      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }))

      if (isCorrect) {
        setXpEarned(prev => prev + earnedXP)
        setShowXPAnimation(true)
        setTimeout(() => setShowXPAnimation(false), 1500)
      }
    }

    void refetchHearts()

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

  const handleContentContinue = () => {
    if (contentSubmitting) return

    setCompletionError(null)
    setContentSubmitting(true)

    void completeLesson()
      .then(data => {
        const contentXP = data.xpEarned ?? 0
        if (contentXP > 0) setXpEarned(value => value + contentXP)
        setLesson(current =>
          current
            ? { ...current, progress: { ...current.progress, contentCompleted: true } }
            : current
        )

        if (lesson && lesson.exercises.length > 0) {
          setPhase('exercises')
        } else {
          setIsComplete(true)
        }
      })
      .catch(error => {
        setCompletionError(
          error instanceof Error ? error.message : 'Nepodařilo se uložit dokončení lekce'
        )
      })
      .finally(() => setContentSubmitting(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <h2 className="text-xl font-semibold text-white mb-4">Lekce nenalezena</h2>
        <button onClick={handleClose} className="text-indigo-400 hover:underline">
          Zpět na kapitolu
        </button>
      </div>
    )
  }

  if (phase === 'content' && !isComplete) {
    return (
      <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Zpět na kapitolu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
              Zpět na kapitolu
            </button>
            {lesson.progress?.contentCompleted && (
              <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-200">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Obsah už je dokončený
              </span>
            )}
          </div>

          <header className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-300">
              {lesson.chapterTitle}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{lesson.title}</h1>
            <p className="mt-3 text-gray-300">
              Nejprve si projdi výklad a materiály. Cvičení se otevřou až po explicitním
              pokračování.
            </p>
          </header>

          <LessonArticle
            content={lesson.content}
            videoFile={lesson.videoFile}
            notebookLMUrl={lesson.notebookLMUrl ?? lesson.notebookLmUrl}
            colabNotebook={lesson.colabNotebook ?? lesson.colabUrl}
            projectDescription={[
              lesson.projectDescription,
              lesson.projectRequirements ? `Požadavky:\n${lesson.projectRequirements}` : null,
            ]
              .filter(Boolean)
              .join('\n\n')}
          />

          {completionError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {completionError}
            </div>
          )}

          <div className="sticky bottom-20 rounded-2xl border border-white/10 bg-gray-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl lg:bottom-4">
            <button
              type="button"
              onClick={handleContentContinue}
              disabled={contentSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6747ff] px-5 py-3.5 font-bold text-white transition hover:bg-[#846bff]"
            >
              {contentSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Ukládám dokončení obsahu…
                </>
              ) : (
                <>
                  {lesson.exercises.length > 0 ? 'Pokračovat na cvičení' : 'Dokončit obsah'}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / lesson.exercises.length) * 100

  // Lesson Complete Screen
  if (isComplete) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const completedAllExercisesThisRun =
      lesson.exercises.length > 0 &&
      score.total === lesson.exercises.length &&
      score.correct === lesson.exercises.length
    const projectUnlocked =
      completedAllExercisesThisRun ||
      lesson.progress?.exercisesCompleted ||
      lesson.progress?.projectApproved

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Confetti isActive={true} pieceCount={80} />

        <motion.div
          className="w-full max-w-2xl text-center"
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

          {/* Canonical chapter-star milestones */}
          <div className="mb-6 grid gap-2 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-3">
              <div className="text-xl" aria-hidden="true">
                ⭐
              </div>
              <div className="mt-1 text-sm font-semibold text-yellow-100">Obsah dokončen</div>
            </div>
            <div
              className={cn(
                'rounded-xl border p-3',
                completedAllExercisesThisRun
                  ? 'border-yellow-400/30 bg-yellow-500/10'
                  : 'border-white/10 bg-white/5'
              )}
            >
              <div className="text-xl" aria-hidden="true">
                {completedAllExercisesThisRun ? '⭐' : '☆'}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-100">Všechna cvičení</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl" aria-hidden="true">
                ☆
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-100">Schválený projekt</div>
            </div>
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

          <div className="mt-10 text-left">
            {lesson.projectDescription && (
              <div className="mb-5 rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
                <h2 className="font-semibold text-white">Projekt kapitoly</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-200">
                  {lesson.projectDescription}
                </p>
              </div>
            )}
            {projectUnlocked ? (
              <ProjectSubmission chapterId={chapterId} />
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-gray-300">
                <XCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <p className="text-sm">
                  Projekt se odemkne, až bude všech 10 cvičení dokončeno správně.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  const currentExercise = lesson.exercises[currentIndex]
  if (!currentExercise) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-semibold text-white">Cvičení nejsou k dispozici</h2>
        <button
          onClick={() => setPhase('content')}
          className="mt-4 text-indigo-300 hover:underline"
        >
          Zpět k obsahu
        </button>
      </div>
    )
  }

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
        {completionError && (
          <div className="mx-auto mb-4 max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {completionError}
          </div>
        )}

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
              heartsRemaining={hearts}
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
