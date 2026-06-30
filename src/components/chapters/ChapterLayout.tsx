'use client'

import { useState, memo } from 'react'
import { motion } from 'framer-motion'
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
import { useChapterProgress, useChapterQuestions } from './hooks'
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
  Lock,
} from 'lucide-react'

interface ChapterLayoutProps {
  chapter: Chapter
}

// Memoize heavy child components
const MemoizedVideoPlayer = memo(VideoPlayer)
const MemoizedChapterContent = memo(ChapterContent)
const MemoizedQuestionCard = memo(QuestionCard)
const MemoizedProjectSubmission = memo(ProjectSubmission)

// Module test chapters
const MODULE_END_CHAPTERS = ['10', '20', '30', '40'] as const
const getModuleNumber = (chapterId: string): number | null => {
  const map: Record<string, number> = { '10': 1, '20': 2, '30': 3, '40': 4 }
  return map[chapterId] || null
}

export function ChapterLayout({ chapter }: ChapterLayoutProps) {
  const router = useRouter()

  // Custom hooks for data
  const progress = useChapterProgress(chapter.id)
  const { questions } = useChapterQuestions(chapter.id)

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    video: true,
    text: false,
    lecture: true,
    questions: false,
    project: false,
  })
  const [showModuleTest, setShowModuleTest] = useState(false)
  const [moduleTestNumber, setModuleTestNumber] = useState<number | null>(null)

  const isModuleEndChapter = MODULE_END_CHAPTERS.includes(
    chapter.id as (typeof MODULE_END_CHAPTERS)[number]
  )

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCompleteChapter = async () => {
    if (!progress.isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    const data = await progress.completeChapter()

    if (data && isModuleEndChapter) {
      const modNum = getModuleNumber(chapter.id)
      if (modNum && getModuleTest(modNum)) {
        setModuleTestNumber(modNum)
        setTimeout(() => setShowModuleTest(true), 1500)
      }
    }
  }

  const handleTestComplete = (result: { xpEarned: number; stars: number }) => {
    toast.success(`Test dokončen! +${result.xpEarned} XP, ${result.stars} hvězdiček! 🎉`)
    setShowModuleTest(false)
    setModuleTestNumber(null)
  }

  const handleTestAbandon = () => {
    toast('Test ukončen', { icon: 'ℹ️' })
    setShowModuleTest(false)
    setModuleTestNumber(null)
  }

  // Locked chapter view
  if (progress.isChapterLocked) {
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
                <Lock className="w-10 h-10 text-red-400" />
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

  const moduleTest = moduleTestNumber ? getModuleTest(moduleTestNumber) : null

  return (
    <PageLayout>
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
          <NotebookLinks chapter={chapter} />

          {/* Video Section */}
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

          {/* Lecture Section */}
          <Section
            title="Kompletní přednáška"
            icon={<Book className="w-5 h-5" />}
            expanded={expandedSections.lecture}
            onToggle={() => toggleSection('lecture')}
          >
            <MemoizedChapterContent content={chapter.lectureFile} type="lecture" />
          </Section>

          {/* Questions Section */}
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
                    onAnswer={progress.answerQuestion}
                    alreadyAnswered={progress.questionAnswers.get(question.id) === true}
                    correctAnswer={progress.questionAnswers.get(question.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Project Section */}
          {progress.isAuthenticated && (
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
                  onProjectSubmitted={progress.markProjectSubmitted}
                />
              </div>
            </Section>
          )}

          {/* Completion Section */}
          {progress.isAuthenticated && (
            <CompletionSection
              progress={progress}
              questions={questions}
              onComplete={handleCompleteChapter}
              onToggleQuestions={() => toggleSection('questions')}
              onToggleProject={() => toggleSection('project')}
              onNavigateChapters={() => router.push('/chapters')}
              onNavigateProfile={() => router.push('/profile')}
            />
          )}

          <ChapterNavigation currentChapterId={chapter.id} isCompleted={progress.completed} />
        </Stack>
      </Box>
    </PageLayout>
  )
}

// Section Component
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

// Star Progress Display
interface StarProgressProps {
  completedChapter: boolean
  answeredQuestions: boolean
  submittedProject: boolean
}

function StarProgress({
  completedChapter,
  answeredQuestions,
  submittedProject,
}: StarProgressProps) {
  return (
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
        <p>⭐ První hvězdička: {completedChapter ? '✓ Kapitola dokončena' : 'Dokončit kapitolu'}</p>
        <p>
          ⭐ Druhá hvězdička:{' '}
          {answeredQuestions ? '✓ Otázky zodpovězeny' : 'Zodpovědět všechny otázky'}
        </p>
        <p>⭐ Třetí hvězdička: {submittedProject ? '✓ Projekt odevzdán' : 'Odevzdat projekt'}</p>
      </div>
    </div>
  )
}

// Completion Section
interface CompletionSectionProps {
  progress: ReturnType<typeof useChapterProgress>
  questions: unknown[]
  onComplete: () => void
  onToggleQuestions: () => void
  onToggleProject: () => void
  onNavigateChapters: () => void
  onNavigateProfile: () => void
}

function CompletionSection({
  progress,
  questions,
  onComplete,
  onToggleQuestions,
  onToggleProject,
  onNavigateChapters,
  onNavigateProfile,
}: CompletionSectionProps) {
  const {
    completedChapter,
    answeredQuestions,
    submittedProject,
    completed,
    completing,
    completionData,
  } = progress
  const hasAnyProgress = completedChapter || answeredQuestions || submittedProject
  const isFullyComplete = completed || completionData

  return (
    <GreySurface className="p-6">
      {!isFullyComplete ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {completedChapter ? 'Kapitola je dokončená!' : 'Dokončil jsi tuto kapitolu?'}
          </h3>
          <p className="text-gray-400 mb-4">
            {completedChapter
              ? 'Můžeš pokračovat v získávání dalších hvězdiček!'
              : 'Získej XP a pokroč ve své cestě učení!'}
          </p>

          {hasAnyProgress && (
            <StarProgress
              completedChapter={completedChapter}
              answeredQuestions={answeredQuestions}
              submittedProject={submittedProject}
            />
          )}

          {!completedChapter ? (
            <Button
              onClick={onComplete}
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
          ) : (
            <ActionButtons
              answeredQuestions={answeredQuestions}
              submittedProject={submittedProject}
              questionsCount={questions.length}
              onNavigateChapters={onNavigateChapters}
              onToggleQuestions={onToggleQuestions}
              onToggleProject={onToggleProject}
            />
          )}
        </div>
      ) : (
        <CompletedView
          progress={progress}
          questions={questions}
          onNavigateChapters={onNavigateChapters}
          onNavigateProfile={onNavigateProfile}
          onToggleQuestions={onToggleQuestions}
          onToggleProject={onToggleProject}
        />
      )}
    </GreySurface>
  )
}

// Action Buttons
interface ActionButtonsProps {
  answeredQuestions: boolean
  submittedProject: boolean
  questionsCount: number
  onNavigateChapters: () => void
  onToggleQuestions: () => void
  onToggleProject: () => void
}

function ActionButtons({
  answeredQuestions,
  submittedProject,
  questionsCount,
  onNavigateChapters,
  onToggleQuestions,
  onToggleProject,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <Button onClick={onNavigateChapters} variant="secondary">
        Zpět na kapitoly
      </Button>
      {!answeredQuestions && questionsCount > 0 && (
        <Button onClick={onToggleQuestions} className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <HelpCircle className="w-5 h-5 mr-2" />
          Zodpovědět otázky
        </Button>
      )}
      {!submittedProject && (
        <Button
          onClick={onToggleProject}
          className="bg-gradient-to-r from-green-500 to-emerald-500"
        >
          <Upload className="w-5 h-5 mr-2" />
          Odevzdat projekt
        </Button>
      )}
    </div>
  )
}

// Completed View
interface CompletedViewProps {
  progress: ReturnType<typeof useChapterProgress>
  questions: unknown[]
  onNavigateChapters: () => void
  onNavigateProfile: () => void
  onToggleQuestions: () => void
  onToggleProject: () => void
}

function CompletedView({
  progress,
  questions,
  onNavigateChapters,
  onNavigateProfile,
  onToggleQuestions,
  onToggleProject,
}: CompletedViewProps) {
  const { completedChapter, answeredQuestions, submittedProject, completionData } = progress

  return (
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

      <StarProgress
        completedChapter={completedChapter}
        answeredQuestions={answeredQuestions}
        submittedProject={submittedProject}
      />

      {completionData && !completionData.alreadyCompleted && (
        <div className="flex gap-4 justify-center items-center flex-wrap mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">+{completionData.xpEarned} XP</span>
          </div>

          {completionData.leveledUp && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Level {completionData.level}</span>
            </div>
          )}

          {completionData.newBadges && completionData.newBadges.length > 0 && (
            <div className="w-full mt-4">
              <p className="text-sm text-gray-400 mb-2">Nové odznaky:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {completionData.newBadges.map((badge, index) => (
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

      <ActionButtons
        answeredQuestions={answeredQuestions}
        submittedProject={submittedProject}
        questionsCount={questions.length}
        onNavigateChapters={onNavigateChapters}
        onToggleQuestions={onToggleQuestions}
        onToggleProject={onToggleProject}
      />

      <Button
        onClick={onNavigateProfile}
        className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500"
      >
        Profil
      </Button>
    </div>
  )
}
