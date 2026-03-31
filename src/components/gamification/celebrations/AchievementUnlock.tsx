'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import { Confetti } from './Confetti'

interface Achievement {
  name: string
  description: string
  icon: string
  xpReward?: number
  gemReward?: number
}

interface AchievementUnlockProps {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement
}

export function AchievementUnlock({ isOpen, onClose, achievement }: AchievementUnlockProps) {
  // Auto-close after 6 seconds
  useEffect(() => {
    if (!isOpen) return
    const timeout = setTimeout(onClose, 6000)
    return () => clearTimeout(timeout)
  }, [isOpen, onClose])

  return (
    <>
      <Confetti
        isActive={isOpen}
        pieceCount={40}
        colors={['#FFD700', '#FFA500', '#FF6B6B', '#9B59B6']}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30 shadow-2xl"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                    Achievement Unlocked!
                  </span>
                </div>

                {/* Achievement icon */}
                <motion.div
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(251, 191, 36, 0.4)',
                      '0 0 0 20px rgba(251, 191, 36, 0)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-4xl">{achievement.icon}</span>
                </motion.div>

                {/* Achievement info */}
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white mb-2">{achievement.name}</h2>
                  <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>

                  {/* Rewards */}
                  {(achievement.xpReward || achievement.gemReward) && (
                    <div className="flex items-center justify-center gap-4 bg-black/30 rounded-lg py-2 px-4">
                      {achievement.xpReward && achievement.xpReward > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <span>⭐</span>
                          <span className="font-bold">+{achievement.xpReward} XP</span>
                        </div>
                      )}
                      {achievement.gemReward && achievement.gemReward > 0 && (
                        <div className="flex items-center gap-1 text-cyan-400">
                          <span>💎</span>
                          <span className="font-bold">+{achievement.gemReward}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Continue button */}
                <motion.button
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
                  onClick={onClose}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Super!
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
