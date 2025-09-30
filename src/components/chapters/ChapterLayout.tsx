'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '@/data/chapters';
import { ChapterHeader } from './ChapterHeader';
import { ChapterContent } from './ChapterContent';
import { VideoPlayer } from './VideoPlayer';
import { NotebookLinks } from './NotebookLinks';
import { ChapterNavigation } from './ChapterNavigation';
import { Box, Stack } from '@/components/layout';
import { PageLayout } from '@/components/layout/page-layout';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Book, FileText, ChevronDown, PlayCircle } from 'lucide-react';

interface ChapterLayoutProps {
  chapter: Chapter;
}

export function ChapterLayout({ chapter }: ChapterLayoutProps) {
  const [expandedSections, setExpandedSections] = useState({
    video: true,  // Video bude default rozbalené
    text: false,
    lecture: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <PageLayout>
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
              <VideoPlayer videoFile={chapter.videoFile} />
            </Section>
          )}

          {/* Studijní materiály - text */}
          <Section
            title="Studijní materiály"
            icon={<FileText className="w-5 h-5" />}
            expanded={expandedSections.text}
            onToggle={() => toggleSection('text')}
          >
            <ChapterContent
              content={chapter.textFile}
              type="text"
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
            />
          </Section>

          {/* Navigace mezi kapitolami */}
          <ChapterNavigation currentChapterId={chapter.id} />
        </Stack>
      </Box>
    </PageLayout>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassSurface className="overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <Stack direction="row" gap={3} align="center">
            <Box className="text-purple-400">{icon}</Box>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </Stack>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
              <Box className="border-t border-gray-700/50 pt-6">
                {children}
              </Box>
            </Box>
          </motion.div>
        )}
      </GlassSurface>
    </motion.div>
  );
}
