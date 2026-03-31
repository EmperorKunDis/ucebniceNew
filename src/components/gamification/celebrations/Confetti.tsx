'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  rotation: number
  size: number
}

interface ConfettiProps {
  isActive: boolean
  pieceCount?: number
  colors?: string[]
}

export function Confetti({
  isActive,
  pieceCount = 50,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
}: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate confetti pieces
  const pieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)] ?? '#FFD700',
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }))

  return (
    <AnimatePresence>
      {isActive && (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map(piece => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -20,
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
              }}
              initial={{
                y: -20,
                x: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 50,
                x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100],
                rotate: piece.rotation + 720 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
