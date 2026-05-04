'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
  Target,
  Brain,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  order: number
  completed: boolean
  xpReward: number
}

interface ChapterData {
  chapterId: string
  title: string
  description: string
  difficulty: string
  lessons: Lesson[]
  progress: {
    lessonsCompleted: number
    totalLessons: number
    stars: number
    bestScore: number
  }
  isUnlocked: boolean
}

export default function ChapterOverviewPage() {
  const params = useParams()
  const chapterId = params.chapterId as string
  const [chapter, setChapter] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChapter()
  }, [chapterId])

  const fetchChapter = async () => {
    try {
      const res = await fetch(`/api/micro-lessons/${chapterId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setChapter(data.data)
    } catch (error) {
      console.error('Error fetching chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">Kapitola nenalezena</h2>
        <Link href="/dashboard" className="text-indigo-400 hover:underline">
          Zpět na přehled
        </Link>
      </div>
    )
  }

  const progressPercent =
    chapter.progress.totalLessons > 0
      ? (chapter.progress.lessonsCompleted / chapter.progress.totalLessons) * 100
      : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zpět na přehled
      </Link>

      {/* Chapter Header */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-indigo-400 mb-1">Kapitola {chapterId}</div>
            <h1 className="text-2xl font-bold text-white mb-2">{chapter.title}</h1>
            <p className="text-gray-400">{chapter.description}</p>
          </div>

          {/* Stars */}
          <div className="flex gap-1">
            {[1, 2, 3].map(star => (
              <Star
                key={star}
                className={cn(
                  'w-6 h-6',
                  star <= chapter.progress.stars
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-600'
                )}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Pokrok</span>
            <span className="text-white">
              {chapter.progress.lessonsCompleted}/{chapter.progress.totalLessons} lekcí
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/learn/${chapterId}/practice`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Target className="w-4 h-4" />
            Procvičovat
          </Link>
          <Link
            href="/review"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Brain className="w-4 h-4" />
            Opakování
          </Link>
        </div>
      </motion.section>

      {/* Lessons List */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Lekce
        </h2>

        <div className="space-y-3">
          {chapter.lessons.map((lesson, index) => {
            const isLocked = index > 0 && !chapter.lessons[index - 1]?.completed
            const isNext =
              !lesson.completed && (index === 0 || chapter.lessons[index - 1]?.completed)

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isLocked ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl opacity-50">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500">{lesson.title}</div>
                      <div className="text-sm text-gray-600">Dokonči předchozí lekci</div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/learn/${chapterId}/lesson/${lesson.id}`}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl transition-all group',
                      lesson.completed
                        ? 'bg-gray-800/50 hover:bg-gray-800'
                        : isNext
                          ? 'bg-indigo-600/20 border-2 border-indigo-500 hover:bg-indigo-600/30'
                          : 'bg-gray-800 hover:bg-gray-750'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        lesson.completed
                          ? 'bg-green-500/20'
                          : isNext
                            ? 'bg-indigo-500'
                            : 'bg-gray-700'
                      )}
                    >
                      {lesson.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <PlayCircle
                          className={cn('w-6 h-6', isNext ? 'text-white' : 'text-gray-400')}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'font-medium truncate',
                          lesson.completed ? 'text-gray-300' : 'text-white'
                        )}
                      >
                        {lesson.title}
                      </div>
                      <div className="text-sm text-gray-400">+{lesson.xpReward} XP</div>
                    </div>

                    {isNext && (
                      <span className="px-3 py-1 bg-indigo-500 text-white text-sm font-medium rounded-full">
                        Začít
                      </span>
                    )}
                  </Link>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
