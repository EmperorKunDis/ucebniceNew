import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ChapterProgressState {
  completedChapter: boolean
  answeredQuestions: boolean
  submittedProject: boolean
  completed: boolean
  isChapterLocked: boolean
  loading: boolean
  questionAnswers: Map<string, boolean>
}

interface CompletionData {
  xpEarned?: number
  leveledUp?: boolean
  level?: number
  newBadges?: Array<{ icon: string; name: string }>
  alreadyCompleted?: boolean
  completedChapter?: boolean
  answeredQuestions?: boolean
  submittedProject?: boolean
}

export function useChapterProgress(chapterId: string) {
  const { data: session } = useSession()

  const [state, setState] = useState<ChapterProgressState>({
    completedChapter: false,
    answeredQuestions: false,
    submittedProject: false,
    completed: false,
    isChapterLocked: false,
    loading: true,
    questionAnswers: new Map(),
  })

  const [completing, setCompleting] = useState(false)
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)

  // Load chapter progress on mount
  useEffect(() => {
    async function loadProgress() {
      if (!session) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        const chapterNumber = parseInt(chapterId)

        // Check if chapter is locked (needs previous chapter completion)
        if (chapterNumber > 1) {
          const allProgressResponse = await fetch('/api/chapters/all-progress')
          if (allProgressResponse.ok) {
            const allProgressData = await allProgressResponse.json()
            const progressMap = allProgressData.progress || {}
            const previousChapterId = String(chapterNumber - 1).padStart(2, '0')
            const isPreviousCompleted = progressMap[previousChapterId]?.completed || false

            if (!isPreviousCompleted) {
              setState(prev => ({ ...prev, isChapterLocked: true, loading: false }))
              return
            }
          }
        }

        // Load current chapter progress
        const response = await fetch(`/api/chapters/progress?chapterId=${chapterId}`)
        const data = await response.json()

        if (response.ok) {
          const answersMap = new Map<string, boolean>()
          data.questionAnswers?.forEach((qa: { questionId: string; correct: boolean }) => {
            answersMap.set(qa.questionId, qa.correct)
          })

          setState(prev => ({
            ...prev,
            completedChapter: data.completedChapter || false,
            answeredQuestions: data.answeredQuestions || false,
            submittedProject: data.submittedProject || false,
            completed: data.completed || false,
            questionAnswers: answersMap,
            loading: false,
          }))

          if (data.completed) {
            setCompletionData({ alreadyCompleted: true })
          }
        }
      } catch (error) {
        console.error('Error loading chapter progress:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    loadProgress()
  }, [chapterId, session])

  const completeChapter = useCallback(async (): Promise<CompletionData | null> => {
    if (!session) return null

    setCompleting(true)
    try {
      const response = await fetch('/api/progress/complete-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      })

      const data = await response.json()

      if (response.ok) {
        setState(prev => ({
          ...prev,
          completed: true,
          completedChapter: data.completedChapter || true,
          answeredQuestions: data.answeredQuestions || false,
          submittedProject: data.submittedProject || false,
        }))
        setCompletionData(data)
        toast.success('Kapitola dokončena! 🎉')
        return data
      } else {
        toast.error(data.error || 'Nepodařilo se dokončit kapitolu')
        return null
      }
    } catch (error) {
      console.error('Error completing chapter:', error)
      toast.error('Něco se pokazilo. Zkuste to znovu.')
      return null
    } finally {
      setCompleting(false)
    }
  }, [chapterId, session])

  const answerQuestion = useCallback(
    async (
      questionId: string,
      answerIndex: number
    ): Promise<{
      correct: boolean
      explanation: string
      xpEarned: number
      correctAnswer?: { index: number; text?: string }
    }> => {
      if (!session) {
        return { correct: false, explanation: 'Musíš být přihlášen', xpEarned: 0 }
      }

      try {
        const response = await fetch('/api/questions/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId, questionId, answerIndex }),
        })

        const data = await response.json()

        if (response.ok) {
          setState(prev => {
            const newAnswers = new Map(prev.questionAnswers)
            newAnswers.set(questionId, data.correct)
            return {
              ...prev,
              questionAnswers: newAnswers,
              answeredQuestions: data.allQuestionsCompleted || prev.answeredQuestions,
            }
          })

          if (data.allQuestionsCompleted) {
            toast.success('Všechny otázky správně! Získal jsi druhou hvězdičku! 🌟')
          }

          return data
        }

        return { correct: false, explanation: data.error, xpEarned: 0 }
      } catch (error) {
        console.error('Error answering question:', error)
        return { correct: false, explanation: 'Chyba při odesílání odpovědi', xpEarned: 0 }
      }
    },
    [chapterId, session]
  )

  const markProjectSubmitted = useCallback(() => {
    setState(prev => ({ ...prev, submittedProject: true }))
    toast.success('Získal jsi třetí hvězdičku! 🌟')
  }, [])

  return {
    ...state,
    completing,
    completionData,
    completeChapter,
    answerQuestion,
    markProjectSubmitted,
    isAuthenticated: !!session,
  }
}
