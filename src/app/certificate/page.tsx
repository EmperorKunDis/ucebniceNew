'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, Lock, Trophy } from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Stack, Box } from '@/components/layout'
import { useUserStore } from '@/store/user-store'
import { chapters } from '@/data/chapters'

// Lazy load certificate generator (contains large dependencies: html2canvas, jspdf)
const CertificateGenerator = dynamic(
  () =>
    import('@/components/certificate/certificate-generator').then(mod => ({
      default: mod.CertificateGenerator,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    ),
    ssr: false,
  }
)

export default function CertificatePage() {
  const router = useRouter()
  const { progress } = useUserStore()
  const [totalChapters] = useState(chapters.length)
  const [isEligible, setIsEligible] = useState(false)

  useEffect(() => {
    checkEligibility()
  }, [progress])

  const checkEligibility = () => {
    const total = chapters.length

    // Eligible if completed at least 80% of chapters
    const completionRate = (progress.length / total) * 100
    setIsEligible(completionRate >= 80)
  }

  const completionRate = totalChapters > 0 ? (progress.length / totalChapters) * 100 : 0

  return (
    <UnifiedPageLayout maxWidth="7xl">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-300 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Zpět na Profil
      </Link>

      <SectionHeader subtitle="Oslavte svůj úspěch a získejte oficiální certifikát">
        Certifikát o absolvování
      </SectionHeader>

      {isEligible ? (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CertificateGenerator />
          </motion.div>

          {/* Additional info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <GlassSurface className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Co dál?</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Gratulujeme k úspěšnému dokončení kurzu! Tvůj certifikát je důkazem tvých nových
                  dovedností a znalostí v oblasti programování.
                </p>
                <p>Můžeš ho použít:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Při hledání práce jako důkaz tvých schopností</li>
                  <li>Na LinkedIn profilu pro zvýšení tvé profesionální kredibility</li>
                  <li>V portfoliu jako součást tvého vzdělávání</li>
                  <li>Pro získání přístupu do Apex Arény a hackathonů</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <ElectricBorder className="inline-block rounded-lg">
                  <Button variant="primary" asChild>
                    <Link href="/arena">
                      Přejít do Apex Arény
                      <Trophy className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </ElectricBorder>
              </div>
            </GlassSurface>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <GlassSurface className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Ještě nemáš nárok na certifikát</h2>
            <p className="text-gray-300 mb-6">
              Pro získání certifikátu musíš dokončit alespoň 80% všech kapitol.
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Tvůj pokrok</span>
                <span>{completionRate.toFixed(0)}% / 80%</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
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
                Dokončil/a jsi {progress.length} z {totalChapters} kapitol. Zbývá ti ještě{' '}
                {Math.ceil(totalChapters * 0.8) - progress.length} kapitol.
              </p>

              <ElectricBorder className="inline-block rounded-lg">
                <Button variant="primary" asChild>
                  <Link href="/chapters">
                    Pokračovat v učení
                    <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
                  </Link>
                </Button>
              </ElectricBorder>
            </div>
          </GlassSurface>
        </motion.div>
      )}
    </UnifiedPageLayout>
  )
}
