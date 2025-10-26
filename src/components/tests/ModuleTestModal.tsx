'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Clock, Award, Star, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GreySurface } from '@/components/ui/grey-surface'
import { ModuleTest, calculateTestScore } from '@/data/module-tests'
import toast from 'react-hot-toast'

interface ModuleTestModalProps {
  moduleTest: ModuleTest
  onComplete: (result: {
    score: number
    timeElapsed: number
    xpEarned: number
    stars: number
  }) => void
  onAbandon: () => void
}

export function ModuleTestModal({ moduleTest, onComplete, onAbandon }: ModuleTestModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(moduleTest.questions.length).fill(null)
  )
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const currentQuestion = moduleTest.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / moduleTest.questions.length) * 100

  useEffect(() => {
    // Load saved answer for current question
    setSelectedOption(answers[currentQuestionIndex])
  }, [currentQuestionIndex, answers])

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < moduleTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleFinish = async () => {
    // Calculate results
    const endTime = Date.now()
    const timeElapsed = Math.floor((endTime - startTime) / 1000) // in seconds

    let correctCount = 0
    moduleTest.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++
      }
    })

    const results = calculateTestScore(correctCount, moduleTest.questions.length, timeElapsed)

    setTestResults({ ...results, timeElapsed, correctCount, answers })
    setShowResults(true)

    // Submit to server
    try {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleNumber: moduleTest.moduleNumber,
          score: correctCount,
          totalQuestions: moduleTest.questions.length,
          timeElapsed,
          answers,
        }),
      })

      if (!response.ok) {
        console.error('Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
    }
  }

  const handleCompleteResults = () => {
    onComplete({
      score: testResults.correctCount,
      timeElapsed: testResults.timeElapsed,
      xpEarned: testResults.totalXP,
      stars: testResults.stars,
    })
  }

  const handleAbandon = () => {
    if (confirm('Opravdu chceš ukončit test? Tvůj pokrok nebude uložen.')) {
      onAbandon()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GreySurface className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{moduleTest.title}</h2>
                    <p className="text-gray-400 text-sm">{moduleTest.description}</p>
                  </div>
                  <button
                    onClick={handleAbandon}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Otázka {currentQuestionIndex + 1} z {moduleTest.questions.length}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedOption === index
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        <span className="text-white">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Předchozí
                  </Button>

                  <div className="flex gap-1">
                    {moduleTest.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentQuestionIndex
                            ? 'bg-purple-500'
                            : answers[index] !== null
                              ? 'bg-green-500'
                              : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>

                  {currentQuestionIndex === moduleTest.questions.length - 1 ? (
                    <Button
                      onClick={handleFinish}
                      disabled={answers.some(a => a === null)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Dokončit test
                    </Button>
                  ) : (
                    <Button onClick={handleNext} disabled={selectedOption === null}>
                      Další
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </GreySurface>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GreySurface className="p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Test dokončen!</h2>
                <p className="text-gray-400 mb-8">Výborná práce! Tady jsou tvoje výsledky:</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <GreySurface className="p-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {testResults.correctCount}/{moduleTest.questions.length}
                    </div>
                    <div className="text-gray-400 text-sm">Správných odpovědí</div>
                  </GreySurface>

                  <GreySurface className="p-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {testResults.percentage.toFixed(0)}%
                    </div>
                    <div className="text-gray-400 text-sm">Úspěšnost</div>
                  </GreySurface>

                  <GreySurface className="p-6">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      +{testResults.totalXP}
                    </div>
                    <div className="text-gray-400 text-sm">XP získáno</div>
                  </GreySurface>

                  <GreySurface className="p-6">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3].map(starNum => (
                        <Star
                          key={starNum}
                          className={`w-8 h-8 ${starNum <= testResults.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <div className="text-gray-400 text-sm">Hvězdičky modulu</div>
                  </GreySurface>
                </div>

                {testResults.timeBonus > 0 && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-300">
                      <Award className="w-5 h-5" />
                      <span>
                        Rychlostní bonus: +{testResults.timeBonus} XP za dokončení pod 5 minut!
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCompleteResults}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3"
                  size="lg"
                >
                  Pokračovat
                </Button>
              </GreySurface>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
