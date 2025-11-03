'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Box, Stack, Grid } from '@/components/layout'
import { ProfileCard } from '@/components/ui/profile-card'

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

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserStats, setCurrentUserStats] = useState<any>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period])

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session) return

      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setCurrentUserStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    fetchUserStats()
  }, [session])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50'
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50'
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50'
      default:
        return ''
    }
  }

  const periodOptions = [
    { value: 'all-time', label: 'Celkově', icon: <Trophy className="w-4 h-4" /> },
    { value: 'monthly', label: 'Měsíční', icon: <Calendar className="w-4 h-4" /> },
    { value: 'weekly', label: 'Týdenní', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'daily', label: 'Denní', icon: <Users className="w-4 h-4" /> },
  ]

  // Find current user position
  const currentUsername = currentUserStats?.user?.username
  const userPosition = leaderboard.findIndex(entry => entry.username === currentUsername) + 1

  if (isLoading) {
    return (
      <UnifiedPageLayout maxWidth="7xl">
        <div
          className="flex items-center justify-center min-h-[60vh]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" aria-hidden="true" />
          <span className="sr-only">Načítání žebříčku...</span>
        </div>
      </UnifiedPageLayout>
    )
  }

  return (
    <UnifiedPageLayout maxWidth="7xl">
      <SectionHeader subtitle="Soutěžte s ostatními studenty a staňte se mistrem programování">
        Žebříček nejlepších
      </SectionHeader>

      {/* Period selector */}
      <Stack justify="center">
        <GlassSurface className="inline-flex p-1" role="group" aria-label="Výběr období žebříčku">
          {periodOptions.map(option => (
            <Button
              key={option.value}
              variant={period === option.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(option.value as LeaderboardPeriod)}
              className="gap-2"
              aria-pressed={period === option.value}
              aria-label={`Zobrazit ${option.label.toLowerCase()} žebříček`}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </GlassSurface>
      </Stack>

      {leaderboard.length === 0 ? (
        <Box className="text-center py-12">
          <p className="text-gray-400">Žádní uživatelé zatím nejsou v žebříčku</p>
        </Box>
      ) : (
        <>
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <Grid
              columns={1}
              md={3}
              gap={4}
              className="max-w-4xl mx-auto"
              role="list"
              aria-label="Top 3 uživatelé"
            >
              {leaderboard.slice(0, 3).map((entry, i) => {
                // Podium ordering: 2nd (left), 1st (middle), 3rd (right)
                // i=0 (1st place) -> order-2 (middle on all screens)
                // i=1 (2nd place) -> order-1 (left on all screens)
                // i=2 (3rd place) -> order-3 (right on all screens)
                const orderClass = i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'

                return (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={orderClass}
                    role="listitem"
                  >
                    <div className="relative">
                      {/* Rank Icon Badge */}
                      <div
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 ${i === 0 ? 'transform scale-125' : ''}`}
                      >
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* ProfileCard with custom styling for podium */}
                      <div
                        className={`bg-gradient-to-br ${getRankColor(entry.rank)} rounded-lg p-1`}
                      >
                        <ProfileCard
                          name={entry.username}
                          title={`Level ${entry.level}`}
                          handle={entry.username}
                          status={`${entry.xp.toLocaleString()} XP`}
                          avatarUrl={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                          miniAvatarUrl={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                          showUserInfo={false}
                          enableTilt={i === 0}
                          className={i === 0 ? 'scale-105' : ''}
                        />
                      </div>

                      {/* Stats below card */}
                      <Stack direction="row" justify="center" gap={4} className="mt-3 text-xs">
                        <Stack direction="row" gap={1} align="center">
                          <Trophy className="w-3 h-3 text-yellow-400" aria-hidden="true" />
                          <span className="text-gray-400">{entry.badges}</span>
                        </Stack>
                        <Stack direction="row" gap={1} align="center">
                          <Trophy className="w-3 h-3 text-orange-400" aria-hidden="true" />
                          <span className="text-gray-400">{entry.streak}d</span>
                        </Stack>
                      </Stack>
                    </div>
                  </motion.div>
                )
              })}
            </Grid>
          )}

          {/* Rest of leaderboard */}
          {leaderboard.length > 3 && (
            <Box className="max-w-4xl mx-auto">
              <GlassSurface className="p-6">
                <Stack direction="col" gap={2} role="list" aria-label="Žebříček místo 4 a níže">
                  {leaderboard.slice(3).map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      role="listitem"
                    >
                      <Box
                        className={`p-4 rounded-lg transition-all ${
                          entry.username === currentUsername
                            ? 'bg-purple-500/20 border-2 border-purple-500/50'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        aria-label={`${entry.rank}. místo: ${entry.username}${entry.username === currentUsername ? ' (Ty)' : ''}, Level ${entry.level}, ${entry.xp.toLocaleString()} XP, ${entry.badges} odznaků, ${entry.streak} denní série`}
                        aria-current={entry.username === currentUsername ? 'true' : undefined}
                      >
                        <Stack direction="row" align="center" gap={4}>
                          <Box className="w-12 text-center">
                            <span
                              className={`text-xl font-bold ${
                                entry.username === currentUsername
                                  ? 'text-purple-300'
                                  : 'text-gray-400'
                              }`}
                            >
                              #{entry.rank}
                            </span>
                          </Box>

                          <Box className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                            {entry.username.charAt(0).toUpperCase()}
                          </Box>

                          <Stack direction="col" gap={0} className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {entry.username}
                              {entry.username === currentUsername && ' (Ty)'}
                            </p>
                            <p className="text-sm text-gray-400">Level {entry.level}</p>
                          </Stack>

                          <Stack direction="row" gap={4} align="center" className="hidden sm:flex">
                            <Stack direction="col" gap={0} align="center">
                              <p className="text-sm font-medium text-white">
                                {entry.xp.toLocaleString()}
                              </p>
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
                            <Box
                              className={`flex items-center gap-1 ${
                                entry.change === 'up' ? 'text-green-400' : 'text-red-400'
                              }`}
                              aria-label={`${entry.change === 'up' ? 'Vzestup' : 'Pokles'} o ${entry.changeValue} míst`}
                            >
                              <TrendingUp
                                className={`w-4 h-4 ${entry.change === 'down' ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                              <span className="text-sm" aria-hidden="true">
                                {entry.changeValue}
                              </span>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </GlassSurface>
            </Box>
          )}
        </>
      )}

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-gray-400 mb-4">
          {userPosition > 0
            ? `Jsi na ${userPosition}. místě! Chceš vylepšit svou pozici?`
            : 'Chcete se dostat do žebříčku?'}
        </p>
        <ElectricBorder className="inline-block rounded-lg">
          <Button variant="primary" size="lg" asChild>
            <Link href="/chapters" aria-label="Pokračovat v učení - přejít na kapitoly">
              Pokračovat v učení
              <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </ElectricBorder>
      </motion.div>
    </UnifiedPageLayout>
  )
}
