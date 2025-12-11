'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Chapter } from '@/data/chapters'
import { ChapterHeader } from './ChapterHeader'
import { ChapterContent } from './ChapterContent'
import { VideoPlayer } from './VideoPlayer'
import { NotebookLinks } from './NotebookLinks'
import { ChapterNavigation } from './ChapterNavigation'
import { QuestionCard } from './QuestionCard'
import { ProjectSubmission } from './ProjectSubmission'
import { ModuleTestModal } from '../tests/ModuleTestModal'
import { Box, Stack } from '@/components/layout'
import { PageLayout } from '@/components/layout/page-layout'
import { GreySurface } from '@/components/ui/grey-surface'
import { Button } from '@/components/ui/button'
import { getModuleTest } from '@/data/module-tests'
import {
  Book,
  ChevronDown,
  PlayCircle,
  CheckCircle,
  Loader2,
  Trophy,
  Zap,
  HelpCircle,
  Upload,
  Star,
} from 'lucide-react'
import { getChapterQuestions } from '@/data/questions'

interface ChapterLayoutProps {
  chapter: Chapter
}

// Memoize child components to prevent unnecessary re-renders
const MemoizedVideoPlayer = memo(VideoPlayer)
const MemoizedChapterContent = memo(ChapterContent)
const MemoizedQuestionCard = memo(QuestionCard)
const MemoizedProjectSubmission = memo(ProjectSubmission)

export function ChapterLayout({ chapter }: ChapterLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState({
    video: true, // Video bude default rozbalené
    text: false,
    lecture: true, // Přednáška také default rozbalená pro lepší UX
    questions: false,
    project: false,
  })
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionData, setCompletionData] = useState<any>(null)
  const [completedChapter, setCompletedChapter] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(false)
  const [submittedProject, setSubmittedProject] = useState(false)
  const [questionAnswers, setQuestionAnswers] = useState<Map<string, boolean>>(new Map())
  const [, setLoading] = useState(true)
  const [showModuleTest, setShowModuleTest] = useState(false)
  const [moduleTestNumber, setModuleTestNumber] = useState<number | null>(null)
  const [isChapterLocked, setIsChapterLocked] = useState(false)

  const questions = getChapterQuestions(chapter.id)

  // Check if this chapter triggers a module test (10, 20, 30, 40)
  const isModuleEndChapter = ['10', '20', '30', '40'].includes(chapter.id)
  const getModuleNumber = (chapterId: string) => {
    if (chapterId === '10') return 1
    if (chapterId === '20') return 2
    if (chapterId === '30') return 3
    if (chapterId === '40') return 4
    return null
  }

  // Load chapter progress on mount
  useEffect(() => {
    async function loadProgress() {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        // Check if chapter is locked
        const chapterNumber = parseInt(chapter.id)
        if (chapterNumber > 1) {
          // Load all progress to check if previous chapter is completed
          const allProgressResponse = await fetch('/api/chapters/all-progress')
          if (allProgressResponse.ok) {
            const allProgressData = await allProgressResponse.json()
            const progressMap = allProgressData.progress || {}

            // Check if previous chapter is completed
            const previousChapterId = String(chapterNumber - 1).padStart(2, '0')
            const isPreviousCompleted = progressMap[previousChapterId]?.completed || false

            if (!isPreviousCompleted) {
              setIsChapterLocked(true)
              setLoading(false)
              return
            }
          }
        }

        const response = await fetch(`/api/chapters/progress?chapterId=${chapter.id}`)
        const data = await response.json()

        if (response.ok) {
          setCompletedChapter(data.completedChapter || false)
          setAnsweredQuestions(data.answeredQuestions || false)
          setSubmittedProject(data.submittedProject || false)
          setCompleted(data.completed)
          if (data.completed) {
            setCompletionData({ alreadyCompleted: true })
          }

          // Load question answers
          const answersMap = new Map<string, boolean>()
          data.questionAnswers?.forEach((qa: any) => {
            answersMap.set(qa.questionId, qa.correct)
          })
          setQuestionAnswers(answersMap)
        }
      } catch (error) {
        console.error('Error loading chapter progress:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [chapter.id, session])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleAnswerQuestion = async (questionId: string, answerIndex: number) => {
    if (!session) {
      router.push('/auth/signin')
      return { correct: false, explanation: 'Musíš být přihlášen', xpEarned: 0 }
    }

    try {
      const response = await fetch('/api/questions/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          questionId,
          answerIndex,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setQuestionAnswers(prev => new Map(prev).set(questionId, data.correct))

        if (data.allQuestionsCompleted) {
          setAnsweredQuestions(true)
          toast.success('Všechny otázky správně! Získal jsi druhou hvězdičku! 🌟')
        }

        return data
      }

      return { correct: false, explanation: data.error, xpEarned: 0 }
    } catch (error) {
      console.error('Error answering question:', error)
      return { correct: false, explanation: 'Chyba při odesílání odpovědi', xpEarned: 0 }
    }
  }

  const handleCompleteChapter = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setCompleting(true)
    try {
      const response = await fetch('/api/progress/complete-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCompleted(true)
        setCompletionData(data)
        setCompletedChapter(data.completedChapter || true)
        setAnsweredQuestions(data.answeredQuestions || false)
        setSubmittedProject(data.submittedProject || false)
        toast.success('Kapitola dokončena! 🎉')

        // Show module test if this is chapter 10, 20, 30, or 40
        if (isModuleEndChapter) {
          const modNum = getModuleNumber(chapter.id)
          if (modNum && getModuleTest(modNum)) {
            setModuleTestNumber(modNum)
            setTimeout(() => {
              setShowModuleTest(true)
            }, 1500)
          }
        }
      } else {
        console.error('Error completing chapter:', data.error)
        toast.error(data.error || 'Nepodařilo se dokončit kapitolu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Něco se pokazilo. Zkuste to znovu.')
    } finally {
      setCompleting(false)
    }
  }

  const handleTestComplete = (result: any) => {
    toast.success(`Test dokončen! +${result.xpEarned} XP, ${result.stars} hvězdiček! 🎉`)
    setShowModuleTest(false)
    setModuleTestNumber(null)
  }

  const handleTestAbandon = () => {
    toast('Test ukončen')
    setShowModuleTest(false)
    setModuleTestNumber(null)
  }

  const moduleTest = moduleTestNumber ? getModuleTest(moduleTestNumber) : null

  // Show locked message if chapter is locked
  if (isChapterLocked) {
    return (
      <PageLayout>
        <Box className="max-w-5xl mx-auto">
          <GreySurface className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">Kapitola je zamčená</h2>
            <p className="text-gray-400 mb-8 text-lg">
              Pro odemčení této kapitoly musíš nejprve dokončit předchozí kapitolu.
            </p>

            <Button
              onClick={() => router.push('/chapters')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              Zpět na seznam kapitol
            </Button>
          </GreySurface>
        </Box>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Module Test Modal */}
      {showModuleTest && moduleTest && (
        <ModuleTestModal
          moduleTest={moduleTest}
          onComplete={handleTestComplete}
          onAbandon={handleTestAbandon}
        />
      )}

      <Box className="max-w-5xl mx-auto">
        <ChapterHeader chapter={chapter} />

        <Stack direction="col" gap={6} className="mt-8">
          {/* Rychlé odkazy na notebooky */}
          <NotebookLinks chapter={chapter} />

          {/* Video přednáška */}
          {chapter.videoFile && (
            <Section
              title="Video přednáška"
              icon={<PlayCircle className="w-5 h-5" />}
              expanded={expandedSections.video}
              onToggle={() => toggleSection('video')}
            >
              <MemoizedVideoPlayer videoFile={chapter.videoFile} />
            </Section>
          )}

          {/* Kompletní přednáška */}
          <Section
            title="Kompletní přednáška"
            icon={<Book className="w-5 h-5" />}
            expanded={expandedSections.lecture}
            onToggle={() => toggleSection('lecture')}
          >
            <MemoizedChapterContent content={chapter.lectureFile} type="lecture" />
          </Section>

          {/* Studijní materiály - Questions */}
          {questions.length > 0 && (
            <Section
              title={`Otázky k procvičení (${questions.length})`}
              icon={<HelpCircle className="w-5 h-5" />}
              expanded={expandedSections.questions}
              onToggle={() => toggleSection('questions')}
            >
              <div className="space-y-4">
                <p className="text-gray-400 mb-6">
                  Odpověz správně na všechny otázky a získej druhou hvězdičku! 🌟
                </p>
                {questions.map((question, index) => (
                  <MemoizedQuestionCard
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                    onAnswer={handleAnswerQuestion}
                    alreadyAnswered={questionAnswers.has(question.id)}
                    correctAnswer={questionAnswers.get(question.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Project Submission */}
          {session && (
            <Section
              title="Odevzdej svůj projekt"
              icon={<Upload className="w-5 h-5" />}
              expanded={expandedSections.project}
              onToggle={() => toggleSection('project')}
            >
              <div className="space-y-4">
                <p className="text-gray-400 mb-6">
                  Nahraj odkaz na svůj projekt a získej třetí hvězdičku! 🌟
                </p>
                <MemoizedProjectSubmission
                  chapterId={chapter.id}
                  onProjectSubmitted={() => {
                    setSubmittedProject(true)
                    toast.success('Získal jsi třetí hvězdičku! 🌟')
                  }}
                />
              </div>
            </Section>
          )}

          {/* Complete Chapter Button */}
          {session && (
            <GreySurface className="p-6">
              {!completed && !completionData ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Dokončil jsi tuto kapitolu?
                  </h3>
                  <p className="text-gray-400 mb-4">Získej XP a pokroč ve své cestě učení!</p>

                  {/* Star Progress */}
                  {(completedChapter || answeredQuestions || submittedProject) && (
                    <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 mb-2">Tvůj pokrok:</p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star
                          className={`w-6 h-6 ${completedChapter ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                        <Star
                          className={`w-6 h-6 ${answeredQuestions ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                        <Star
                          className={`w-6 h-6 ${submittedProject ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>
                          ⭐ První hvězdička:{' '}
                          {completedChapter ? '✓ Kapitola dokončena' : 'Dokončit kapitolu'}
                        </p>
                        <p>
                          ⭐ Druhá hvězdička:{' '}
                          {answeredQuestions ? '✓ Otázky zodpovězeny' : 'Zodpovědět všechny otázky'}
                        </p>
                        <p>
                          ⭐ Třetí hvězdička:{' '}
                          {submittedProject ? '✓ Projekt odevzdán' : 'Odevzdat projekt'}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCompleteChapter}
                    disabled={completing}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Ukládám...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Dokončit kapitolu
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Gratulujeme! 🎉</h3>
                  <p className="text-gray-400 mb-4">
                    {completionData?.alreadyCompleted
                      ? 'Tuto kapitolu už máš dokončenou!'
                      : 'Úspěšně jsi dokončil tuto kapitolu!'}
                  </p>

                  {/* Star Display */}
                  {(completedChapter || answeredQuestions || submittedProject) && (
                    <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300 mb-2">Tvoje hvězdičky:</p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star
                          className={`w-8 h-8 ${completedChapter ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                        <Star
                          className={`w-8 h-8 ${answeredQuestions ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                        <Star
                          className={`w-8 h-8 ${submittedProject ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>
                          ⭐ {completedChapter ? '✓ Kapitola dokončena' : '☐ Dokončit kapitolu'}
                        </p>
                        <p>
                          ⭐{' '}
                          {answeredQuestions
                            ? '✓ Otázky zodpovězeny'
                            : '☐ Zodpovědět všechny otázky'}
                        </p>
                        <p>⭐ {submittedProject ? '✓ Projekt odevzdán' : '☐ Odevzdat projekt'}</p>
                      </div>
                    </div>
                  )}

                  {completionData && !completionData.alreadyCompleted && (
                    <div className="flex gap-4 justify-center items-center flex-wrap mb-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-medium">
                          +{completionData.xpEarned} XP
                        </span>
                      </div>

                      {completionData.leveledUp && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                          <Trophy className="w-5 h-5 text-purple-400" />
                          <span className="text-purple-300 font-medium">
                            Level {completionData.level}
                          </span>
                        </div>
                      )}

                      {completionData.newBadges && completionData.newBadges.length > 0 && (
                        <div className="w-full mt-4">
                          <p className="text-sm text-gray-400 mb-2">Nové odznaky:</p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {completionData.newBadges.map((badge: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg"
                              >
                                <span className="text-2xl">{badge.icon}</span>
                                <span className="text-white text-sm">{badge.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => router.push('/chapters')}
                    variant="secondary"
                    className="mr-2"
                  >
                    Zpět na kapitoly
                  </Button>
                  <Button
                    onClick={() => router.push('/profile')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Profil
                  </Button>
                </div>
              )}
            </GreySurface>
          )}

          {/* Navigace mezi kapitolami */}
          <ChapterNavigation currentChapterId={chapter.id} isCompleted={completed} />
        </Stack>
      </Box>
    </PageLayout>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, icon, expanded, onToggle, children }: SectionProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GreySurface className="overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <Stack direction="row" gap={3} align="center">
            <Box className="text-purple-400">{icon}</Box>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </Stack>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>

        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box className="px-6 pb-6">
              <Box className="border-t border-gray-700/50 pt-6">{children}</Box>
            </Box>
          </motion.div>
        )}
      </GreySurface>
    </motion.div>
  )
}
