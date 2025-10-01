'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Chapter } from '@/data/chapters';
import { ChapterHeader } from './ChapterHeader';
import { ChapterContent } from './ChapterContent';
import { VideoPlayer } from './VideoPlayer';
import { NotebookLinks } from './NotebookLinks';
import { ChapterNavigation } from './ChapterNavigation';
import { Box, Stack } from '@/components/layout';
import { PageLayout } from '@/components/layout/page-layout';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Button } from '@/components/ui/button';
import { Book, FileText, ChevronDown, PlayCircle, CheckCircle, Loader2, Trophy, Zap } from 'lucide-react';

interface ChapterLayoutProps {
  chapter: Chapter;
}

export function ChapterLayout({ chapter }: ChapterLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    video: true,  // Video bude default rozbalené
    text: false,
    lecture: false,
  });
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCompleteChapter = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch('/api/progress/complete-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: chapter.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCompleted(true);
        setCompletionData(data);
      } else {
        console.error('Error completing chapter:', data.error);
        alert(data.error || 'Nepodařilo se dokončit kapitolu');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Něco se pokazilo. Zkuste to znovu.');
    } finally {
      setCompleting(false);
    }
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

          {/* Complete Chapter Button */}
          {session && (
            <GlassSurface className="p-6">
              {!completed && !completionData ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Dokončil jsi tuto kapitolu?
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Získej XP a pokroč ve své cestě učení!
                  </p>
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
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Gratulujeme! 🎉
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {completionData?.alreadyCompleted
                      ? 'Tuto kapitolu už máš dokončenou!'
                      : 'Úspěšně jsi dokončil tuto kapitolu!'}
                  </p>

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
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Dashboard
                  </Button>
                </div>
              )}
            </GlassSurface>
          )}

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
