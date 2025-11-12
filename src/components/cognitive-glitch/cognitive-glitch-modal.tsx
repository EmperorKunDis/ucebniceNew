'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Brain, HelpCircle, X } from 'lucide-react'
import { GreySurface } from '@/components/ui/grey-surface'
import { useUserStore } from '@/store/user-store'
import { getRandomChallenge, calculateGlitchReward, GlitchChallenge } from '@/lib/glitch-challenges'
import { GLITCH_CONFIG, XP_REWARDS } from '@/lib/constants'

interface CognitiveGlitchModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export function CognitiveGlitchModal({ isOpen, onClose, onComplete }: CognitiveGlitchModalProps) {
  const { level, addXP, addBadge } = useUserStore()
  const [challenge, setChallenge] = useState<GlitchChallenge | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [glitchStreak, setGlitchStreak] = useState(0)
  const [isSpecialReward, setIsSpecialReward] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(GLITCH_CONFIG.TIME_LIMIT)
  const [isTimerActive, setIsTimerActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Get new challenge
      const newChallenge = getRandomChallenge(level)
      setChallenge(newChallenge)
      setSelectedAnswer(null)
      setShowResult(false)
      setShowHint(false)
      setShowExplanation(false)
      setTimeRemaining(GLITCH_CONFIG.TIME_LIMIT)
      setIsTimerActive(true)

      // Check for special reward (20% chance)
      setIsSpecialReward(Math.random() < 0.2)
    }
  }, [isOpen, level])

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      // Time's up!
      handleTimeUp()
    }
    return undefined
  }, [isTimerActive, timeRemaining])

  const handleTimeUp = () => {
    setIsTimerActive(false)
    setShowResult(true)
    setGlitchStreak(0)
  }

  const handleAnswer = () => {
    if (selectedAnswer === null || !challenge) return

    setIsTimerActive(false)
    setShowResult(true)

    if (selectedAnswer === challenge.correct) {
      // Correct answer
      const baseReward = XP_REWARDS.GLITCH_CHALLENGE
      const reward = calculateGlitchReward(
        challenge,
        baseReward,
        glitchStreak,
        showHint,
        60 - timeRemaining
      )

      addXP(reward)
      setGlitchStreak(glitchStreak + 1)

      // Achievement for first glitch
      if (glitchStreak === 0) {
        addBadge({
          id: 'first-glitch',
          name: 'První glitch',
          description: 'Vyřešil/a jsi svůj první Cognitive Glitch',
          icon: '🤖',
          unlockedAt: new Date(),
        })
      }

      // Special reward
      if (isSpecialReward) {
        addBadge({
          id: `glitch-hunter-${Date.now()}`,
          name: 'Lovec glitchů',
          description: `Objevil/a jsi vzácný ${challenge.difficulty} glitch!`,
          icon: '🎆',
          unlockedAt: new Date(),
        })
      }
    } else {
      // Wrong answer
      setGlitchStreak(0)
    }
  }

  const handleTryAgain = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeRemaining(GLITCH_CONFIG.TIME_LIMIT)
    setIsTimerActive(true)
  }

  const handleClose = () => {
    if (showResult && selectedAnswer === challenge?.correct) {
      onComplete?.()
    }
    onClose()
  }

  if (!challenge) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="glitch-modal-title"
          aria-describedby="glitch-modal-question"
        >
          {/* Glitch background effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{
                  opacity: [0, 0.1, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="h-full w-full bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-2xl w-full"
          >
            <GreySurface className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className="w-8 h-8 text-purple-400" />
                  </motion.div>
                  <div>
                    <h2
                      id="glitch-modal-title"
                      className="text-2xl font-bold text-white flex items-center gap-2"
                    >
                      Cognitive Glitch
                      {isSpecialReward && (
                        <span className="text-sm px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full">
                          🎆 Special
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-400">Level {level} challenge</p>
                  </div>
                </div>

                {/* Timer or close button */}
                {!showResult ? (
                  <div className="text-2xl font-mono text-white">{formatTime(timeRemaining)}</div>
                ) : (
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Zavřít modal"
                    type="button"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Progress indicators */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Difficulty:</span>
                  <div className="flex gap-1">
                    {['easy', 'medium', 'hard'].map((diff, i) => (
                      <motion.div
                        key={diff}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-2 h-2 rounded-full ${
                          i <= ['easy', 'medium', 'hard'].indexOf(challenge.difficulty)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {glitchStreak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Streak: {glitchStreak}</span>
                  </motion.div>
                )}

                <div className="ml-auto text-sm text-gray-500">Category: {challenge.category}</div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <p id="glitch-modal-question" className="text-xl text-white mb-6">
                  {challenge.question}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {challenge.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => !showResult && setSelectedAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-lg text-left transition-all relative overflow-hidden ${
                        showResult && index === challenge.correct
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : showResult && index === selectedAnswer && index !== challenge.correct
                            ? 'bg-red-500/20 border-2 border-red-500'
                            : selectedAnswer === index
                              ? 'bg-purple-500/20 border-2 border-purple-500'
                              : 'bg-white/10 hover:bg-white/20 border-2 border-transparent'
                      }`}
                    >
                      <span className="relative z-10">
                        {option}
                        {showResult && index === challenge.correct && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 inline-block text-green-400"
                          >
                            ✓
                          </motion.span>
                        )}
                        {showResult && index === selectedAnswer && index !== challenge.correct && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2 inline-block text-red-400"
                          >
                            ✗
                          </motion.span>
                        )}
                      </span>

                      {/* Selection animation */}
                      {selectedAnswer === index && !showResult && (
                        <motion.div
                          className="absolute inset-0 bg-purple-500/10"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Hint section */}
              {!showResult && (
                <div className="mb-6">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-all"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Nápověda (-10 XP)
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                    >
                      <p className="text-sm text-yellow-300">💡 {challenge.hint}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Result section */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  {selectedAnswer === challenge.correct ? (
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-green-400 mb-1">
                        Správně! +
                        {calculateGlitchReward(
                          challenge,
                          XP_REWARDS.GLITCH_CHALLENGE,
                          glitchStreak > 0 ? glitchStreak - 1 : 0,
                          showHint,
                          60 - timeRemaining
                        )}{' '}
                        XP
                      </p>
                      {isSpecialReward && (
                        <p className="text-sm text-yellow-300">🏆 Získal/a jsi speciální odznak!</p>
                      )}
                    </div>
                  ) : timeRemaining === 0 ? (
                    <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <p className="text-lg font-semibold text-orange-400">⏰ Čas vypršel!</p>
                      <p className="text-sm text-gray-400 mt-1">Příště zkus být rychlejší</p>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-lg font-semibold text-red-400">Špatně!</p>
                      <p className="text-sm text-gray-400 mt-1">Streak resetován 😔</p>
                    </div>
                  )}

                  {/* Show explanation button */}
                  {!showExplanation && challenge.explanation && (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Zobrazit vysvětlení
                    </button>
                  )}

                  {showExplanation && challenge.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                    >
                      <p className="text-sm text-gray-300">📖 {challenge.explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!showResult ? (
                  <>
                    <button
                      onClick={handleAnswer}
                      disabled={selectedAnswer === null}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Odpovědět
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                    >
                      Přeskočit
                    </button>
                  </>
                ) : (
                  <>
                    {selectedAnswer !== challenge.correct && timeRemaining > 0 && (
                      <button
                        onClick={handleTryAgain}
                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                      >
                        Zkusit znovu
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                    >
                      {selectedAnswer === challenge.correct ? 'Pokračovat' : 'Zavřít'}
                    </button>
                  </>
                )}
              </div>
            </GreySurface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
