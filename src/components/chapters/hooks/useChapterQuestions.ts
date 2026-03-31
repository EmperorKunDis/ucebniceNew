import { useState, useEffect } from 'react'
import type { Question } from '@/data/questions'

export function useChapterQuestions(chapterId: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/questions?chapterId=${chapterId}`)
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions || [])
        } else {
          setError('Failed to load questions')
        }
      } catch (err) {
        console.error('Failed to load questions:', err)
        setError('Failed to load questions')
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [chapterId])

  return { questions, loading, error }
}
