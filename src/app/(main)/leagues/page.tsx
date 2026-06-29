'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2, Crown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeagueStatus {
  currentTier: string
  weeklyXP: number
  rank: number
  totalMembers: number
  promotionZone: number
  demotionZone: number
  daysRemaining: number
  zone: 'promotion' | 'safe' | 'demotion'
}

interface LeaderboardMember {
  rank: number
  userId: string
  username: string
  avatar: string | null
  level: number
  streak: number
  weeklyXP: number
  isCurrentUser: boolean
  zone: 'promotion' | 'safe' | 'demotion'
}

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  BRONZE: { bg: 'from-amber-700 to-amber-900', text: 'text-amber-400', icon: '🥉' },
  SILVER: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-300', icon: '🥈' },
  GOLD: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-400', icon: '🥇' },
  PLATINUM: { bg: 'from-cyan-400 to-cyan-600', text: 'text-cyan-400', icon: '💎' },
  DIAMOND: { bg: 'from-blue-400 to-purple-500', text: 'text-blue-400', icon: '💠' },
  OBSIDIAN: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400', icon: '🔮' },
}

export default function LeaguesPage() {
  const [status, setStatus] = useState<LeagueStatus | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, leaderboardRes] = await Promise.all([
        fetch('/api/leagues/current'),
        fetch('/api/leagues/leaderboard'),
      ])

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setStatus(statusData.data)
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData.data.members)
      }
    } catch (error) {
      console.error('Error fetching league data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Nepodařilo se načíst ligu</p>
      </div>
    )
  }

  const tierStyle = TIER_COLORS[status.currentTier] ?? {
    bg: 'from-amber-700 to-amber-900',
    text: 'text-amber-400',
    icon: '🥉',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* League Header */}
        <motion.div
          className={cn('rounded-2xl p-6 mb-6 bg-gradient-to-br', tierStyle.bg)}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-4xl">{tierStyle.icon}</span>
                <h1 className="text-2xl font-bold text-white">{status.currentTier} Liga</h1>
              </div>
              <p className="text-white/80 mt-1">
                Zbývá {status.daysRemaining} {status.daysRemaining === 1 ? 'den' : 'dní'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-white/60 text-sm">Tvé XP</p>
              <p className="text-3xl font-bold text-white">{status.weeklyXP}</p>
              <p className="text-white/80">
                #{status.rank} z {status.totalMembers}
              </p>
            </div>
          </div>

          {/* Zone indicator */}
          <div className="mt-4 flex items-center gap-2">
            {status.zone === 'promotion' && (
              <>
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Postup do vyšší ligy!</span>
              </>
            )}
            {status.zone === 'safe' && (
              <>
                <Shield className="w-5 h-5 text-white/80" />
                <span className="text-white/80">Bezpečná zóna</span>
              </>
            )}
            {status.zone === 'demotion' && (
              <>
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Ohrožení sestupu!</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Žebříček
            </h2>
          </div>

          <div className="divide-y divide-gray-700/50">
            {leaderboard.map((member, index) => (
              <motion.div
                key={member.userId}
                className={cn(
                  'flex items-center gap-3 p-4 transition-colors',
                  member.isCurrentUser && 'bg-indigo-900/30'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                {/* Rank */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    member.rank === 1 && 'bg-yellow-500 text-yellow-900',
                    member.rank === 2 && 'bg-gray-400 text-gray-900',
                    member.rank === 3 && 'bg-amber-600 text-amber-100',
                    member.rank > 3 && 'bg-gray-700 text-gray-300'
                  )}
                >
                  {member.rank <= 3 ? <Crown className="w-4 h-4" /> : member.rank}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                  {member.avatar ? (
                    <>
                      {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar}
                        alt={member.username}
                        className="w-full h-full object-cover"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {member.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-semibold',
                      member.isCurrentUser ? 'text-indigo-300' : 'text-white'
                    )}
                  >
                    {member.username}
                    {member.isCurrentUser && ' (ty)'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Level {member.level} • 🔥 {member.streak}
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold text-white">{member.weeklyXP}</p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>

                {/* Zone indicator */}
                <div className="w-6">
                  {member.zone === 'promotion' && <TrendingUp className="w-5 h-5 text-green-400" />}
                  {member.zone === 'demotion' && <TrendingDown className="w-5 h-5 text-red-400" />}
                  {member.zone === 'safe' && <Minus className="w-5 h-5 text-gray-500" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
