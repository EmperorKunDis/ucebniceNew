'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Loader2, Check, X, Star, Gem } from 'lucide-react'

interface Quest {
  id: string
  type: 'DAILY' | 'WEEKLY'
  category: string
  title: string
  description: string
  targetValue: number
  xpReward: number
  gemReward: number
  icon: string
  isActive: boolean
  _count: {
    userQuests: number
  }
}

async function readApiError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null)
  return typeof data?.error === 'string' ? data.error : 'Nepodařilo se uložit změnu.'
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'DAILY' | 'WEEKLY'>('all')
  const [error, setError] = useState<string | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/admin/quests')
      if (res.ok) {
        const data = await res.json()
        setQuests(data.quests ?? [])
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestActive = async (id: string, isActive: boolean) => {
    setError(null)
    setTogglingIds(prev => new Set(prev).add(id))

    try {
      const nextIsActive = !isActive
      const response = await fetch(`/api/admin/quests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextIsActive }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const data = await response.json()
      const savedIsActive =
        typeof data.quest?.isActive === 'boolean' ? data.quest.isActive : nextIsActive

      setQuests(prev => prev.map(q => (q.id === id ? { ...q, isActive: savedIsActive } : q)))
    } catch (error) {
      console.error('Error toggling quest:', error)
      setError(error instanceof Error ? error.message : 'Nepodařilo se uložit změnu.')
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const filteredQuests = filter === 'all' ? quests : quests.filter(q => q.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            Správa úkolů
          </h1>
          <p className="text-gray-400">Denní a týdenní úkoly pro hráče</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="bg-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-3xl font-bold text-white">{quests.length}</div>
          <div className="text-sm text-gray-400">Celkem úkolů</div>
        </motion.div>
        <motion.div
          className="bg-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="text-3xl font-bold text-blue-400">
            {quests.filter(q => q.type === 'DAILY').length}
          </div>
          <div className="text-sm text-gray-400">Denních</div>
        </motion.div>
        <motion.div
          className="bg-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-3xl font-bold text-purple-400">
            {quests.filter(q => q.type === 'WEEKLY').length}
          </div>
          <div className="text-sm text-gray-400">Týdenních</div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'DAILY', 'WEEKLY'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Všechny' : f === 'DAILY' ? 'Denní' : 'Týdenní'}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuests.map((quest, index) => (
          <motion.div
            key={quest.id}
            className={`bg-gray-800 rounded-xl p-4 border-2 ${
              quest.isActive ? 'border-green-500/30' : 'border-gray-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{quest.icon}</span>
                <div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      quest.type === 'DAILY'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {quest.type === 'DAILY' ? 'Denní' : 'Týdenní'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleQuestActive(quest.id, quest.isActive)}
                disabled={togglingIds.has(quest.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  quest.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {togglingIds.has(quest.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : quest.isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>

            <h3 className="font-semibold text-white mb-1">{quest.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{quest.description}</p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" />
                  {quest.xpReward}
                </span>
                {quest.gemReward > 0 && (
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Gem className="w-4 h-4" />
                    {quest.gemReward}
                  </span>
                )}
              </div>
              <span className="text-gray-500">Cíl: {quest.targetValue}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500">{quest._count.userQuests} přiřazeno</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
