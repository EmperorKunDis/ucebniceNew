'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PageLayout } from '@/components/layout/page-layout'
import { GlassSurface } from '@/components/ui/glass-surface'
import { GreySurface } from '@/components/ui/grey-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Stack, Grid, Box } from '@/components/layout'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Code2, Brain, Trophy, Users } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { usePerformanceCheck } from '@/hooks/use-performance-check'

// Lazy load heavy components
const ProfileCard = dynamic(
  () => import('@/components/ui/profile-card').then(mod => ({ default: mod.ProfileCard })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-sm w-full h-[500px] animate-pulse bg-gray-800/50 rounded-lg" />
    ),
  }
)

export default function HomePage() {
  const router = useRouter()
  const { username, onboardingCompleted } = useUserStore()
  const hasGoodPerformance = usePerformanceCheck()

  // Surface component based on performance
  const HeroSurface = hasGoodPerformance ? GlassSurface : GreySurface

  // Removed auto-redirect - let users browse freely first
  return (
    <PageLayout>
      {/* Hero section */}
      <Box
        as="section"
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <Grid columns={1} lg={2} gap={8} className="max-w-7xl mx-auto items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Stack direction="col" gap={6}>
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nauč se programovat
                </span>
                <br />
                <span className="text-white">s AI asistentem</span>
              </h1>

              <p className="text-xl text-gray-300">
                Prémiový vzdělávací ekosystém, který tě provede od základů až po profesionální
                úroveň. S AI mentorem dostupným 24/7, gamifikací, interaktivními lekcemi v Google
                Colab a reálnými projekty. Získej certifikát a prezentuj své dovednosti v Apex Aréně
                před potenciálními zaměstnavateli.
              </p>

              <Stack direction="row" gap={4} wrap>
                <ElectricBorder className="rounded-lg">
                  <Link
                    href={username ? '/chapters' : '/onboarding'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                  >
                    {username ? 'Pokračovat v učení' : 'Začít učení'}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </ElectricBorder>

                <Button variant="secondary" size="lg" asChild>
                  <Link href="/demo">Vyzkoušet demo</Link>
                </Button>
              </Stack>
            </Stack>
          </motion.div>

          {/* Right content - Profile card preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <ProfileCard className="max-w-sm w-full h-[500px]" />
          </motion.div>
        </Grid>
      </Box>

      {/* Features section */}
      <Box as="section" className="relative z-10 py-24 px-4">
        <Box className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Proč zvolit naši platformu?
            </span>
          </motion.h2>

          <Grid columns={1} md={2} lg={4} gap={6}>
            {[
              {
                icon: <Code2 className="w-8 h-8" />,
                title: 'Google Colab integrace',
                description: 'Žádné instalace, spouštěj kód přímo v prohlížeči s GPU zdarma.',
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'AI asistent',
                description: 'Osobní AI učitel, který ti pomůže s každým problémem 24/7.',
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: 'Gamifikace',
                description: 'XP body, odznaky, žebříčky a výzvy pro maximální motivaci.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Apex Aréna',
                description: 'Hackathony a prezentace projektů přímo pro zaměstnavatele.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GreySurface className="p-6 sm:p-8 h-full hover:scale-105 transition-transform">
                  <Stack direction="col" gap={4}>
                    <Box className="text-purple-400">{feature.icon}</Box>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </Stack>
                </GreySurface>
              </motion.div>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* CTA section */}
      <Box as="section" className="relative z-10 py-24 px-4">
        <Box className="max-w-4xl mx-auto">
          <GreySurface className="p-8 sm:p-12">
            <Stack direction="col" gap={6} align="center">
              <h2 className="text-4xl font-bold text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Připraven začít svou cestu?
                </span>
              </h2>
              <p className="text-xl text-gray-300 text-center">
                Přidej se k tisícům studentů, kteří už mění svůj život díky programování.
              </p>
              <ElectricBorder className="rounded-lg">
                <Link
                  href={username ? '/chapters' : '/onboarding'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all"
                >
                  {username ? 'Pokračovat v kurzu' : 'Zaregistrovat se zdarma'}
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </ElectricBorder>
            </Stack>
          </GreySurface>
        </Box>
      </Box>
    </PageLayout>
  )
}
