'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { Stack, Grid, Box } from '@/components/layout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Trophy, Zap, Target, LogOut, Loader2, Award } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { getProgressToNextLevel } from '@/lib/gamification'
import Image from 'next/image'
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload'

interface UserStats {
  user: {
    id: string
    name: string | null
    email: string
    username: string | null
    image: string | null
    xp: number
    level: number
    currentStreak: number
    longestStreak: number
    createdAt: Date
  }
  stats: {
    completedChapters: number
    totalAchievements: number
    currentStreak: number
    longestStreak: number
    levelProgress: ReturnType<typeof getProgressToNextLevel>
  }
  achievements: Array<{
    id: string
    badgeId: string
    name: string
    description: string
    icon: string
    xpReward: number
    rarity: string
    unlockedAt: Date
  }>
  recentCompletions: Array<{
    id: string
    lessonTitle: string
    completedAt: Date
    xpEarned: number
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }

    if (status === 'authenticated') {
      fetchUserStats()
    }
  }, [status, router])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <UnifiedPageLayout showNav={false}>
        <Box className="min-h-[60vh] flex items-center justify-center">
          <Stack direction="col" gap={4} align="center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-gray-300">Načítání profilu...</p>
          </Stack>
        </Box>
      </UnifiedPageLayout>
    )
  }

  if (!session?.user || !userStats) {
    return null
  }

  const memberSince = new Date(userStats.user.createdAt).toLocaleDateString('cs-CZ', {
    month: 'long',
    year: 'numeric',
  })

  const levelProgress = userStats.stats.levelProgress

  return (
    <UnifiedPageLayout maxWidth="4xl">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassSurface className="p-8">
          <Stack direction="col" gap={6}>
            {/* Avatar and Name */}
            <Stack direction="row" gap={6} align="start" wrap>
              <ProfilePhotoUpload
                currentImage={userStats.user.image}
                userName={userStats.user.name || 'Uživatel'}
                onUpload={async file => {
                  // TODO: Implement upload logic
                  console.log('Uploading file:', file.name)
                  // You can add API call here to upload the image
                }}
              />

              <Box className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {userStats.user.name || 'Uživatel'}
                </h1>
                <p className="text-gray-400 mt-1">
                  @{userStats.user.username || userStats.user.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                    <span className="text-sm font-medium text-purple-300">
                      Level {userStats.user.level}
                    </span>
                  </div>
                </div>
              </Box>
            </Stack>

            {/* Info Grid */}
            <Grid columns={1} md={3} gap={4}>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Stack direction="row" gap={3} align="center" className="text-gray-400 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </Stack>
                <p className="text-white truncate">{userStats.user.email}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Stack direction="row" gap={3} align="center" className="text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Člen od</span>
                </Stack>
                <p className="text-white">{memberSince}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Stack direction="row" gap={3} align="center" className="text-gray-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Level</span>
                </Stack>
                <p className="text-white">{userStats.user.level}</p>
              </div>
            </Grid>

            {/* Level Progress */}
            <Box>
              <Stack direction="row" justify="between" align="center" className="mb-2">
                <span className="text-sm text-gray-300">
                  Pokrok do Level {userStats.user.level + 1}
                </span>
                <span className="text-sm text-purple-400 font-medium">
                  {Math.round(levelProgress.progressPercent)}%
                </span>
              </Stack>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {userStats.user.xp} / {levelProgress.nextLevelXP} XP
              </p>
            </Box>
          </Stack>
        </GlassSurface>
      </motion.div>

      {/* Stats Grid */}
      <Grid columns={2} lg={4} gap={4}>
        <StatCard
          icon={<Zap className="w-8 h-8" />}
          value={userStats.user.xp}
          label="Celkem XP"
          iconColor="text-yellow-400"
          delay={0.1}
        />

        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          value={userStats.achievements.length}
          label="Odznaků"
          iconColor="text-blue-400"
          delay={0.2}
        />

        <StatCard
          icon={<Target className="w-8 h-8" />}
          value={userStats.stats.completedChapters}
          label="Dokončených kapitol"
          iconColor="text-green-400"
          delay={0.3}
        />

        <StatCard
          icon={<span className="text-3xl">🔥</span>}
          value={userStats.user.currentStreak}
          label="Denní streak"
          iconColor=""
          delay={0.4}
        />
      </Grid>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <GlassSurface className="p-8">
          <Stack direction="row" gap={2} align="center" className="mb-6">
            <Award className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Poslední úspěchy</h2>
          </Stack>

          {userStats.achievements.length > 0 ? (
            <Grid columns={2} md={4} gap={4}>
              {userStats.achievements.slice(0, 8).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                >
                  <ElectricBorder className="rounded-lg">
                    <div className="p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
                      <Stack direction="col" gap={2} align="center">
                        <div className="text-4xl">{achievement.icon}</div>
                        <h3 className="text-sm font-medium text-white text-center">
                          {achievement.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 text-center">
                          {achievement.description}
                        </p>
                        <div className="text-xs text-purple-400">+{achievement.xpReward} XP</div>
                      </Stack>
                    </div>
                  </ElectricBorder>
                </motion.div>
              ))}
            </Grid>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Zatím nemáte žádné odznaky. Začněte s lekcemi a získejte své první úspěchy!
            </p>
          )}
        </GlassSurface>
      </motion.div>

      {/* Actions */}
      <Stack direction="row" justify="between" align="center" wrap>
        <ElectricBorder className="rounded-lg">
          <Link href="/achievements">
            <Button
              variant="secondary"
              className="bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10"
            >
              Zobrazit všechny úspěchy
            </Button>
          </Link>
        </ElectricBorder>

        <Button
          onClick={() => signOut({ callbackUrl: '/' })}
          variant="ghost"
          className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Odhlásit se
        </Button>
      </Stack>
    </UnifiedPageLayout>
  )
}
