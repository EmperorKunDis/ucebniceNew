'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trophy, Star, Users, Target, Gift, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Simple relative time formatter (avoids date-fns dependency)
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'právě teď'
  if (diffMins < 60) return `před ${diffMins} min`
  if (diffHours < 24) return `před ${diffHours} h`
  if (diffDays < 7) return `před ${diffDays} d`
  return date.toLocaleDateString('cs-CZ')
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  data: Record<string, unknown> | null
  createdAt: string
}

const typeIcons: Record<string, React.ReactNode> = {
  ACHIEVEMENT: <Trophy className="w-5 h-5 text-yellow-500" />,
  STREAK: <span className="text-xl">🔥</span>,
  FRIEND_REQUEST: <Users className="w-5 h-5 text-blue-500" />,
  LEAGUE: <Trophy className="w-5 h-5 text-purple-500" />,
  QUEST: <Target className="w-5 h-5 text-green-500" />,
  REWARD: <Gift className="w-5 h-5 text-pink-500" />,
  XP: <Star className="w-5 h-5 text-yellow-500" />,
  DEFAULT: <Bell className="w-5 h-5 text-gray-400" />,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=50')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setNotifications(data.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      if (!res.ok) throw new Error('Failed to mark notification as read')
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      if (unreadCount === 0) return

      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: 'all' }),
      })
      if (!res.ok) throw new Error('Failed to mark all notifications as read')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifikace
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-sm bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400">Tvá oznámení a upozornění</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Označit vše
          </button>
        )}
      </motion.div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Žádné notifikace</h2>
          <p className="text-gray-400">Až se něco stane, dáme ti vědět.</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer',
                  notification.read ? 'bg-gray-800/50' : 'bg-gray-800 border-l-4 border-indigo-500'
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {typeIcons[notification.type] ?? typeIcons.DEFAULT}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={cn(
                        'font-medium truncate',
                        notification.read ? 'text-gray-300' : 'text-white'
                      )}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatRelativeTime(new Date(notification.createdAt))}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-1',
                      notification.read ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    {notification.message}
                  </p>
                </div>

                {/* Read indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
