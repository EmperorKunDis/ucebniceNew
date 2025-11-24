'use client'

import { useEffect, useState } from 'react'

interface Achievement {
  id: string
  badgeId: string
  name: string
  description: string
  icon: string
  xpReward: number
  rarity: string
  stats: {
    unlockedBy: number
  }
}

export default function AchievementsManagement() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/achievements')
      .then(res => res.json())
      .then(data => {
        setAchievements(data.achievements)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching achievements:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="px-4 py-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Achievements Management</h1>
      </div>

      {/* Achievements Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        achievement.rarity === 'legendary'
                          ? 'bg-yellow-100 text-yellow-800'
                          : achievement.rarity === 'epic'
                            ? 'bg-purple-100 text-purple-800'
                            : achievement.rarity === 'rare'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {achievement.rarity}
                    </span>
                    <span className="text-sm text-gray-600">{achievement.xpReward} XP</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {achievement.stats.unlockedBy} unlocks
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
