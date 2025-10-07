import Link from 'next/link'
import { memo } from 'react'
import { Chapter } from '@/data/chapters'
import { Box } from '@/components/ui'
import { Clock, BookOpen, Video, ChevronRight } from 'lucide-react'

interface ChapterCardProps {
  chapter: Chapter
}

function ChapterCardComponent({ chapter }: ChapterCardProps) {
  const hasVideo = !!chapter.videoFile
  const hasNotebook = !!chapter.notebookLMUrl || !!chapter.colabNotebook

  return (
    <Link href={`/chapters/${chapter.id}`}>
      <Box className="group bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-600/50 rounded-xl p-6 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Číslo kapitoly */}
            <div className="text-sm font-medium text-blue-400 mb-2">Kapitola {chapter.number}</div>

            {/* Název */}
            <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-300 transition-colors mb-2">
              {chapter.title}
            </h3>

            {/* Popis */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{chapter.description}</p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Hodina {chapter.hours}</span>
              </div>

              {hasVideo && (
                <div className="flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  <span>Video</span>
                </div>
              )}

              {hasNotebook && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Interaktivní</span>
                </div>
              )}
            </div>
          </div>

          {/* Šipka */}
          <div className="ml-4 mt-1">
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </Box>
    </Link>
  )
}

// Memoize to prevent unnecessary re-renders
export const ChapterCard = memo(ChapterCardComponent)
