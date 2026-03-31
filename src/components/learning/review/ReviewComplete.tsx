'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Target, ArrowRight } from 'lucide-react'
import { Confetti } from '@/components/gamification/celebrations'
import Link from 'next/link'

interface ReviewCompleteProps {
  reviewed: number
  correct: number
  xpEarned: number
  onContinue?: () => void
}

export function ReviewComplete({ reviewed, correct, xpEarned, onContinue }: ReviewCompleteProps) {
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0

  return (
    <>
      <Confetti isActive={true} pieceCount={60} />

      <motion.div
        className="max-w-md mx-auto text-center p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Trophy */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">Opakování dokončeno!</h1>
        <p className="text-gray-400 mb-8">Skvělá práce! Tvá paměť je teď silnější.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{reviewed}</div>
            <div className="text-sm text-gray-400">Opakováno</div>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-6 h-6 mx-auto mb-2 text-2xl" style={{ lineHeight: 1 }}>
              🎯
            </div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-sm text-gray-400">Přesnost</div>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">+{xpEarned}</div>
            <div className="text-sm text-gray-400">XP</div>
          </motion.div>
        </div>

        {/* Accuracy message */}
        <motion.div
          className="bg-gray-800/50 rounded-xl p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {accuracy >= 80 ? (
            <p className="text-green-400">🌟 Výborně! Tvé znalosti jsou pevné.</p>
          ) : accuracy >= 60 ? (
            <p className="text-yellow-400">👍 Dobrá práce! Pokračuj v opakování.</p>
          ) : (
            <p className="text-orange-400">💪 Nevzdávej to! Opakování dělá mistra.</p>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onContinue && (
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Pokračovat
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
          >
            Zpět na dashboard
          </Link>
        </div>
      </motion.div>
    </>
  )
}
