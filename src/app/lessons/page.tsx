'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ChevronRight, 
  Lock, 
  CheckCircle, 
  Clock, 
  Award,
  BookOpen,
  Code,
  Sparkles
} from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Stack, Grid, Box } from '@/components/layout'
import { lessonService } from '@/services/lesson-service'
import { useUserStore } from '@/store/user-store'
import { Module } from '@/types/lesson'

export default function LessonsPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const { progress } = useUserStore()

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    setLoading(true)
    const data = await lessonService.getAllModules()
    setModules(data)
    setLoading(false)
  }

  const getLessonStatus = (lessonId: string) => {
    const lessonProgress = progress.find(p => p.lessonId === lessonId)
    return lessonProgress ? 'completed' : 'available'
  }

  const isLessonLocked = (lessonId: string, prerequisites?: string[]) => {
    if (!prerequisites || prerequisites.length === 0) return false
    return !prerequisites.every(prereq => 
      progress.some(p => p.lessonId === prereq)
    )
  }

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson => 
      progress.some(p => p.lessonId === lesson.id)
    ).length
    return {
      completed: completedLessons,
      total: module.lessons.length,
      percentage: (completedLessons / module.lessons.length) * 100
    }
  }

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-black">
        <Lightning className="fixed inset-0 z-0" />
        <Box className="relative z-10">
          <GlassSurface className="p-8">
            <Stack direction="col" gap={4} align="center" className="animate-pulse">
              <Box className="w-12 h-12 bg-purple-500/30 rounded-full" />
              <p className="text-gray-400">Načítám lekce...</p>
            </Stack>
          </GlassSurface>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="min-h-screen relative bg-black">
      <Lightning className="fixed inset-0 z-0" />
      
      {/* Navigation */}
      <Box as="nav" className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <Box className="max-w-7xl mx-auto">
          <GlassSurface className="px-6 py-4" borderRadius={16} blur={20} backgroundOpacity={0.02} opacity={0.95}>
            <Stack direction="row" justify="between" align="center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Učebnice AI
              </Link>
              
              <Stack direction="row" gap={4}>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/chapters" className="text-gray-300 hover:text-white transition-colors">
                  Kapitoly
                </Link>
                <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">
                  Apex Aréna
                </Link>
              </Stack>
            </Stack>
          </GlassSurface>
        </Box>
      </Box>
      
      {/* Hero section */}
      <Box as="section" className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <Box className="max-w-7xl mx-auto">
          <Stack direction="col" gap={4} align="center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-center"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Kurikulum
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl text-center"
            >
              Postupuj vlastním tempem skrz kompletní kurz programování s AI. 
              Každá lekce tě posune blíž k tvým cílům.
            </motion.p>
          </Stack>
        </Box>
      </Box>
      
      {/* Modules and lessons */}
      <Box as="section" className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-24">
        <Box className="max-w-7xl mx-auto">
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
                  <GlassSurface className="p-8">
                    {/* Module header */}
                    <Stack direction="col" gap={4} className="mb-6">
                      <Stack direction="row" justify="between" align="start" wrap>
                        <h2 className="text-2xl font-bold text-white">
                          Modul {module.number}: {module.title}
                        </h2>
                        <span className="text-sm text-gray-400">
                          {moduleProgress.completed}/{moduleProgress.total} lekcí dokončeno
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
                  
                    {/* Lessons grid */}
                    <Grid columns={1} md={2} lg={3} gap={4}>
                      {module.lessons.map((lesson, lessonIndex) => {
                        const status = getLessonStatus(lesson.id)
                        const isLocked = isLessonLocked(lesson.id, lesson.prerequisites)
                        
                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: moduleIndex * 0.1 + lessonIndex * 0.05 }}
                          >
                            {isLocked ? (
                              <Box className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg opacity-50 h-full">
                                <Stack direction="col" gap={2}>
                                  <Stack direction="row" justify="between" align="center">
                                    <h3 className="font-semibold text-gray-500">
                                      {lesson.number}. {lesson.title}
                                    </h3>
                                    <Lock className="w-5 h-5 text-gray-600" />
                                  </Stack>
                                  <p className="text-sm text-gray-600">Dokončete předchozí lekce</p>
                                </Stack>
                              </Box>
                            ) : (
                              <ElectricBorder className="rounded-lg h-full">
                                <Link 
                                  href={`/lessons/${lesson.id}`}
                                  className="block p-4 bg-gray-900/50 hover:bg-gray-900/70 transition-all rounded-lg h-full"
                                >
                                  <Stack direction="col" gap={3} className="h-full">
                                    <Stack direction="row" justify="between" align="center">
                                      <h3 className="font-semibold text-white">
                                        {lesson.number}. {lesson.title}
                                      </h3>
                                      {status === 'completed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                      )}
                                    </Stack>
                                    
                                    <p className="text-sm text-gray-400 flex-1">{lesson.description}</p>
                                    
                                    <Stack direction="row" gap={4} align="center" className="text-xs text-gray-500">
                                      <Stack direction="row" gap={1} align="center">
                                        <Clock className="w-3 h-3" />
                                        <span>{lesson.duration} min</span>
                                      </Stack>
                                      <Stack direction="row" gap={1} align="center">
                                        <Award className="w-3 h-3" />
                                        <span>{lesson.xpReward} XP</span>
                                      </Stack>
                                      <span className="capitalize px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                        {lesson.difficulty}
                                      </span>
                                    </Stack>
                                  </Stack>
                                </Link>
                              </ElectricBorder>
                            )}
                          </motion.div>
                        )
                      })}
                    
                      {/* Capstone project */}
                      {module.capstoneProject && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: moduleIndex * 0.1 + module.lessons.length * 0.05 }}
                          className="md:col-span-2 lg:col-span-3"
                        >
                          <GlassSurface 
                            className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30"
                          >
                            <Stack direction="row" gap={4} align="center">
                              <Box className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                <Sparkles className="w-8 h-8 text-white" />
                              </Box>
                              <Stack direction="col" gap={2} className="flex-1">
                                <h3 className="text-xl font-bold text-white">
                                  Hlavní projekt: {module.capstoneProject.title}
                                </h3>
                                <p className="text-gray-400">{module.capstoneProject.description}</p>
                                <Stack direction="row" gap={4}>
                                  <span className="text-sm text-gray-500">
                                    {module.capstoneProject.xpReward} XP
                                  </span>
                                  <span className="text-sm text-purple-400">
                                    {module.capstoneProject.requirements.length} požadavků
                                  </span>
                                </Stack>
                              </Stack>
                              <ChevronRight className="w-6 h-6 text-gray-400 shrink-0" />
                            </Stack>
                          </GlassSurface>
                        </motion.div>
                      )}
                    </Grid>
                  </GlassSurface>
                </motion.div>
              )
            })}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}