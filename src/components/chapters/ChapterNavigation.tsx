'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Box, Button } from '@/components/ui'
import { ChevronLeft, ChevronRight, Home, Lock } from 'lucide-react'
import { getNextChapter, getPreviousChapter } from '@/data/chapters'

interface ChapterNavigationProps {
  currentChapterId: string
  isCompleted?: boolean // External prop to signal completion
}

export function ChapterNavigation({
  currentChapterId,
  isCompleted = false,
}: ChapterNavigationProps) {
  const router = useRouter()
  const prevChapter = getPreviousChapter(currentChapterId)
  const nextChapter = getNextChapter(currentChapterId)
  const [isCurrentChapterCompleted, setIsCurrentChapterCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(true)

  // Update state when external prop changes
  useEffect(() => {
    setIsCurrentChapterCompleted(isCompleted)
  }, [isCompleted])

  useEffect(() => {
    async function checkProgress() {
      try {
        const response = await fetch(`/api/chapters/progress?chapterId=${currentChapterId}`)
        if (response.ok) {
          const data = await response.json()
          setIsCurrentChapterCompleted(data.completed || false)
        }
      } catch (error) {
        console.error('Error checking progress:', error)
      } finally {
        setLoading(false)
      }
    }

    checkProgress()
  }, [currentChapterId])

  const isNextChapterLocked = !isCurrentChapterCompleted && nextChapter !== null

  return (
    <Box className="bg-gray-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Předchozí kapitola */}
        <Box className="flex-1 w-full sm:w-auto">
          {prevChapter ? (
            <Button
              onClick={() => router.push(`/chapters/${prevChapter.id}`)}
              variant="secondary"
              className="w-full justify-start gap-2 hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Předchozí kapitola</div>
                <div className="text-sm font-medium">
                  {prevChapter.number}. {prevChapter.title}
                </div>
              </div>
            </Button>
          ) : (
            <div className="invisible">
              <Button variant="secondary" className="w-full">
                Placeholder
              </Button>
            </div>
          )}
        </Box>

        {/* Domů */}
        <Box>
          <Button
            onClick={() => router.push('/chapters')}
            variant="ghost"
            className="gap-2 hover:bg-gray-700"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Seznam kapitol</span>
          </Button>
        </Box>

        {/* Další kapitola */}
        <Box className="flex-1 w-full sm:w-auto">
          {nextChapter ? (
            <Button
              onClick={() => !isNextChapterLocked && router.push(`/chapters/${nextChapter.id}`)}
              variant="secondary"
              className={`w-full justify-end gap-2 flex-row-reverse ${
                isNextChapterLocked
                  ? 'opacity-50 cursor-not-allowed bg-gray-800'
                  : 'hover:bg-gray-700'
              }`}
              disabled={isNextChapterLocked || loading}
            >
              {isNextChapterLocked ? (
                <Lock className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {isNextChapterLocked ? 'Zamčená kapitola' : 'Další kapitola'}
                </div>
                <div className="text-sm font-medium">
                  {nextChapter.number}. {nextChapter.title}
                </div>
              </div>
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/certificate')}
              variant="primary"
              className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              <span>Získat certifikát</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </Box>
      </div>
    </Box>
  )
}
