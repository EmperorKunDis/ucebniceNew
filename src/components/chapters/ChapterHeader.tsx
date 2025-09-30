import { Chapter } from '@/data/chapters';
import { Box, Stack } from '@/components/ui';
import { Clock, BookOpen } from 'lucide-react';

interface ChapterHeaderProps {
  chapter: Chapter;
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <Box className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
      <Stack className="space-y-4">
        <div className="flex items-center gap-2 text-gray-200">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Kapitola {chapter.number}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {chapter.title}
        </h1>
        
        <p className="text-lg text-gray-200 max-w-3xl">
          {chapter.description}
        </p>
        
        <div className="flex items-center gap-4 text-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Hodina {chapter.hours}
            </span>
          </div>
          {chapter.aiBasicsHours && chapter.aiBasicsHours.length > 1 && (
            <span className="text-sm">
              ({chapter.aiBasicsHours.length} vyučovacích hodin)
            </span>
          )}
        </div>
      </Stack>
    </Box>
  );
}