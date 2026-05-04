'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Gem, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeartRefillModalProps {
  isOpen: boolean
  onClose: () => void
  currentHearts: number
  maxHearts: number
  gems: number
  refillCost?: number
  onRefill: () => Promise<void>
}

export function HeartRefillModal({
  isOpen,
  onClose,
  currentHearts,
  maxHearts,
  gems,
  refillCost = 350,
  onRefill,
}: HeartRefillModalProps) {
  const [isRefilling, setIsRefilling] = useState(false)
  const canAfford = gems >= refillCost
  const isFull = currentHearts >= maxHearts

  const handleRefill = async () => {
    if (!canAfford || isFull || isRefilling) return
    setIsRefilling(true)
    try {
      await onRefill()
      onClose()
    } finally {
      setIsRefilling(false)
    }
  }

  return (
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center gap-1 mb-3">
                  {Array.from({ length: maxHearts }).map((_, i) => (
                    <Heart
                      key={i}
                      className={cn(
                        'w-8 h-8',
                        i < currentHearts ? 'text-red-500 fill-red-500' : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {isFull ? 'Srdce jsou plná!' : 'Doplnit srdce'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isFull ? 'Máš všechna srdce.' : `Máš ${currentHearts} z ${maxHearts} srdcí`}
                </p>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-center gap-2 mb-6 bg-gray-700/50 rounded-lg py-2">
                <Gem className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">{gems}</span>
                <span className="text-gray-400 text-sm">gemů</span>
              </div>

              {/* Refill option */}
              {!isFull && (
                <button
                  onClick={handleRefill}
                  disabled={!canAfford || isRefilling}
                  className={cn(
                    'w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all',
                    canAfford
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {isRefilling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Doplnit srdce</span>
                      <span className="flex items-center gap-1 ml-2 opacity-80">
                        <Gem className="w-4 h-4" />
                        {refillCost}
                      </span>
                    </>
                  )}
                </button>
              )}

              {!canAfford && !isFull && (
                <p className="text-center text-red-400 text-sm mt-3">Nemáš dostatek gemů</p>
              )}

              {/* Alternative: Practice */}
              {!isFull && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm text-center mb-3">
                    Nebo získej srdce zdarma:
                  </p>
                  <button
                    className="w-full py-2 px-4 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm"
                    onClick={() => {
                      onClose()
                      // TODO: Navigate to practice/review
                    }}
                  >
                    🎯 Procvič si opakování
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
