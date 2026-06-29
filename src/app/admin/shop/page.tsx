'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Loader2, Check, X, Gem, TrendingUp } from 'lucide-react'

interface ShopItem {
  id: string
  key: string
  name: string
  description: string
  category: string
  price: number
  icon: string
  isActive: boolean
  _count: {
    purchases: number
  }
}

interface ShopStats {
  totalItems: number
  totalPurchases: number
  totalRevenue: number
}

async function readApiError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null)
  return typeof data?.error === 'string' ? data.error : 'Nepodařilo se uložit změnu.'
}

export default function AdminShopPage() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [stats, setStats] = useState<ShopStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch('/api/admin/shop'),
        fetch('/api/admin/shop/stats'),
      ])

      if (itemsRes.ok) {
        const data = await itemsRes.json()
        setItems(data.items ?? [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItemActive = async (id: string, isActive: boolean) => {
    setError(null)
    setTogglingIds(prev => new Set(prev).add(id))

    try {
      const nextIsActive = !isActive
      const response = await fetch(`/api/admin/shop/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextIsActive }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const data = await response.json()
      const savedIsActive =
        typeof data.item?.isActive === 'boolean' ? data.item.isActive : nextIsActive

      setItems(prev =>
        prev.map(item => (item.id === id ? { ...item, isActive: savedIsActive } : item))
      )
    } catch (error) {
      console.error('Error toggling item:', error)
      setError(error instanceof Error ? error.message : 'Nepodařilo se uložit změnu.')
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      POWER_UP: 'Power-up',
      COSMETIC: 'Kosmetika',
      STREAK: 'Streak',
      HEART: 'Srdce',
      XP_BOOST: 'XP Boost',
    }
    return labels[category] ?? category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      POWER_UP: 'bg-purple-500/20 text-purple-400',
      COSMETIC: 'bg-pink-500/20 text-pink-400',
      STREAK: 'bg-orange-500/20 text-orange-400',
      HEART: 'bg-red-500/20 text-red-400',
      XP_BOOST: 'bg-yellow-500/20 text-yellow-400',
    }
    return colors[category] ?? 'bg-gray-500/20 text-gray-400'
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
            <ShoppingBag className="w-6 h-6 text-cyan-500" />
            Správa obchodu
          </h1>
          <p className="text-gray-400">Položky v obchodě s gemy</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
                <div className="text-sm text-gray-400">Položek</div>
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
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalPurchases}</div>
                <div className="text-sm text-gray-400">Nákupů</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Gemů utraceno</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Items Table */}
      <motion.div
        className="bg-gray-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Položka</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Kategorie</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Cena</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Prodáno</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {getCategoryLabel(item.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Gem className="w-4 h-4" />
                      {item.price}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{item._count.purchases}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleItemActive(item.id, item.isActive)}
                      disabled={togglingIds.has(item.id)}
                      className={`flex min-w-[74px] items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {togglingIds.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : item.isActive ? (
                        <>
                          <Check className="w-3 h-3" /> Aktivní
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Neaktivní
                        </>
                      )}
                    </button>
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
