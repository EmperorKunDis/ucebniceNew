'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Loader2, Plus, Settings } from 'lucide-react'

interface League {
  id: string
  tier: string
  weekStart: string
  weekEnd: string
  _count: {
    members: number
  }
}

interface LeagueStats {
  totalLeagues: number
  totalMembers: number
  currentWeekStart: string
  currentWeekEnd: string
}

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [stats, setStats] = useState<LeagueStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch leagues with member counts
      const [leaguesRes, statsRes] = await Promise.all([
        fetch('/api/admin/leagues'),
        fetch('/api/admin/leagues/stats'),
      ])

      if (leaguesRes.ok) {
        const data = await leaguesRes.json()
        setLeagues(data.leagues ?? [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <Trophy className="w-6 h-6 text-yellow-500" />
            Správa lig
          </h1>
          <p className="text-gray-400">Nastavení týdenních lig a soutěží</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          Nastavení
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalLeagues}</div>
                <div className="text-sm text-gray-400">Lig</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
                <div className="text-sm text-gray-400">Členů celkem</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-xl p-4 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Aktuální týden</div>
                <div className="text-sm text-gray-400">
                  {new Date(stats.currentWeekStart).toLocaleDateString('cs-CZ')} -{' '}
                  {new Date(stats.currentWeekEnd).toLocaleDateString('cs-CZ')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leagues Table */}
      <motion.div
        className="bg-gray-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Přehled lig</h2>
          <button className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            <Plus className="w-4 h-4" />
            Přidat ligu
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Období</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Členů</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leagues.map(league => (
                <tr key={league.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white capitalize">{league.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(league.weekStart).toLocaleDateString('cs-CZ')} -{' '}
                    {new Date(league.weekEnd).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{league._count.members}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-400 hover:text-white text-sm">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
