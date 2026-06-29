'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Check, X, Loader2, Search, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Friend {
  friendshipId: string
  id: string
  username: string
  avatar: string | null
  level: number
  streak: number
  weeklyXP: number
  lastActiveAt: string | null
  status: 'online' | 'today' | 'this_week' | 'inactive'
}

interface PendingRequest {
  friendshipId: string
  user: {
    id: string
    username: string
    avatar: string | null
    level: number
  }
  createdAt: string
}

interface FriendsData {
  friends: Friend[]
  pendingReceived: PendingRequest[]
  pendingSent: PendingRequest[]
  totalFriends: number
}

export default function FriendsPage() {
  const [data, setData] = useState<FriendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchUsername, setSearchUsername] = useState('')
  const [sending, setSending] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json.data)
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!searchUsername.trim() || sending) return
    setSending(true)

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: searchUsername.trim() }),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Žádost se nepodařilo odeslat')
        return
      }

      alert(json.message)
      setSearchUsername('')
      fetchFriends()
    } catch (error) {
      console.error('Error sending request:', error)
      alert('Chyba při odesílání žádosti')
    } finally {
      setSending(false)
    }
  }

  const handleRespond = async (friendshipId: string, action: 'accept' | 'reject') => {
    if (responding) return
    setResponding(friendshipId)

    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action }),
      })

      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Akce se nezdařila')
        return
      }

      fetchFriends()
    } catch (error) {
      console.error('Error responding:', error)
    } finally {
      setResponding(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'today':
        return 'bg-yellow-500'
      case 'this_week':
        return 'bg-gray-400'
      default:
        return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Nepodařilo se načíst přátele</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Přátelé</h1>
          <span className="text-gray-400">({data.totalFriends})</span>
        </div>

        {/* Add friend */}
        <div className="bg-gray-800/80 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Přidat přítele
          </h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendRequest()}
                placeholder="Username nebo email"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSendRequest}
              disabled={!searchUsername.trim() || sending}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Poslat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pending received */}
        {data.pendingReceived.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Čekající žádosti ({data.pendingReceived.length})
            </h2>
            <div className="space-y-2">
              {data.pendingReceived.map(request => (
                <motion.div
                  key={request.friendshipId}
                  className="bg-gray-800/80 rounded-xl p-4 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                    {request.user.avatar ? (
                      <>
                        {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={request.user.avatar}
                          alt={request.user.username}
                          className="w-full h-full object-cover"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {request.user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{request.user.username}</p>
                    <p className="text-sm text-gray-400">Level {request.user.level}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(request.friendshipId, 'accept')}
                      disabled={responding === request.friendshipId}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRespond(request.friendshipId, 'reject')}
                      disabled={responding === request.friendshipId}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Přátelé</h2>
          {data.friends.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Zatím nemáš žádné přátele</p>
              <p className="text-sm">Přidej někoho pomocí username nebo emailu</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.friends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  className="bg-gray-800/80 rounded-xl p-4 flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                      {friend.avatar ? (
                        <>
                          {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={friend.avatar}
                            alt={friend.username}
                            className="w-full h-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                          {friend.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div
                      className={cn(
                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800',
                        getStatusColor(friend.status)
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-white">{friend.username}</p>
                    <p className="text-sm text-gray-400">
                      Level {friend.level} • 🔥 {friend.streak}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white">{friend.weeklyXP}</p>
                    <p className="text-xs text-gray-400">XP tento týden</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
