'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Box, Stack, Grid } from '@/components/layout'
import { useUserStore } from '@/store/user-store'

type LeaderboardPeriod = 'all-time' | 'monthly' | 'weekly' | 'daily'

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  badges: number
  streak: number
  change: 'up' | 'down' | 'same'
  changeValue?: number
}

// Mock data
const mockLeaderboard: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  'all-time': [
    { rank: 1, username: 'CodeMaster', xp: 45230, level: 25, badges: 42, streak: 120, change: 'same' },
    { rank: 2, username: 'PyNinja', xp: 42100, level: 23, badges: 38, streak: 89, change: 'up', changeValue: 1 },
    { rank: 3, username: 'AIWizard', xp: 39500, level: 22, badges: 35, streak: 45, change: 'down', changeValue: 1 },
    { rank: 4, username: 'DataGuru', xp: 37200, level: 21, badges: 33, streak: 67, change: 'same' },
    { rank: 5, username: 'MLExpert', xp: 35100, level: 20, badges: 31, streak: 34, change: 'up', changeValue: 3 },
    { rank: 6, username: 'AlgoChamp', xp: 33400, level: 19, badges: 29, streak: 23, change: 'same' },
    { rank: 7, username: 'DeepLearner', xp: 31200, level: 18, badges: 27, streak: 56, change: 'down', changeValue: 2 },
    { rank: 8, username: 'TechNovice', xp: 29800, level: 17, badges: 25, streak: 12, change: 'up', changeValue: 5 },
    { rank: 9, username: 'ByteMaster', xp: 27600, level: 16, badges: 23, streak: 78, change: 'same' },
    { rank: 10, username: 'ScriptKiddo', xp: 25400, level: 15, badges: 21, streak: 4, change: 'same' },
  ],
  'monthly': [
    { rank: 1, username: 'FastLearner', xp: 8900, level: 12, badges: 8, streak: 30, change: 'up', changeValue: 5 },
    { rank: 2, username: 'PyNinja', xp: 8200, level: 23, badges: 38, streak: 89, change: 'same' },
    { rank: 3, username: 'CodeRookie', xp: 7500, level: 8, badges: 6, streak: 28, change: 'up', changeValue: 12 },
    { rank: 4, username: 'AIWizard', xp: 7100, level: 22, badges: 35, streak: 45, change: 'down', changeValue: 2 },
    { rank: 5, username: 'NewCoder', xp: 6800, level: 6, badges: 4, streak: 25, change: 'up', changeValue: 8 },
  ],
  'weekly': [
    { rank: 1, username: 'WeekWarrior', xp: 2100, level: 5, badges: 2, streak: 7, change: 'up', changeValue: 3 },
    { rank: 2, username: 'QuickStudy', xp: 1900, level: 4, badges: 1, streak: 6, change: 'same' },
    { rank: 3, username: 'PyNinja', xp: 1750, level: 23, badges: 38, streak: 89, change: 'down', changeValue: 1 },
    { rank: 4, username: 'SevenDays', xp: 1600, level: 3, badges: 1, streak: 7, change: 'up', changeValue: 2 },
    { rank: 5, username: 'CodeMaster', xp: 1500, level: 25, badges: 42, streak: 120, change: 'same' },
  ],
  'daily': [
    { rank: 1, username: 'DayStarter', xp: 450, level: 2, badges: 0, streak: 1, change: 'same' },
    { rank: 2, username: 'MorningCoder', xp: 380, level: 3, badges: 1, streak: 3, change: 'up', changeValue: 1 },
    { rank: 3, username: 'PyNinja', xp: 320, level: 23, badges: 38, streak: 89, change: 'down', changeValue: 1 },
    { rank: 4, username: 'TodayHero', xp: 280, level: 1, badges: 0, streak: 1, change: 'same' },
    { rank: 5, username: 'DailyGrind', xp: 250, level: 2, badges: 0, streak: 2, change: 'same' },
  ]
}

export default function LeaderboardPage() {
  const { username: currentUser, xp, level, badges } = useUserStore()
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [showOnlyFriends, setShowOnlyFriends] = useState(false)
  
  const leaderboard = mockLeaderboard[period]
  
  // Simulace pozice current usera
  const userPosition = 24
  
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-orange-400" />
      default: return null
    }
  }
  
  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50'
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50'
      case 3: return 'from-orange-500/20 to-orange-600/20 border-orange-500/50'
      default: return ''
    }
  }
  
  const periodOptions = [
    { value: 'all-time', label: 'Celkově', icon: <Trophy className="w-4 h-4" /> },
    { value: 'monthly', label: 'Měsíční', icon: <Calendar className="w-4 h-4" /> },
    { value: 'weekly', label: 'Týdenní', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'daily', label: 'Denní', icon: <Users className="w-4 h-4" /> }
  ]
  
  return (
    <Box className="min-h-screen relative">
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
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">Domů</Link>
                <Link href="/lessons" className="text-gray-300 hover:text-white transition-colors">Lekce</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profil</Link>
              </Stack>
            </Stack>
          </GlassSurface>
        </Box>
      </Box>
      
      {/* Hero section */}
      <Box as="section" className="relative z-10 pt-24 pb-12 px-4">
        <Box className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Žebříček nejlepších
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Soutěžte s ostatními studenty a staňte se mistrem programování
            </p>
          </motion.div>
          
          {/* Period selector */}
          <Stack justify="center" className="mb-8">
            <GlassSurface className="inline-flex p-1">
              {periodOptions.map(option => (
                <Button
                  key={option.value}
                  variant={period === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(option.value as LeaderboardPeriod)}
                  className="gap-2"
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </GlassSurface>
          </Stack>
          
          {/* Filters */}
          <Stack justify="center" className="mb-8">
            <Button
              variant={showOnlyFriends ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowOnlyFriends(!showOnlyFriends)}
            >
              <Users className="w-4 h-4 mr-2" />
              {showOnlyFriends ? 'Zobrazit všechny' : 'Pouze přátelé'}
            </Button>
          </Stack>
          
          {/* Top 3 podium */}
          <Grid columns={1} md={3} gap={4} className="mb-12 max-w-4xl mx-auto">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={i === 0 ? 'md:order-2' : i === 1 ? 'md:order-1' : 'md:order-3'}
              >
                <ElectricBorder className="rounded-lg">
                  <GlassSurface 
                    className={`p-6 text-center bg-gradient-to-br ${getRankColor(entry.rank)}`}
                  >
                    <Box className={`mb-4 ${i === 0 ? 'transform scale-125' : ''}`}>
                      {getRankIcon(entry.rank)}
                    </Box>
                    <Box className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                      {entry.username.charAt(0)}
                    </Box>
                    <h3 className="font-bold text-white mb-1">{entry.username}</h3>
                    <p className="text-gray-400 text-sm mb-3">Level {entry.level}</p>
                    <Box className="space-y-1">
                      <p className="text-2xl font-bold text-white">{entry.xp.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </Box>
                    <Stack direction="row" justify="center" gap={4} className="mt-3 text-xs">
                      <Stack direction="row" gap={1} align="center">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-400">{entry.badges}</span>
                      </Stack>
                      <Stack direction="row" gap={1} align="center">
                        <Trophy className="w-3 h-3 text-orange-400" />
                        <span className="text-gray-400">{entry.streak}d</span>
                      </Stack>
                    </Stack>
                  </GlassSurface>
                </ElectricBorder>
              </motion.div>
            ))}
          </Grid>
          
          {/* Rest of leaderboard */}
          <Box className="max-w-4xl mx-auto">
            <GlassSurface className="p-6">
              <Stack direction="col" gap={2}>
                {leaderboard.slice(3).map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Box className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Stack direction="row" align="center" gap={4}>
                        <Box className="w-12 text-center">
                          <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
                        </Box>
                        
                        <Box className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                          {entry.username.charAt(0)}
                        </Box>
                        
                        <Stack direction="col" gap={0} className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{entry.username}</p>
                          <p className="text-sm text-gray-400">Level {entry.level}</p>
                        </Stack>
                        
                        <Stack direction="row" gap={4} align="center" className="hidden sm:flex">
                          <Stack direction="col" gap={0} align="center">
                            <p className="text-sm font-medium text-white">{entry.xp.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">XP</p>
                          </Stack>
                          <Stack direction="col" gap={0} align="center">
                            <p className="text-sm font-medium text-white">{entry.badges}</p>
                            <p className="text-xs text-gray-400">Odznaků</p>
                          </Stack>
                          <Stack direction="col" gap={0} align="center">
                            <p className="text-sm font-medium text-white">{entry.streak}</p>
                            <p className="text-xs text-gray-400">Série</p>
                          </Stack>
                        </Stack>
                        
                        {entry.change !== 'same' && (
                          <Box className={`flex items-center gap-1 ${
                            entry.change === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            <TrendingUp className={`w-4 h-4 ${entry.change === 'down' ? 'rotate-180' : ''}`} />
                            <span className="text-sm">{entry.changeValue}</span>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
              
              {/* User position if not in top 10 */}
              {userPosition > 10 && (
                <>
                  <Box className="my-4 text-center text-gray-600">• • •</Box>
                  <Box className="p-4 bg-purple-500/20 border-2 border-purple-500/50 rounded-lg">
                    <Stack direction="row" align="center" gap={4}>
                      <Box className="w-12 text-center">
                        <span className="text-xl font-bold text-purple-300">#{userPosition}</span>
                      </Box>
                      
                      <Box className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                        {(currentUser || 'Y').charAt(0)}
                      </Box>
                      
                      <Stack direction="col" gap={0} className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{currentUser || 'You'} (Ty)</p>
                        <p className="text-sm text-gray-400">Level {level}</p>
                      </Stack>
                      
                      <Stack direction="row" gap={4} align="center" className="hidden sm:flex">
                        <Stack direction="col" gap={0} align="center">
                          <p className="text-sm font-medium text-white">{xp.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">XP</p>
                        </Stack>
                        <Stack direction="col" gap={0} align="center">
                          <p className="text-sm font-medium text-white">{badges.length}</p>
                          <p className="text-xs text-gray-400">Odznaků</p>
                        </Stack>
                        <Stack direction="col" gap={0} align="center">
                          <p className="text-sm font-medium text-white">0</p>
                          <p className="text-xs text-gray-400">Série</p>
                        </Stack>
                      </Stack>
                      
                      <Box className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">3</span>
                      </Box>
                    </Stack>
                  </Box>
                </>
              )}
            </GlassSurface>
            
            {/* Call to action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400 mb-4">Chcete vylepšit svou pozici?</p>
              <ElectricBorder className="inline-block rounded-lg">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/lessons">
                    Pokračovat v učení
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </ElectricBorder>
            </motion.div>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}