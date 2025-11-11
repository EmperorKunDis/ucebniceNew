'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Box, Stack, Grid } from '@/components/layout'

type LeaderboardPeriod = 'all-time' | 'monthly' | 'weekly' | 'daily'

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: number
  badges: number
  streak: number
  change: 'up' | 'down' | 'same'
  changeValue?: number
}

// 3D Tilt Card Component with Dynamic Shine Effect
function TiltCard({
  children,
  rank,
  enable3D = false,
}: {
  children: React.ReactNode
  rank: number
  enable3D?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const maskId = `edge-mask-${rank}-${Math.random().toString(36).substr(2, 9)}`
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [parallaxX, setParallaxX] = useState(0)
  const [parallaxY, setParallaxY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within the card
    const y = e.clientY - rect.top // y position within the card
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Store mouse position as percentage (0-100)
    const mouseXPercent = (x / rect.width) * 100
    const mouseYPercent = (y / rect.height) * 100
    setMouseX(mouseXPercent)
    setMouseY(mouseYPercent)

    // Calculate parallax effect for 3D object (opposite direction, max 30px)
    const parallaxXValue = ((x - centerX) / centerX) * -30
    const parallaxYValue = ((y - centerY) / centerY) * -30
    setParallaxX(parallaxXValue)
    setParallaxY(parallaxYValue)

    // Calculate rotation based on mouse position (max 15 degrees) - only if 3D enabled
    if (enable3D) {
      const rotX = ((y - centerY) / centerY) * -15 // Inverted for natural feel
      const rotY = ((x - centerX) / centerX) * 15
      setRotateX(rotX)
      setRotateY(rotY)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
    setMouseX(50)
    setMouseY(50)
    setParallaxX(0)
    setParallaxY(0)
  }

  const getBackgroundGlow = (rank: number, isHovered: boolean) => {
    // Intenzita záře - zvýrazněná barva s mírnějším zesilením při hoveru
    const baseIntensity = isHovered ? 0.8 : 0.45

    switch (rank) {
      case 1:
        // Zlatá záře za kartou - rozšiřuje se do pozadí
        return {
          background: `
            radial-gradient(ellipse ${isHovered ? '120%' : '100%'} ${isHovered ? '110%' : '90%'} at 50% 50%,
              rgba(255, 215, 0, ${0.7 * baseIntensity}) 0%,
              rgba(255, 223, 0, ${0.6 * baseIntensity}) 15%,
              rgba(234, 179, 8, ${0.5 * baseIntensity}) 30%,
              rgba(218, 165, 32, ${0.3 * baseIntensity}) 50%,
              rgba(184, 134, 11, ${0.15 * baseIntensity}) 70%,
              transparent 100%
            )
          `,
        }
      case 2:
        // Stříbrná záře za kartou - rozšiřuje se do pozadí
        return {
          background: `
            radial-gradient(ellipse ${isHovered ? '120%' : '100%'} ${isHovered ? '110%' : '90%'} at 50% 50%,
              rgba(240, 240, 240, ${0.7 * baseIntensity}) 0%,
              rgba(220, 220, 220, ${0.6 * baseIntensity}) 15%,
              rgba(192, 192, 192, ${0.5 * baseIntensity}) 30%,
              rgba(169, 169, 169, ${0.3 * baseIntensity}) 50%,
              rgba(128, 128, 128, ${0.15 * baseIntensity}) 70%,
              transparent 100%
            )
          `,
        }
      case 3:
        // Bronzová záře za kartou - rozšiřuje se do pozadí
        return {
          background: `
            radial-gradient(ellipse ${isHovered ? '120%' : '100%'} ${isHovered ? '110%' : '90%'} at 50% 50%,
              rgba(218, 165, 32, ${0.7 * baseIntensity}) 0%,
              rgba(210, 150, 40, ${0.6 * baseIntensity}) 15%,
              rgba(205, 127, 50, ${0.5 * baseIntensity}) 30%,
              rgba(184, 115, 51, ${0.3 * baseIntensity}) 50%,
              rgba(139, 69, 19, ${0.15 * baseIntensity}) 70%,
              transparent 100%
            )
          `,
        }
      default:
        return { background: 'transparent' }
    }
  }

  const getPodiumGlowClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-[0_0_60px_rgba(234,179,8,0.5),0_0_100px_rgba(234,179,8,0.3),0_0_140px_rgba(234,179,8,0.1)] hover:shadow-[0_0_100px_rgba(234,179,8,0.8),0_0_160px_rgba(234,179,8,0.6),0_0_200px_rgba(234,179,8,0.4)]'
      case 2:
        return 'shadow-[0_0_60px_rgba(192,192,192,0.5),0_0_100px_rgba(192,192,192,0.3),0_0_140px_rgba(192,192,192,0.1)] hover:shadow-[0_0_100px_rgba(192,192,192,0.8),0_0_160px_rgba(192,192,192,0.6),0_0_200px_rgba(192,192,192,0.4)]'
      case 3:
        return 'shadow-[0_0_60px_rgba(205,127,50,0.5),0_0_100px_rgba(205,127,50,0.3),0_0_140px_rgba(205,127,50,0.1)] hover:shadow-[0_0_100px_rgba(205,127,50,0.8),0_0_160px_rgba(205,127,50,0.6),0_0_200px_rgba(205,127,50,0.4)]'
      default:
        return ''
    }
  }

  const get3DObject = (rank: number) => {
    switch (rank) {
      case 1:
        // Zlatá trofej
        return <div className="text-9xl opacity-20 select-none pointer-events-none">🏆</div>
      case 2:
        // Stříbrná medaile
        return <div className="text-9xl opacity-20 select-none pointer-events-none">🥈</div>
      case 3:
        // Bronzová medaile
        return <div className="text-9xl opacity-20 select-none pointer-events-none">🥉</div>
      default:
        return null
    }
  }

  const getEdgeMetallicGradient = (mouseX: number, mouseY: number, isHovered: boolean) => {
    // Vypočítá úhel kurzoru od středu karty - živý, dynamický pohyb stříbrného odlesku
    const angle = Math.atan2(mouseY - 50, mouseX - 50) * (180 / Math.PI)

    // MAXIMÁLNÍ INTENZITA - nepřehlédnutelný, brilantní stříbrný lesk
    return `
      conic-gradient(
        from ${angle}deg at 50% 50%,
        rgba(255, 255, 255, 1.0) 0%,
        rgba(250, 250, 255, 1.0) 1%,
        rgba(245, 245, 250, 0.98) 2%,
        rgba(240, 240, 245, 0.95) 3%,
        rgba(230, 230, 240, 0.9) 4%,
        rgba(220, 220, 235, 0.8) 5%,
        rgba(210, 210, 230, 0.7) 6%,
        rgba(200, 200, 225, 0.6) 7%,
        rgba(190, 190, 220, 0.5) 8%,
        rgba(180, 180, 215, 0.4) 9%,
        rgba(170, 170, 210, 0.3) 10%,
        rgba(160, 160, 205, 0.2) 11%,
        rgba(150, 150, 200, 0.1) 12%,
        transparent 13%,
        transparent 87%,
        rgba(150, 150, 200, 0.1) 88%,
        rgba(160, 160, 205, 0.2) 89%,
        rgba(170, 170, 210, 0.3) 90%,
        rgba(180, 180, 215, 0.4) 91%,
        rgba(190, 190, 220, 0.5) 92%,
        rgba(200, 200, 225, 0.6) 93%,
        rgba(210, 210, 230, 0.7) 94%,
        rgba(220, 220, 235, 0.8) 95%,
        rgba(230, 230, 240, 0.9) 96%,
        rgba(240, 240, 245, 0.95) 97%,
        rgba(245, 245, 250, 0.98) 98%,
        rgba(250, 250, 255, 1.0) 99%,
        rgba(255, 255, 255, 1.0) 100%
      )
    `
  }

  const getDynamicShineOverlay = (isHovered: boolean, mouseX: number, mouseY: number) => {
    if (!isHovered) {
      // Jemný statický shine efekt když není hover
      return {
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.1) 0%, 
          rgba(220, 220, 220, 0.08) 25%, 
          transparent 50%, 
          rgba(220, 220, 220, 0.06) 75%, 
          rgba(255, 255, 255, 0.08) 100%)`,
      }
    }

    // Dynamický shine efekt sledující kurzor
    const spotSize = 30 // Velikost světelného bodu v %
    const intensity = 0.6 // Maximální intenzita odlesku

    return {
      background: `
        radial-gradient(
          circle ${spotSize}% at ${mouseX}% ${mouseY}%,
          rgba(255, 255, 255, ${intensity}) 0%,
          rgba(240, 240, 240, ${intensity * 0.7}) 20%,
          rgba(220, 220, 220, ${intensity * 0.4}) 40%,
          transparent 70%
        ),
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.15) 0%, 
          rgba(220, 220, 220, 0.12) 25%, 
          transparent 50%, 
          rgba(220, 220, 220, 0.1) 75%, 
          rgba(255, 255, 255, 0.12) 100%
        )
      `,
    }
  }

  return (
    <div style={{ perspective: enable3D ? '1200px' : '800px' }} className="relative">
      {/* Barevná záře úplně za kartou - rozšiřuje se do pozadí */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          ...getBackgroundGlow(rank, isHovered),
          transform: isHovered ? 'translateZ(-80px) scale(1.5)' : 'translateZ(-80px) scale(1.3)',
          filter: isHovered ? 'blur(60px)' : 'blur(50px)',
          opacity: isHovered ? 0.85 : 0.65,
          zIndex: -1,
        }}
      />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative transition-all duration-300 ease-out rounded-[2.5rem] overflow-hidden ${getPodiumGlowClass(rank)}`}
        style={{
          transform: enable3D ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : 'none',
          transformStyle: 'preserve-3d',
          boxShadow: `
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.25),
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 16px 64px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        {/* Tenké, přirozené stříbrné odlesky pohybující se po obvodu okrajů se zaoblenými rohy */}
        {/* VÝRAZNÉ stříbrné odlesky - border přístup */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-80 ease-out"
          style={{
            borderRadius: '2.5rem',
            border: '3px solid transparent',
            backgroundImage: getEdgeMetallicGradient(mouseX, mouseY, isHovered),
            backgroundOrigin: 'border-box',
            backgroundClip: 'border-box',
            WebkitMask:
              'linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box',
            maskComposite: 'exclude',
            zIndex: 15,
            filter:
              'brightness(2.5) contrast(2.5) saturate(0.6) drop-shadow(0 0 12px rgba(255, 255, 255, 1.0))',
            boxShadow: `
              0 0 30px rgba(255, 255, 255, 0.9),
              0 0 50px rgba(245, 245, 255, 0.7),
              inset 0 0 25px rgba(255, 255, 255, 0.8)
            `,
          }}
        />

        {/* 3D Object with parallax effect a hloubka ostrosti */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px) translateZ(50px)`,
            filter: isHovered
              ? 'blur(3px) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) opacity(0.6)'
              : 'blur(2px) drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3)) opacity(0.5)',
            zIndex: 0.5,
          }}
        >
          {get3DObject(rank)}
        </div>

        {/* Shine overlay - sleduje kurzor */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-100"
          style={{ ...getDynamicShineOverlay(isHovered, mouseX, mouseY), zIndex: 2 }}
        />

        {/* Content layer */}
        <div className="relative" style={{ zIndex: 3 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserStats, setCurrentUserStats] = useState<any>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period])

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session) return

      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setCurrentUserStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    fetchUserStats()
  }, [session])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return null
    }
  }

  const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]'
      case 2:
        return 'shadow-[0_0_30px_rgba(192,192,192,0.4)] hover:shadow-[0_0_50px_rgba(192,192,192,0.6)]'
      case 3:
        return 'shadow-[0_0_30px_rgba(205,127,50,0.4)] hover:shadow-[0_0_50px_rgba(205,127,50,0.6)]'
      default:
        return 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
    }
  }

  const periodOptions = [
    { value: 'all-time', label: 'Celkově', icon: <Trophy className="w-4 h-4" /> },
    { value: 'monthly', label: 'Měsíční', icon: <Calendar className="w-4 h-4" /> },
    { value: 'weekly', label: 'Týdenní', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'daily', label: 'Denní', icon: <Users className="w-4 h-4" /> },
  ]

  // Find current user position
  const currentUsername = currentUserStats?.user?.username
  const userPosition = leaderboard.findIndex(entry => entry.username === currentUsername) + 1

  if (isLoading) {
    return (
      <UnifiedPageLayout maxWidth="7xl">
        <div
          className="flex items-center justify-center min-h-[60vh]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" aria-hidden="true" />
          <span className="sr-only">Načítání žebříčku...</span>
        </div>
      </UnifiedPageLayout>
    )
  }

  return (
    <UnifiedPageLayout maxWidth="7xl">
      <SectionHeader subtitle="Soutěžte s ostatními studenty a staňte se mistrem programování">
        Žebříček nejlepších
      </SectionHeader>

      {/* Period selector */}
      <Stack justify="center">
        <GlassSurface className="inline-flex p-1" role="group" aria-label="Výběr období žebříčku">
          {periodOptions.map(option => (
            <Button
              key={option.value}
              variant={period === option.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(option.value as LeaderboardPeriod)}
              className="gap-2"
              aria-pressed={period === option.value}
              aria-label={`Zobrazit ${option.label.toLowerCase()} žebříček`}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </GlassSurface>
      </Stack>

      {leaderboard.length === 0 ? (
        <Box className="text-center py-12">
          <p className="text-gray-400">Žádní uživatelé zatím nejsou v žebříčku</p>
        </Box>
      ) : (
        <>
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <Grid
              columns={1}
              md={3}
              gap={4}
              className="max-w-4xl mx-auto"
              role="list"
              aria-label="Top 3 uživatelé"
            >
              {leaderboard.slice(0, 3).map((entry, i) => {
                // Podium ordering: 2nd (left), 1st (middle), 3rd (right)
                // i=0 (1st place) -> order-2 (middle on all screens)
                // i=1 (2nd place) -> order-1 (left on all screens)
                // i=2 (3rd place) -> order-3 (right on all screens)
                const orderClass = i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'

                return (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={orderClass}
                    role="listitem"
                  >
                    <TiltCard rank={entry.rank} enable3D={entry.rank === 1}>
                      <div
                        className={`p-10 min-h-[380px] flex flex-col justify-center bg-white/[0.01] backdrop-blur-[0.4px] ${i === 0 ? 'min-h-[420px]' : ''}`}
                      >
                        {/* Rank Icon Badge */}
                        <div
                          className={`flex justify-center mb-6 ${i === 0 ? 'transform scale-125 mb-8' : ''}`}
                        >
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info - Simple Layout */}
                        <Stack direction="col" gap={4} align="center">
                          {/* Avatar */}
                          <div
                            className={`${i === 0 ? 'w-32 h-32 text-4xl' : 'w-28 h-28 text-3xl'} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0 transition-all duration-500`}
                          >
                            {entry.username.charAt(0).toUpperCase()}
                          </div>

                          {/* Name and Level */}
                          <Stack direction="col" gap={1} align="center">
                            <h3
                              className={`${i === 0 ? 'text-2xl' : 'text-xl'} font-bold text-white`}
                            >
                              {entry.username}
                            </h3>
                            <p className="text-base text-gray-400">Level {entry.level}</p>
                          </Stack>

                          {/* XP */}
                          <p className="text-base font-semibold text-gray-300">
                            {entry.xp.toLocaleString()} XP
                          </p>
                        </Stack>

                        {/* Stats below */}
                        <Stack direction="row" justify="center" gap={6} className="mt-6 text-sm">
                          <Stack direction="row" gap={2} align="center">
                            <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                            <span className="text-gray-400 font-medium">{entry.badges}</span>
                          </Stack>
                          <Stack direction="row" gap={2} align="center">
                            <Trophy className="w-4 h-4 text-orange-400" aria-hidden="true" />
                            <span className="text-gray-400 font-medium">{entry.streak}d</span>
                          </Stack>
                        </Stack>
                      </div>
                    </TiltCard>
                  </motion.div>
                )
              })}
            </Grid>
          )}

          {/* Rest of leaderboard */}
          {leaderboard.length > 3 && (
            <Box className="max-w-4xl mx-auto">
              <GlassSurface className="p-6">
                <Stack direction="col" gap={2} role="list" aria-label="Žebříček místo 4 a níže">
                  {leaderboard.slice(3).map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      role="listitem"
                    >
                      <Box
                        className={`p-4 rounded-lg transition-all duration-300 ${
                          entry.username === currentUsername
                            ? 'bg-purple-500/20 border-2 border-purple-500/50'
                            : 'bg-white/5 hover:bg-white/10'
                        } ${getRankGlow(entry.rank)}`}
                        aria-label={`${entry.rank}. místo: ${entry.username}${entry.username === currentUsername ? ' (Ty)' : ''}, Level ${entry.level}, ${entry.xp.toLocaleString()} XP, ${entry.badges} odznaků, ${entry.streak} denní série`}
                        aria-current={entry.username === currentUsername ? 'true' : undefined}
                      >
                        <Stack direction="row" align="center" gap={4}>
                          <Box className="w-12 text-center relative">
                            <span
                              className={`text-xl font-bold ${
                                entry.username === currentUsername
                                  ? 'text-purple-300'
                                  : 'text-gray-400'
                              }`}
                              style={{
                                textShadow:
                                  entry.rank <= 3
                                    ? entry.rank === 1
                                      ? '0 0 20px rgba(234, 179, 8, 0.8)'
                                      : entry.rank === 2
                                        ? '0 0 20px rgba(192, 192, 192, 0.8)'
                                        : '0 0 20px rgba(205, 127, 50, 0.8)'
                                    : 'none',
                              }}
                            >
                              #{entry.rank}
                            </span>
                          </Box>

                          <Box className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                            {entry.username.charAt(0).toUpperCase()}
                          </Box>

                          <Stack direction="col" gap={0} className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {entry.username}
                              {entry.username === currentUsername && ' (Ty)'}
                            </p>
                            <p className="text-sm text-gray-400">Level {entry.level}</p>
                          </Stack>

                          <Stack direction="row" gap={4} align="center" className="hidden sm:flex">
                            <Stack direction="col" gap={0} align="center">
                              <p className="text-sm font-medium text-white">
                                {entry.xp.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">XP</p>
                            </Stack>
                            <Stack direction="col" gap={0} align="center">
                              <p className="text-sm font-medium text-white">{entry.badges}</p>
                              <p className="text-xs text-gray-400">Odznaků</p>
                            </Stack>
                            <Stack direction="col" gap={0} align="center">
                              <p className="text-sm font-medium text-white">{entry.streak}</p>
                              <p className="text-xs text-gray-400">Série</p>
                            </Stack>
                          </Stack>

                          {entry.change !== 'same' && (
                            <Box
                              className={`flex items-center gap-1 ${
                                entry.change === 'up' ? 'text-green-400' : 'text-red-400'
                              }`}
                              aria-label={`${entry.change === 'up' ? 'Vzestup' : 'Pokles'} o ${entry.changeValue} míst`}
                            >
                              <TrendingUp
                                className={`w-4 h-4 ${entry.change === 'down' ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                              <span className="text-sm" aria-hidden="true">
                                {entry.changeValue}
                              </span>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </GlassSurface>
            </Box>
          )}
        </>
      )}

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-gray-400 mb-4">
          {userPosition > 0
            ? `Jsi na ${userPosition}. místě! Chceš vylepšit svou pozici?`
            : 'Chcete se dostat do žebříčku?'}
        </p>
        <ElectricBorder className="inline-block rounded-lg">
          <Button variant="primary" size="lg" asChild>
            <Link href="/chapters" aria-label="Pokračovat v učení - přejít na kapitoly">
              Pokračovat v učení
              <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </ElectricBorder>
      </motion.div>
    </UnifiedPageLayout>
  )
}
