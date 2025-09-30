'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Clock, 
  Award,
  Code,
  BookOpen,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { generateColabUrl } from '@/lib/utils'
import { GITHUB_CONFIG, XP_REWARDS, BADGES, GLITCH_CONFIG } from '@/lib/constants'
import { lessonService } from '@/services/lesson-service'
import { useUserStore } from '@/store/user-store'
import { Lesson } from '@/types/lesson'

type TabType = 'instructions' | 'colab' | 'solution'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('instructions')
  const [loading, setLoading] = useState(true)
  const [showGlitch, setShowGlitch] = useState(false)
  
  const { completeLesson, addXP, unlockBadge, updateStreak } = useUserStore()

  useEffect(() => {
    loadLesson()
    updateStreak() // Update streak when user visits a lesson
  }, [lessonId])

  const loadLesson = async () => {
    setLoading(true)
    const data = await lessonService.getLesson(lessonId)
    setLesson(data)
    setLoading(false)
  }

  const handleLessonComplete = () => {
    if (!lesson) return
    
    // Complete the lesson and award XP
    completeLesson(lesson.id, lesson.xpReward)
    
    // Check for cognitive glitch trigger
    if (Math.random() < GLITCH_CONFIG.TRIGGER_PROBABILITY) {
      setShowGlitch(true)
    } else {
      // Normal completion - navigate to next lesson
      handleNextLesson()
    }
  }

  const handleGlitchChallenge = () => {
    // Award special badge and extra XP
    unlockBadge(BADGES.GLITCH_HUNTER)
    addXP(GLITCH_CONFIG.XP_MULTIPLIER * XP_REWARDS.GLITCH_CHALLENGE)
    setShowGlitch(false)
    router.push('/glitch-challenge/' + lesson?.id)
  }

  const handleNextLesson = async () => {
    const nextLesson = await lessonService.getNextLesson(lessonId)
    if (nextLesson) {
      router.push(`/lessons/${nextLesson.id}`)
    } else {
      router.push('/lessons')
    }
  }

  const handlePreviousLesson = async () => {
    const prevLesson = await lessonService.getPreviousLesson(lessonId)
    if (prevLesson) {
      router.push(`/lessons/${prevLesson.id}`)
    }
  }

  const getColabUrl = () => {
    if (!lesson) return ''
    return generateColabUrl(
      GITHUB_CONFIG.user,
      GITHUB_CONFIG.repo,
      GITHUB_CONFIG.branch,
      lesson.notebookPath
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Lightning />
        <GlassSurface className="p-8">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-purple-500/30 rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Načítám lekci...</p>
          </div>
        </GlassSurface>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Lightning />
        <GlassSurface className="p-8 text-center">
          <p className="text-xl text-gray-300 mb-4">Lekce nenalezena</p>
          <Link href="/lessons" className="text-purple-400 hover:text-purple-300">
            Zpět na seznam lekcí
          </Link>
        </GlassSurface>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <Lightning />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto">
          <GlassSurface className="p-6" borderRadius={16} blur={20} backgroundOpacity={0.02} opacity={0.95}>
            <div className="flex items-center justify-between">
              <Link href="/lessons" className="flex items-center gap-2 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
                Zpět na lekce
              </Link>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.duration} min
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {lesson.xpReward} XP
                </span>
              </div>
            </div>
          </GlassSurface>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Lesson header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              {lesson.title}
            </h1>
            <p className="text-xl text-gray-400">{lesson.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {lesson.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          
          {/* Tab navigation */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'instructions', label: 'Instrukce', icon: BookOpen },
              { id: 'colab', label: 'Spustit v Colabu', icon: Code },
              { id: 'solution', label: 'Řešení', icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassSurface className="p-8">
                {/* Instructions tab */}
                {activeTab === 'instructions' && (
                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: lesson.content.theory }}
                    />
                    
                    {lesson.content.examples && lesson.content.examples.length > 0 && (
                      <>
                        <h2 className="text-2xl font-bold mt-8 mb-4">Příklady kódu</h2>
                        {lesson.content.examples.map((example, i) => (
                          <pre key={i} className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm">{example}</code>
                          </pre>
                        ))}
                      </>
                    )}
                    
                    {lesson.content.exercises && lesson.content.exercises.length > 0 && (
                      <>
                        <h2 className="text-2xl font-bold mt-8 mb-4">Cvičení</h2>
                        {lesson.content.exercises.map((exercise, i) => (
                          <div key={exercise.id} className="mb-6 p-4 bg-white/5 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Cvičení {i + 1}</h3>
                            <p className="mb-4">{exercise.question}</p>
                            {exercise.hint && (
                              <details className="mb-4">
                                <summary className="cursor-pointer text-purple-400">Nápověda</summary>
                                <p className="mt-2 text-gray-400">{exercise.hint}</p>
                              </details>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
                
                {/* Colab tab */}
                {activeTab === 'colab' && (
                  <div className="text-center py-12">
                    <div className="mb-8">
                      <Code className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Připraven kódovat?</h2>
                      <p className="text-gray-400">
                        Otevři interaktivní notebook v Google Colab a začni ihned programovat!
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <ElectricBorder className="rounded-lg">
                        <a
                          href={getColabUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Otevřít v Colabu
                        </a>
                      </ElectricBorder>
                      
                      <a
                        href={`${GITHUB_CONFIG.baseUrl}/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${lesson.notebookPath}`}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Stáhnout .ipynb
                      </a>
                    </div>
                    
                    <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto">
                      <h3 className="text-lg font-semibold mb-2 text-yellow-300">💡 Tip</h3>
                      <p className="text-gray-300">
                        Google Colab automaticky uloží kopii notebooku na tvůj Google Drive. 
                        Můžeš tak kdykoli pokračovat tam, kde jsi skončil!
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Solution tab */}
                {activeTab === 'solution' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Řešení cvičení</h2>
                    {lesson.content.exercises && lesson.content.exercises.length > 0 ? (
                      lesson.content.exercises.map((exercise, i) => (
                        <div key={exercise.id} className="mb-8">
                          <h3 className="text-lg font-semibold mb-2">Cvičení {i + 1}</h3>
                          <p className="mb-4 text-gray-400">{exercise.question}</p>
                          {exercise.solution ? (
                            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                              <code className="text-sm text-green-400">{exercise.solution}</code>
                            </pre>
                          ) : (
                            <p className="text-gray-500 italic">Řešení bude dostupné po dokončení lekce</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">Tato lekce neobsahuje cvičení.</p>
                    )}
                  </div>
                )}
              </GlassSurface>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePreviousLesson}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Předchozí lekce
            </button>
            
            <ElectricBorder className="rounded-lg">
              <button
                onClick={handleLessonComplete}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Dokončit lekci
              </button>
            </ElectricBorder>
            
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
            >
              Další lekce
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
      
      {/* Cognitive Glitch Modal */}
      <AnimatePresence>
        {showGlitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
            >
              <GlassSurface className="p-8 max-w-md">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Kognitivní Glitch!
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Objevil jsi vzácnou výzvu! Vyřeš ji a získáš {GLITCH_CONFIG.XP_MULTIPLIER}x více XP 
                    a speciální odznak Lovec glitchů.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowGlitch(false)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                    >
                      Přeskočit
                    </button>
                    <ElectricBorder className="rounded-lg">
                      <button
                        onClick={handleGlitchChallenge}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold"
                      >
                        Přijmout výzvu!
                      </button>
                    </ElectricBorder>
                  </div>
                </div>
              </GlassSurface>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}