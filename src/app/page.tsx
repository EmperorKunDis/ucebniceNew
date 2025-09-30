'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { ProfileCard } from '@/components/ui/profile-card'
import { Button } from '@/components/ui/button'
import { Stack, Grid, Box } from '@/components/layout'
import { Navigation } from '@/components/layout/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Code2, Brain, Trophy, Users } from 'lucide-react'
import { useUserStore } from '@/store/user-store'

export default function HomePage() {
  const router = useRouter()
  const { username, onboardingCompleted } = useUserStore()
  
  useEffect(() => {
    // Redirect to onboarding if user hasn't completed it
    if (username && !onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [username, onboardingCompleted, router])
  return (
    <Box className="relative min-h-screen">
      {/* Animated backgrounds */}
      <Lightning className="fixed inset-0 z-0" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero section */}
      <Box as="section" className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
                Prémiový vzdělávací ekosystém, který tě provede od základů až po profesionální úroveň. 
                S gamifikací, interaktivními lekcemi a reálnými projekty.
              </p>
              
              <Stack direction="row" gap={4} wrap>
                <ElectricBorder className="rounded-lg">
                  <Link 
                    href={username ? "/lessons" : "/onboarding"}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                  >
                    {username ? 'Pokračovat v učení' : 'Začít učení'}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </ElectricBorder>
                
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/demo">
                    Vyzkoušet demo
                  </Link>
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
            <ProfileCard 
              showMiniNebula={true}
              className="max-w-sm w-full h-[500px]"
            />
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
                description: 'Žádné instalace, spouštěj kód přímo v prohlížeči s GPU zdarma.'
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'AI asistent',
                description: 'Osobní AI učitel, který ti pomůže s každým problémem 24/7.'
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: 'Gamifikace',
                description: 'XP body, odznaky, žebříčky a výzvy pro maximální motivaci.'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Apex Aréna',
                description: 'Hackathony a prezentace projektů přímo pro zaměstnavatele.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassSurface className="p-6 sm:p-8 h-full hover:scale-105 transition-transform">
                  <Stack direction="col" gap={4}>
                    <Box className="text-purple-400">{feature.icon}</Box>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </Stack>
                </GlassSurface>
              </motion.div>
            ))}
          </Grid>
        </Box>
      </Box>
      
      {/* CTA section */}
      <Box as="section" className="relative z-10 py-24 px-4">
        <Box className="max-w-4xl mx-auto">
          <GlassSurface className="p-8 sm:p-12">
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
                  href={username ? "/lessons" : "/onboarding"}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all"
                >
                  {username ? 'Pokračovat v kurzu' : 'Zaregistrovat se zdarma'}
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </ElectricBorder>
            </Stack>
          </GlassSurface>
        </Box>
      </Box>
    </Box>
  )
}