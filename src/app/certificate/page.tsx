'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, Lock, Trophy } from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { CertificateGenerator } from '@/components/certificate/certificate-generator'
import { useUserStore } from '@/store/user-store'
import { lessonService } from '@/services/lesson-service'

export default function CertificatePage() {
  const router = useRouter()
  const { username, level, xp, progress } = useUserStore()
  const [totalLessons, setTotalLessons] = useState(0)
  const [isEligible, setIsEligible] = useState(false)
  
  useEffect(() => {
    checkEligibility()
  }, [progress])
  
  const checkEligibility = async () => {
    const modules = await lessonService.getAllModules()
    const total = modules.reduce((sum, module) => sum + module.lessons.length, 0)
    setTotalLessons(total)
    
    // Eligible if completed at least 80% of lessons
    const completionRate = (progress.length / total) * 100
    setIsEligible(completionRate >= 80)
  }
  
  const completionRate = totalLessons > 0 ? (progress.length / totalLessons) * 100 : 0
  
  return (
    <div className="min-h-screen relative">
      <Lightning />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto">
          <GlassSurface className="p-6" borderRadius={16} blur={20} backgroundOpacity={0.02} opacity={0.95}>
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Učebnice AI
              </Link>
              
              <div className="flex items-center gap-6">
                <Link href="/lessons" className="text-gray-300 hover:text-white transition-colors">
                  Lekce
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">
                  Apex Aréna
                </Link>
              </div>
            </div>
          </GlassSurface>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Zpět na Dashboard
          </button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Certifikát o absolvování
            </h1>
            <p className="text-xl text-gray-400">
              Oslavte svůj úspěch a získejte oficiální certifikát
            </p>
          </motion.div>
          
          {isEligible ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CertificateGenerator />
              
              {/* Additional info */}
              <div className="mt-12 max-w-3xl mx-auto">
                <GlassSurface className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Co dál?</h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      Gratulujeme k úspěšnému dokončení kurzu! Tvůj certifikát je důkazem tvých nových dovedností
                      a znalostí v oblasti programování.
                    </p>
                    <p>
                      Můžeš ho použít:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Při hledání práce jako důkaz tvých schopností</li>
                      <li>Na LinkedIn profilu pro zvýšení tvé profesionální kredibility</li>
                      <li>V portfoliu jako součást tvého vzdělávání</li>
                      <li>Pro získání přístupu do Apex Arény a hackathonů</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Link
                      href="/arena"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                    >
                      Přejít do Apex Arény
                      <Trophy className="w-5 h-5" />
                    </Link>
                  </div>
                </GlassSurface>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <GlassSurface className="p-8 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ještě nemáš nárok na certifikát
                </h2>
                <p className="text-gray-300 mb-6">
                  Pro získání certifikátu musíš dokončit alespoň 80% všech lekcí.
                </p>
                
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Tvůj pokrok</span>
                    <span>{completionRate.toFixed(0)}% / 80%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-400">
                    Dokončil/a jsi {progress.length} z {totalLessons} lekcí.
                    Zbývá ti ještě {Math.ceil(totalLessons * 0.8) - progress.length} lekcí.
                  </p>
                  
                  <Link
                    href="/lessons"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Pokračovat v učení
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </Link>
                </div>
              </GlassSurface>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
