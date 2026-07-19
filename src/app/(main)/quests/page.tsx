'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Target, Clock, Star, Gem, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { userStatsQueryKey } from '@/hooks/useUserStats'

interface Quest {
  id: string
  type: 'DAILY' | 'WEEKLY'
  category: string
  title: string
  description: string
  icon: string
  targetValue: number
  currentProgress: number
  percentage: number
  completed: boolean
  claimed: boolean
  rewards: {
    xp: number
    gems: number
  }
}

interface QuestsData {
  daily: {
    resetAt: string
    quests: Quest[]
    bonusQuest: {
      allCompleted: boolean
      claimed: boolean
      rewards: { xp: number; gems: number }
    }
  }
  weekly: {
    resetAt: string
    quests: Quest[]
  }
}

export default function QuestsPage() {
  const queryClient = useQueryClient()
  const [data, setData] = useState<QuestsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/quests')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (questId: string) => {
    if (claiming) return
    setClaiming(questId)

    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Claim se nezdařil')
        return
      }

      await Promise.all([
        fetchQuests(),
        queryClient.invalidateQueries({ queryKey: userStatsQueryKey }),
      ])
    } catch (error) {
      console.error('Error claiming quest:', error)
    } finally {
      setClaiming(null)
    }
  }

  const formatTimeUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Nepodařilo se načíst úkoly</p>
      </div>
    )
  }

  const renderQuest = (quest: Quest, index: number) => (
    <motion.div
      key={quest.id}
      className={cn(
        'bg-gray-800/80 rounded-xl p-4 border transition-all',
        quest.completed && !quest.claimed
          ? 'border-green-500/50 bg-green-900/20'
          : quest.claimed
            ? 'border-gray-600 opacity-60'
            : 'border-gray-700'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{quest.icon}</span>

        <div className="flex-1">
          <h3 className="font-semibold text-white">{quest.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{quest.description}</p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">
                {quest.currentProgress}/{quest.targetValue}
              </span>
              <span className="text-gray-400">{quest.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  quest.completed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-[#6747ff]'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${quest.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4 mt-3">
            {quest.rewards.xp > 0 && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star className="w-4 h-4" />
                <span>+{quest.rewards.xp}</span>
              </div>
            )}
            {quest.rewards.gems > 0 && (
              <div className="flex items-center gap-1 text-cyan-400 text-sm">
                <Gem className="w-4 h-4" />
                <span>+{quest.rewards.gems}</span>
              </div>
            )}
          </div>
        </div>

        {/* Claim button */}
        {quest.completed && !quest.claimed && (
          <button
            onClick={() => handleClaim(quest.id)}
            disabled={claiming === quest.id}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            {claiming === quest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
          </button>
        )}

        {quest.claimed && (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Target className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Úkoly</h1>
        </div>

        {/* Daily Quests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Denní úkoly</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Reset za {formatTimeUntil(data.daily.resetAt)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.daily.quests.map((quest, index) => renderQuest(quest, index))}
          </div>

          {/* Bonus quest */}
          {data.daily.bonusQuest.allCompleted && !data.daily.bonusQuest.claimed && (
            <motion.div
              className="mt-4 p-4 bg-[#6747ff]/15 rounded-xl border border-[#846bff]/40"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">🎉 Bonus za všechny denní úkoly!</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-yellow-400">+{data.daily.bonusQuest.rewards.xp} XP</span>
                    <span className="text-cyan-400">+{data.daily.bonusQuest.rewards.gems} 💎</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#6747ff] text-white font-semibold rounded-lg">
                  Claim
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Weekly Quests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Týdenní úkoly</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Reset za {formatTimeUntil(data.weekly.resetAt)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.weekly.quests.map((quest, index) =>
              renderQuest(quest, index + data.daily.quests.length)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
