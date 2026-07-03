'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  Trophy,
  Flame,
  Star,
  Calendar,
  Settings,
  Medal,
  Target,
  BookOpen,
  Edit2,
  Award,
  Home,
} from 'lucide-react'
import { LevelBadge, XPProgressBar } from '@/components/gamification/xp'
import { VerificationBadge, VerificationBadgeSmall } from '@/components/ui/VerificationBadge'
import { useEmailVerification } from '@/hooks/useEmailVerification'

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user
  const { isVerified, resendVerification } = useEmailVerification()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <>
                  {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.image}
                    alt={user.name ?? 'User'}
                    className="w-full h-full object-cover"
                  />
                </>
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
              <Edit2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{user?.name ?? 'Uživatel'}</h1>
              <LevelBadge level={user?.level ?? 1} size="md" />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <p className="text-gray-400">
                @{user?.username ?? user?.email?.split('@')[0] ?? 'username'}
              </p>
              <VerificationBadgeSmall isVerified={isVerified} />
            </div>

            {/* XP Progress */}
            <div className="max-w-xs mx-auto sm:mx-0">
              <XPProgressBar currentXP={user?.xp ?? 0} level={user?.level ?? 1} showLabels />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              aria-label="Domů"
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
            >
              <Home className="w-5 h-5 text-gray-300" />
            </Link>
            <Link
              href="/settings"
              aria-label="Nastavení"
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gray-800 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">{user?.currentStreak ?? 0}</div>
          <div className="text-sm text-gray-400">Aktuální streak</div>
        </motion.div>

        <motion.div
          className="bg-gray-800 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-white">{user?.xp ?? 0}</div>
          <div className="text-sm text-gray-400">Celkem XP</div>
        </motion.div>

        <motion.div
          className="bg-gray-800 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">{user?.longestStreak ?? 0}</div>
          <div className="text-sm text-gray-400">Nejdelší streak</div>
        </motion.div>

        <motion.div
          className="bg-gray-800 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">{user?.level ?? 1}</div>
          <div className="text-sm text-gray-400">Level</div>
        </motion.div>
      </div>

      {/* Verification Status */}
      {!isVerified && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <VerificationBadge isVerified={isVerified} onResend={resendVerification} />
        </motion.section>
      )}

      {/* Certificate Link */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.29 }}
      >
        <Link
          href="/certificate"
          className="flex items-center gap-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-xl p-4 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-500/30 flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">Certifikát</div>
            <div className="text-sm text-gray-400">Dokonči kurz a získej certifikát</div>
          </div>
        </Link>
      </motion.section>

      {/* Streak Calendar - TODO: Fetch history from API */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Aktivita
        </h2>
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Historie aktivity se načítá...</p>
        </div>
      </motion.section>

      {/* Quick Links */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-4 bg-gray-800 hover:bg-gray-750 rounded-xl p-4 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
              Učení
            </div>
            <div className="text-sm text-gray-400">Pokračovat v kurzu</div>
          </div>
        </Link>

        <Link
          href="/achievements"
          className="flex items-center gap-4 bg-gray-800 hover:bg-gray-750 rounded-xl p-4 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Medal className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
              Odznaky
            </div>
            <div className="text-sm text-gray-400">Tvá sbírka</div>
          </div>
        </Link>

        <Link
          href="/quests"
          className="flex items-center gap-4 bg-gray-800 hover:bg-gray-750 rounded-xl p-4 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
              Úkoly
            </div>
            <div className="text-sm text-gray-400">Denní výzvy</div>
          </div>
        </Link>

        <Link
          href="/leagues"
          className="flex items-center gap-4 bg-gray-800 hover:bg-gray-750 rounded-xl p-4 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
              Ligy
            </div>
            <div className="text-sm text-gray-400">Soutěž s ostatními</div>
          </div>
        </Link>
      </motion.section>
    </div>
  )
}
