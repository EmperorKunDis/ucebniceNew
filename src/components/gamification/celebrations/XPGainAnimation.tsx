'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'

interface XPGainAnimationProps {
  amount: number
  isVisible: boolean
  onComplete?: () => void
  position?: { x: number; y: number }
}

export function XPGainAnimation({ amount, isVisible, onComplete, position }: XPGainAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none flex items-center gap-1"
          style={position ? { left: position.x, top: position.y } : { left: '50%', top: '30%' }}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <motion.div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>+{amount} XP</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
