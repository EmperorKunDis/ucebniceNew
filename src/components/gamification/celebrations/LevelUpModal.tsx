'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles } from 'lucide-react'
import { Confetti } from './Confetti'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  xpEarned?: number
  gemsEarned?: number
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  xpEarned = 0,
  gemsEarned = 0,
}: LevelUpModalProps) {
  // Auto-close after 5 seconds
  useEffect(() => {
    if (!isOpen) return
    const timeout = setTimeout(onClose, 5000)
    return () => clearTimeout(timeout)
  }, [isOpen, onClose])

  return (
    <>
      <Confetti isActive={isOpen} pieceCount={80} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
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
                className="relative"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-center border border-yellow-500/30 shadow-2xl">
                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute -top-4 -left-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-4 -right-4"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>

                  {/* Level badge */}
                  <motion.div
                    className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-4xl font-black text-white">{newLevel}</span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    LEVEL UP!
                  </motion.h2>

                  <motion.p
                    className="text-gray-300 mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Dosáhl jsi úrovně {newLevel}!
                  </motion.p>

                  {/* Rewards */}
                  {(xpEarned > 0 || gemsEarned > 0) && (
                    <motion.div
                      className="flex items-center justify-center gap-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {xpEarned > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-bold">+{xpEarned} XP</span>
                        </div>
                      )}
                      {gemsEarned > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">💎</span>
                          <span className="text-white font-bold">+{gemsEarned}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Continue button */}
                  <motion.button
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                    onClick={onClose}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Pokračovat
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
