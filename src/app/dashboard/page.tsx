'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Users,
  ChevronRight,
  Star,
  Zap,
  FileCheck
} from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ProfileCard } from '@/components/ui/profile-card'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Stack, Grid, Box } from '@/components/layout'
import { useUserStore } from '@/store/user-store'
import { lessonService } from '@/services/lesson-service'
import { BADGES, XP_REWARDS } from '@/lib/constants'

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  avatar?: string
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'CodeMaster', xp: 15420, level: 12 },
  { rank: 2, username: 'PyNinja', xp: 14200, level: 11 },
  { rank: 3, username: 'AIWizard', xp: 13100, level: 11 },
  { rank: 4, username: 'DataGuru', xp: 11500, level: 10 },
  { rank: 5, username: 'MLExpert', xp: 10200, level: 9 },
]

export default function DashboardPage() {
  const userStore = useUserStore()
  const { username, xp, level, streak, badges, progress } = userStore
  const [totalLessons, setTotalLessons] = useState(0)
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([])

  useEffect(() => {
    // Functions to load stats and generate activity
    const loadStats = async () => {
      const modules = await lessonService.getAllModules()
      const total = modules.reduce((sum, module) => sum + module.lessons.length, 0)
      setTotalLessons(total)
    }
    const generateWeeklyActivity = () => {
      const activity = Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
      setWeeklyActivity(activity)
    }
    loadStats()
    generateWeeklyActivity()
  }, [])

  const completionRate = totalLessons > 0 ? (progress.length / totalLessons) * 100 : 0
  const nextLevelXP = Math.pow(level, 2) * 100
  const currentLevelXP = Math.pow(level - 1, 2) * 100
  const progressToNextLevel = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  const weekDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
  const getActivityOpacityClass = (value: number) => {
    if (value >= 5) return 'opacity-100'
    if (value === 4) return 'opacity-80'
    if (value === 3) return 'opacity-60'
    if (value === 2) return 'opacity-40'
    return 'opacity-20'
  }

  return (
    <Box className="min-h-screen relative overflow-x-hidden bg-black">
      <Lightning className="fixed inset-0 z-0" />

      {/* Navigation */}
      <Box as="nav" className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <Box className="max-w-7xl mx-auto">
          <GlassSurface className="px-6 py-4" borderRadius={16} blur={20}>
            <Stack direction="row" justify="between" align="center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Učebnice AI
              </Link>
              <Stack direction="row" gap={4} align="center">
                <Link href="/lessons" className="text-gray-300 hover:text-white transition-colors">Lekce</Link>
                <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">Apex Aréna</Link>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profil</Link>
              </Stack>
            </Stack>
          </GlassSurface>
        </Box>
      </Box>

      {/* Main content */}
      <Box as="main" className="relative z-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <Box className="max-w-7xl mx-auto">
          {/* Welcome section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Stack direction="col" gap={2} className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Vítej zpět, {username || 'Student'}!
              </h1>
              <p className="text-lg sm:text-xl text-gray-400">
                Pokračuj ve své cestě k mistrovství v programování.
              </p>
            </Stack>
          </motion.div>

          {/* Stats Grid */}
          <Grid columns={1} lg={3} gap={6} className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfileCard showMiniNebula={true} className="h-full" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Grid columns={1} sm={2} gap={4}>
                {/* Streak card */}
                <GlassSurface className="p-6 sm:p-8">
                  <Stack direction="col" gap={4}>
                    <Stack direction="row" justify="between" align="center">
                      <Flame className="w-8 h-8 text-orange-400" />
                      <span className="text-3xl font-bold text-white">{streak}</span>
                    </Stack>
                    <Stack direction="col" gap={1}>
                      <h3 className="text-lg font-semibold text-white">Denní série</h3>
                      <p className="text-sm text-gray-400">Udržuj svou sérii!</p>
                    </Stack>
                  </Stack>
                </GlassSurface>
                
                {/* Completed lessons */}
                <GlassSurface className="p-6">
                  <Stack direction="col" gap={4} className="h-full" justify="between">
                    <Stack direction="row" justify="between" align="center">
                      <Target className="w-8 h-8 text-green-400" />
                      <span className="text-3xl font-bold text-white">{progress.length}</span>
                    </Stack>
                    <Stack direction="col" gap={1}>
                      <h3 className="text-lg font-semibold text-white">Dokončené lekce</h3>
                      <p className="text-sm text-gray-400">{completionRate.toFixed(0)}% kurzu</p>
                    </Stack>
                  </Stack>
                </GlassSurface>

                {/* Level progress */}
                <Box className="sm:col-span-2">
                  <GlassSurface className="p-6">
                    <Stack direction="col" gap={4}>
                      <Stack direction="row" justify="between" align="center">
                        <Stack direction="row" gap={3} align="center">
                          <TrendingUp className="w-8 h-8 text-purple-400" />
                          <Stack direction="col" gap={0}>
                            <h3 className="text-lg font-semibold text-white">Postup do další úrovně</h3>
                            <p className="text-sm text-gray-400">Úroveň {level} → {level + 1}</p>
                          </Stack>
                        </Stack>
                        <span className="text-2xl font-bold text-white">{progressToNextLevel.toFixed(0)}%</span>
                      </Stack>
                      <Box className="h-4 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNextLevel}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </Box>
                    </Stack>
                  </GlassSurface>
                </Box>
              </Grid>
            </motion.div>
          </Grid>

          {/* Weekly activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <GlassSurface className="p-6">
              <Stack direction="col" gap={4}>
                <Stack direction="row" gap={2} align="center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Týdenní aktivita</h2>
                </Stack>
                <Grid columns={7} gap={2}>
                  {weeklyActivity.map((activity, i) => (
                    <Stack key={i} direction="col" gap={2} align="center">
                      <p className="text-xs text-gray-400">{weekDays[i]}</p>
                      <Box
                        className={`w-full h-20 rounded-lg transition-all ${
                          activity > 0 ? `bg-purple-500/80` : 'bg-gray-800/50'
                        }`}
                        style={{ opacity: activity > 0 ? Math.max(0.2, activity / 5) : 1 }}
                        title={`${activity} lekcí`}
                      />
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </GlassSurface>
          </motion.div>

          {/* Certificate CTA */}
          {completionRate >= 80 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
              <ElectricBorder className="rounded-lg">
                <GlassSurface className="p-6 sm:p-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                  <Stack direction="row" justify="between" align="center" wrap className="gap-4">
                    <Stack direction="row" gap={4} align="center" className="flex-1">
                      <FileCheck className="w-12 h-12 text-yellow-400 shrink-0" />
                      <Stack direction="col" gap={1}>
                        <h2 className="text-2xl font-bold text-white">Gratulujeme! 🎉</h2>
                        <p className="text-gray-300">Dokončil/a jsi {completionRate.toFixed(0)}% kurzu a můžeš získat certifikát!</p>
                      </Stack>
                    </Stack>
                    <Button variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black" asChild>
                      <Link href="/certificate">
                        Získat certifikát
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </Stack>
                </GlassSurface>
              </ElectricBorder>
            </motion.div>
          )}

          {/* Bottom section - Badges and Leaderboard */}
          <Grid columns={1} lg={2} gap={6}>
            {/* Badges */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <GlassSurface className="p-6 sm:p-8 h-full">
                <Stack direction="col" gap={4} className="h-full">
                  <Stack direction="row" gap={2} align="center">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Nejnovější odznaky</h2>
                  </Stack>
                  
                  {badges.length > 0 ? (
                    <Grid columns={3} sm={4} gap={4} className="flex-1">
                      {badges.slice(-6).map((badge, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                          <Stack direction="col" gap={2} align="center">
                            <Box className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                              {badge.icon}
                            </Box>
                            <p className="text-xs text-gray-400 text-center">{badge.name}</p>
                          </Stack>
                        </motion.div>
                      ))}
                    </Grid>
                  ) : (
                    <Stack direction="col" gap={4} align="center" justify="center" className="flex-1 py-8">
                      <p className="text-gray-400">Zatím nemáš žádné odznaky</p>
                      <Button variant="ghost" asChild>
                        <Link href="/lessons">
                          Začni sbírat odznaky
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </Stack>
                  )}
                  
                  <Box className="mt-auto pt-6 border-t border-gray-700/50">
                    <Link href="/achievements" className="text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1">
                      Zobrazit všechny úspěchy
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Box>
                </Stack>
              </GlassSurface>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <GlassSurface className="p-6 sm:p-8 h-full">
                <Stack direction="col" gap={4} className="h-full">
                  <Stack direction="row" gap={2} align="center">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Týdenní žebříček</h2>
                  </Stack>
                  
                  <Stack direction="col" gap={3} className="flex-1">
                    {mockLeaderboard.map((entry, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                        <Box className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                          <Stack direction="row" gap={4} align="center">
                            <Box className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                              entry.rank === 1 ? 'bg-yellow-500 text-black' :
                              entry.rank === 2 ? 'bg-gray-400 text-black' :
                              entry.rank === 3 ? 'bg-orange-600 text-white' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {entry.rank}
                            </Box>
                            
                            <Box className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                              {entry.username.charAt(0)}
                            </Box>
                            
                            <Stack direction="col" gap={0} className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{entry.username}</p>
                              <p className="text-xs text-gray-400">Level {entry.level}</p>
                            </Stack>
                            
                            <Stack direction="col" gap={0} align="end">
                              <p className="font-bold text-white">{entry.xp.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">XP</p>
                            </Stack>
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                  
                  <Box className="mt-auto pt-6 border-t border-gray-700/50">
                    <Link href="/leaderboard" className="text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1">
                      Zobrazit celý žebříček
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Box>
                </Stack>
              </GlassSurface>
            </motion.div>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}