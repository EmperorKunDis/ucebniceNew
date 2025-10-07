'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Stack, Grid, Box } from '@/components/layout'
import { Trophy, Star, Lock, Award, Loader2 } from 'lucide-react'
import { BADGES, COLORS } from '@/lib/constants'
import { motion } from 'framer-motion'

export default function AchievementsPage() {
  const { data: session } = useSession()
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!session) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          const badgeIds = data.achievements?.map((a: any) => a.badgeId) || []
          setUnlockedBadges(badgeIds)
        }
      } catch (error) {
        console.error('Error fetching achievements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [session])

  const badgesByRarity = Object.entries(BADGES).reduce(
    (acc, [key, badge]) => {
      const rarity = badge.rarity
      if (!acc[rarity]) {
        acc[rarity] = []
      }
      acc[rarity]!.push({ ...badge, key })
      return acc
    },
    {} as Record<string, ((typeof BADGES)[keyof typeof BADGES] & { key: string })[]>
  )

  const totalBadges = Object.keys(BADGES).length
  const completionPercent = Math.round((unlockedBadges.length / totalBadges) * 100)
  const rating = Math.floor(unlockedBadges.length / 2)

  if (isLoading) {
    return (
      <UnifiedPageLayout maxWidth="6xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        </div>
      </UnifiedPageLayout>
    )
  }

  return (
    <UnifiedPageLayout maxWidth="6xl">
      {/* Header */}
      <SectionHeader subtitle="Sbírejte odznaky za dokončené lekce, výzvy a speciální úspěchy">
        Úspěchy a odznaky
      </SectionHeader>

      {/* Stats Grid */}
      <Grid columns={2} md={4} gap={4}>
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          value={unlockedBadges.length}
          label="Odemčeno"
          iconColor="text-yellow-400"
          delay={0.1}
        />

        <StatCard
          icon={<Lock className="w-8 h-8" />}
          value={totalBadges - unlockedBadges.length}
          label="Zamčeno"
          iconColor="text-gray-500"
          delay={0.2}
        />

        <StatCard
          icon={<Award className="w-8 h-8" />}
          value={`${completionPercent}%`}
          label="Dokončeno"
          iconColor="text-purple-400"
          delay={0.3}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-purple-500/30 transition-all duration-300" />
          <div className="relative p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">Hodnocení</div>
          </div>
        </motion.div>
      </Grid>

      {/* Badges by Rarity */}
      <Stack direction="col" gap={8}>
        {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map(
          (rarity, rarityIndex) => {
            const badges = badgesByRarity[rarity] || []
            if (badges.length === 0) return null

            return (
              <motion.div
                key={rarity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + rarityIndex * 0.1, duration: 0.5 }}
              >
                <GlassSurface className="p-8">
                  <Stack direction="row" gap={3} align="center" className="mb-6">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.rarity[rarity] }}
                    />
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.rarity[rarity] }}>
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </h2>
                  </Stack>

                  <Grid columns={2} md={4} lg={6} gap={4}>
                    {badges.map((badge, badgeIndex) => {
                      const isUnlocked = unlockedBadges.includes(badge.id)

                      const BadgeCard = (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.6 + rarityIndex * 0.1 + badgeIndex * 0.02,
                            duration: 0.3,
                          }}
                          className="relative h-full"
                        >
                          <Box
                            className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${
                              isUnlocked
                                ? 'border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                                : 'border-white/5 opacity-50'
                            } transition-all text-center group h-full`}
                          >
                            {!isUnlocked && (
                              <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm z-10">
                                <Lock className="w-8 h-8 text-gray-500" />
                              </div>
                            )}

                            <div className="text-4xl mb-3">{badge.icon}</div>
                            <h3 className="text-sm font-semibold text-white mb-1">{badge.name}</h3>
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                              {badge.description}
                            </p>
                            <div className="text-xs text-yellow-400">+{badge.xpReward} XP</div>
                          </Box>
                        </motion.div>
                      )

                      return isUnlocked ? (
                        <ElectricBorder key={badge.id} className="rounded-xl h-full">
                          {BadgeCard}
                        </ElectricBorder>
                      ) : (
                        BadgeCard
                      )
                    })}
                  </Grid>
                </GlassSurface>
              </motion.div>
            )
          }
        )}
      </Stack>
    </UnifiedPageLayout>
  )
}
