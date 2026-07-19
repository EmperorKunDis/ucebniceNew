'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gem, Heart, Flame, Zap, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShopItem {
  id: string
  key: string
  name: string
  description: string
  price: number
  icon: string
  category: string
  purchasedThisWeek: number
  maxPerWeek: number | null
  canPurchase: boolean
}

interface Category {
  name: string
  items: ShopItem[]
}

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [gems, setGems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchShop()
  }, [])

  const fetchShop = async () => {
    try {
      const res = await fetch('/api/shop')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(data.categories)
      setGems(data.balance.gems)
    } catch (error) {
      console.error('Error fetching shop:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    if (purchasing) return
    setPurchasing(itemId)

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Nákup se nezdařil')
        return
      }

      // Update gems and refetch shop
      setGems(data.newBalance.gems)
      fetchShop()
    } catch (error) {
      console.error('Error purchasing:', error)
      alert('Chyba při nákupu')
    } finally {
      setPurchasing(null)
    }
  }

  const getCategoryIcon = (name: string) => {
    if (name.includes('Streak')) return <Flame className="w-5 h-5 text-orange-400" />
    if (name.includes('Srdce')) return <Heart className="w-5 h-5 text-red-400" />
    if (name.includes('XP')) return <Zap className="w-5 h-5 text-yellow-400" />
    if (name.includes('Kosmetika')) return <Sparkles className="w-5 h-5 text-purple-400" />
    return <Gem className="w-5 h-5 text-cyan-400" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Obchod</h1>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
            <Gem className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-bold">{gems.toLocaleString()}</span>
          </div>
        </div>

        {/* Categories */}
        {!loading && categories.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-gray-800/60 px-6 py-16 text-center">
            <Gem className="mx-auto mb-4 h-10 w-10 text-[#a895ff]" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Obchod se právě zaváží</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
              Zatím tu nic není. Sbírej gemy dál — první nabídka se tu brzy objeví.
            </p>
          </div>
        )}
        <div className="space-y-8">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                {getCategoryIcon(category.name)}
                <h2 className="text-xl font-semibold text-white">{category.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    className={cn(
                      'bg-gray-800/80 rounded-xl p-4 border transition-all h-full flex flex-col',
                      item.canPurchase
                        ? 'border-gray-700 hover:border-cyan-500/50'
                        : 'border-gray-700/50 opacity-60'
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>

                        {item.maxPerWeek && (
                          <p className="text-xs text-gray-500 mt-2">
                            {item.purchasedThisWeek}/{item.maxPerWeek} tento týden
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={!item.canPurchase || purchasing === item.id}
                      className={cn(
                        'w-full mt-auto py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                        item.canPurchase
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      {purchasing === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Gem className="w-4 h-4" />
                          <span>{item.price}</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
