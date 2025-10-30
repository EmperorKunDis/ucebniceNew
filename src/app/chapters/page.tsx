'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronRight,
  Lock,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  BookOpen,
  Brain,
  Target,
  Code,
} from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GreySurface } from '@/components/ui/grey-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Stack, Grid, Box } from '@/components/layout'
import { chapters } from '@/data/chapters'

interface ChapterProgress {
  completedChapter: boolean
  answeredQuestions: boolean
  submittedProject: boolean
  completed: boolean
}

export default function ChaptersPage() {
  const [progress, setProgress] = useState<Record<string, ChapterProgress>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch fresh progress data from API
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/chapters/all-progress')
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress || {})
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const getChapterStatus = (chapterId: string) => {
    return progress[chapterId]?.completed ? 'completed' : 'available'
  }

  const getChapterStars = (chapterId: string): [boolean, boolean, boolean] => {
    const p = progress[chapterId]
    return [
      p?.completedChapter || false,
      p?.answeredQuestions || false,
      p?.submittedProject || false,
    ]
  }

  const isChapterLocked = (chapterNumber: number) => {
    // První kapitola je vždy odemčená
    if (chapterNumber === 1) return false

    // Kontrola, zda je předchozí kapitola dokončená
    const previousChapter = chapters.find(ch => {
      const num = parseInt(ch.id)
      return num === chapterNumber - 1
    })

    if (!previousChapter) return false

    return !progress[previousChapter.id]?.completed
  }

  // Seskupení kapitol do modulů
  const modules = [
    {
      id: 'intro',
      number: 1,
      title: 'Úvod do umělé inteligence',
      icon: <Brain className="w-6 h-6" />,
      chapters: chapters.slice(0, 10),
      description: 'Základy AI, historie, vývoj a filozofické otázky moderní umělé inteligence',
    },
    {
      id: 'algorithms',
      number: 2,
      title: 'Jak AI řeší problémy',
      icon: <Target className="w-6 h-6" />,
      chapters: chapters.slice(10, 20),
      description: 'Vyhledávací algoritmy, pravděpodobnost, klasifikace a optimalizace',
    },
    {
      id: 'ml',
      number: 3,
      title: 'Strojové učení',
      icon: <Code className="w-6 h-6" />,
      chapters: chapters.slice(20, 30),
      description: 'Zpracování dat, regrese, klasifikace, vizualizace a praktické projekty',
    },
    {
      id: 'nn',
      number: 4,
      title: 'Neuronové sítě a budoucnost',
      icon: <BookOpen className="w-6 h-6" />,
      chapters: chapters.slice(30, 40),
      description: 'Neuronové sítě, deep learning, etika AI a budoucí trendy',
    },
  ]

  const getModuleProgress = (module: (typeof modules)[0]) => {
    const completedChapters = module.chapters.filter(
      chapter => progress[chapter.id]?.completed
    ).length
    return {
      completed: completedChapters,
      total: module.chapters.length,
      percentage: (completedChapters / module.chapters.length) * 100,
    }
  }

  // Najít další kapitolu k dokončení
  const getNextChapter = () => {
    // Pokud žádný progress, vrať první kapitolu
    if (Object.keys(progress).length === 0) {
      return chapters[0]
    }

    // Najdi první nedokončenou kapitolu
    const nextChapter = chapters.find(chapter => !progress[chapter.id]?.completed)

    // Pokud jsou všechny dokončené, vrať poslední
    return nextChapter || chapters[chapters.length - 1]
  }

  const nextChapter = getNextChapter()

  return (
    <UnifiedPageLayout maxWidth="7xl">
      <SectionHeader subtitle="40 kapitol pokrývajících kompletní cestu od základů umělé inteligence až po pokročilé koncepty. Každá kapitola obsahuje video přednášku, studijní materiály a praktické úlohy. Sbírej XP body a postupuj vlastním tempem!">
        Kapitoly kurzu
      </SectionHeader>

      {/* Modules and chapters */}
      <Box as="section">
        <Stack direction="col" gap={8}>
          {modules.map((module, moduleIndex) => {
            const moduleProgress = getModuleProgress(module)

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
              >
                <GreySurface className="p-8">
                  {/* Module header */}
                  <Stack direction="col" gap={4} className="mb-6">
                    <Stack direction="row" justify="between" align="start" wrap>
                      <Stack direction="row" gap={3} align="center">
                        <Box className="text-purple-400">{module.icon}</Box>
                        <h2 className="text-2xl font-bold text-white">
                          Modul {module.number}: {module.title}
                        </h2>
                      </Stack>
                      <span className="text-sm text-gray-400">
                        {moduleProgress.completed}/{moduleProgress.total} kapitol dokončeno
                      </span>
                    </Stack>
                    <p className="text-gray-400">{module.description}</p>

                    {/* Progress bar */}
                    <Box className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${moduleProgress.percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </Box>
                  </Stack>

                  {/* Chapters grid */}
                  <Grid columns={1} md={2} lg={3} gap={4}>
                    {module.chapters.map((chapter, chapterIndex) => {
                      const chapterNumber = parseInt(chapter.id)
                      const status = getChapterStatus(chapter.id)
                      const [star1, star2, star3] = getChapterStars(chapter.id)
                      const isLocked = isChapterLocked(chapterNumber)
                      const isNext = nextChapter?.id === chapter.id

                      return (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: moduleIndex * 0.1 + chapterIndex * 0.05 }}
                        >
                          {isLocked ? (
                            <Box className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg opacity-50 h-full">
                              <Stack direction="col" gap={2}>
                                <Stack direction="row" justify="between" align="center">
                                  <h3 className="font-semibold text-gray-500">
                                    {chapter.id}. {chapter.title}
                                  </h3>
                                  <Lock className="w-5 h-5 text-gray-600" />
                                </Stack>
                                <p className="text-sm text-gray-600">
                                  Dokončete předchozí kapitolu
                                </p>
                              </Stack>
                            </Box>
                          ) : (
                            <ElectricBorder
                              className={`rounded-lg h-full ${isNext ? 'border-2 border-yellow-400' : ''}`}
                            >
                              <Link
                                href={`/chapters/${chapter.id}`}
                                className={`block p-4 transition-all rounded-lg h-full ${
                                  isNext
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30'
                                    : 'bg-gray-900/50 hover:bg-gray-900/70'
                                }`}
                              >
                                <Stack direction="col" gap={3} className="h-full">
                                  <Stack direction="row" justify="between" align="center">
                                    <h3 className="font-semibold text-white">
                                      Kapitola {chapter.id}
                                      {isNext && (
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-400/30 text-yellow-300 rounded">
                                          Pokračovat zde
                                        </span>
                                      )}
                                    </h3>
                                    {status === 'completed' ? (
                                      <Stack direction="row" gap={1} align="center">
                                        <Sparkles
                                          className={`w-4 h-4 ${star1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        />
                                        <Sparkles
                                          className={`w-4 h-4 ${star2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        />
                                        <Sparkles
                                          className={`w-4 h-4 ${star3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        />
                                      </Stack>
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                  </Stack>

                                  <p className="text-sm font-medium text-white flex-1">
                                    {chapter.title}
                                  </p>

                                  <p className="text-xs text-gray-500">{chapter.description}</p>

                                  <Stack
                                    direction="row"
                                    gap={4}
                                    align="center"
                                    className="text-xs text-gray-500"
                                  >
                                    <Stack direction="row" gap={1} align="center">
                                      <Clock className="w-3 h-3" />
                                      <span>~20 min</span>
                                    </Stack>
                                    <Stack direction="row" gap={1} align="center">
                                      <Award className="w-3 h-3" />
                                      <span>50 XP</span>
                                    </Stack>
                                    <span className="capitalize px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                      střední
                                    </span>
                                  </Stack>
                                </Stack>
                              </Link>
                            </ElectricBorder>
                          )}
                        </motion.div>
                      )
                    })}
                  </Grid>
                </GreySurface>
              </motion.div>
            )
          })}
        </Stack>
      </Box>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <ElectricBorder className="rounded-lg">
          <GreySurface className="p-8 text-center">
            <Stack direction="col" gap={4} align="center">
              <Sparkles className="w-12 h-12 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">
                {Object.keys(progress).length === 0
                  ? 'Připraven začít svou AI cestu?'
                  : Object.keys(progress).length === chapters.length
                    ? 'Gratulujeme k dokončení všech kapitol!'
                    : 'Pokračuj ve své cestě!'}
              </h3>
              <p className="text-gray-400 max-w-xl">
                {Object.keys(progress).length === 0
                  ? 'Projdi všemi 40 kapitolami, získej praktické zkušenosti s umělou inteligencí a staň se součástí naší komunity v Apex Aréně!'
                  : Object.keys(progress).length === chapters.length
                    ? 'Dokončil jsi všechny kapitoly! Prozkoumej Apex Arénu nebo získej certifikát.'
                    : `Dokončil jsi ${Object.keys(progress).length} z ${chapters.length} kapitol. Pokračuj s další kapitolou!`}
              </p>
              {nextChapter && Object.keys(progress).length < chapters.length && (
                <Link
                  href={`/chapters/${nextChapter.id}`}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  {Object.keys(progress).length === 0
                    ? `Začít s Kapitolou ${nextChapter.id}`
                    : `Pokračovat s Kapitolou ${nextChapter.id}`}
                </Link>
              )}
              {Object.keys(progress).length === chapters.length && (
                <Stack direction="row" gap={4}>
                  <Link
                    href="/arena"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                  >
                    Apex Aréna
                  </Link>
                  <Link
                    href="/certificate"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                  >
                    Získat certifikát
                  </Link>
                </Stack>
              )}
            </Stack>
          </GreySurface>
        </ElectricBorder>
      </motion.div>
    </UnifiedPageLayout>
  )
}
