'use client';

import { useState } from 'react';
import { Chapter } from '@/data/chapters';
import { ChapterHeader } from './ChapterHeader';
import { ChapterContent } from './ChapterContent';
import { VideoPlayer } from './VideoPlayer';
import { NotebookLinks } from './NotebookLinks';
import { ChapterNavigation } from './ChapterNavigation';
import { Box, Stack } from '@/components/ui';
import { Book, Video, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface ChapterLayoutProps {
  chapter: Chapter;
}

export function ChapterLayout({ chapter }: ChapterLayoutProps) {
  const [expandedSections, setExpandedSections] = useState({
    text: true,
    lecture: false,
    video: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Box className="min-h-screen bg-gray-900">
      <Box className="max-w-7xl mx-auto px-4 py-8">
        <ChapterHeader chapter={chapter} />
        
        <Stack className="mt-8 space-y-6">
          {/* Rychlé odkazy */}
          <NotebookLinks chapter={chapter} />

          {/* Úvodní text */}
          <Section
            title="Úvodní text"
            icon={<FileText className="w-5 h-5" />}
            expanded={expandedSections.text}
            onToggle={() => toggleSection('text')}
          >
            <ChapterContent 
              content={chapter.textFile} 
              type="text"
              chapterId={chapter.id}
            />
          </Section>

          {/* Kompletní přednáška */}
          <Section
            title="Kompletní přednáška"
            icon={<Book className="w-5 h-5" />}
            expanded={expandedSections.lecture}
            onToggle={() => toggleSection('lecture')}
          >
            <ChapterContent 
              content={chapter.lectureFile} 
              type="lecture"
              chapterId={chapter.id}
            />
          </Section>

          {/* Video */}
          {chapter.videoFile && (
            <Section
              title="Video přednáška"
              icon={<Video className="w-5 h-5" />}
              expanded={expandedSections.video}
              onToggle={() => toggleSection('video')}
            >
              <VideoPlayer videoFile={chapter.videoFile} />
            </Section>
          )}

          {/* Navigace */}
          <ChapterNavigation currentChapterId={chapter.id} />
        </Stack>
      </Box>
    </Box>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, expanded, onToggle, children }: SectionProps) {
  return (
    <Box className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-400">{icon}</span>
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {expanded && (
        <Box className="px-6 pb-6">
          <Box className="border-t border-gray-700 pt-6">
            {children}
          </Box>
        </Box>
      )}
    </Box>
  );
}