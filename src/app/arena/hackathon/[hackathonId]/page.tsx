'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  Users,
  Clock,
  Award,
  ChevronLeft,
  UserPlus,
  Share2,
  Info,
  Target,
  Loader2,
  Trophy,
  Zap,
  Star,
} from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Button } from '@/components/ui/button'
import { Stack, Grid, Box } from '@/components/layout'

// Types for API responses
interface Prize {
  place: number
  title: string
  description: string
  value: string
}

interface Judge {
  id?: string
  name: string
  title: string
  company: string
  bio: string
  avatar?: string
}

interface TeamMember {
  id: string
  role: string
  skills: string[]
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface Team {
  id: string
  name: string
  memberCount: number
  members: TeamMember[]
  hasProject: boolean
  project: {
    id: string
    title: string
    description: string
    technologies: string[]
    placement: number | null
  } | null
}

interface HackathonData {
  id: string
  title: string
  description: string
  theme: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  maxTeamSize: number
  registrationDeadline: string
  bannerImage: string | null
  prizes: Prize[]
  judges: Judge[]
  sponsors: string[]
  teams: Team[]
  winners: {
    id: string
    title: string
    description: string
    technologies: string[]
    placement: number
    teamName: string
    teamId: string
  }[]
}

export default function HackathonDetailPage() {
  const params = useParams()
  const hackathonId = params.hackathonId as string
  const { data: session } = useSession()

  const [hackathon, setHackathon] = useState<HackathonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState(1)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'teams' | 'rules'>('overview')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  // Fetch hackathon data
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const res = await fetch(`/api/hackathons/${hackathonId}`)
        if (!res.ok) {
          throw new Error('Hackathon nenalezen')
        }
        const data = await res.json()
        setHackathon(data.hackathon)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala chyba')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathon()
  }, [hackathonId])

  // Load user level from server
  useEffect(() => {
    async function loadUserLevel() {
      if (!session?.user) return

      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setLevel(data.user?.level || 1)
        }
      } catch (error) {
        console.error('Failed to load user level:', error)
      }
    }

    loadUserLevel()
  }, [session])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    setJoinError(null)

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          hackathonId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Nepodařilo se vytvořit tým')
      }

      // Refresh hackathon data
      const hackRes = await fetch(`/api/hackathons/${hackathonId}`)
      const hackData = await hackRes.json()
      setHackathon(hackData.hackathon)

      setShowRegisterModal(false)
      setTeamName('')
      setCreatingTeam(false)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Nastala chyba')
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    setJoinError(null)

    try {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: [] }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Nepodařilo se připojit k týmu')
      }

      // Refresh hackathon data
      const hackRes = await fetch(`/api/hackathons/${hackathonId}`)
      const hackData = await hackRes.json()
      setHackathon(hackData.hackathon)

      setShowRegisterModal(false)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Nastala chyba')
    }
  }

  if (loading) {
    return (
      <UnifiedPageLayout maxWidth="7xl">
        <Stack direction="col" align="center" justify="center" className="min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="text-gray-400 mt-4">Načítání hackathonu...</p>
        </Stack>
      </UnifiedPageLayout>
    )
  }

  if (error || !hackathon) {
    return (
      <UnifiedPageLayout maxWidth="7xl">
        <Stack direction="col" align="center" justify="center" className="min-h-[60vh]">
          <p className="text-red-400 mb-4 text-xl">{error || 'Hackathon nenalezen'}</p>
          <Button asChild>
            <Link href="/arena">Zpět na Arénu</Link>
          </Button>
        </Stack>
      </UnifiedPageLayout>
    )
  }

  const daysUntilStart = Math.ceil(
    (new Date(hackathon.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const daysUntilDeadline = Math.ceil(
    (new Date(hackathon.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  // Check if user is already in a team
  const userTeam = session?.user?.id
    ? hackathon.teams.find(team => team.members.some(m => m.user.id === session.user.id))
    : null

  const statusBadge = {
    upcoming: { label: 'Nadcházející', class: 'bg-blue-500/20 text-blue-300' },
    active: { label: 'Probíhá', class: 'bg-green-500/20 text-green-300' },
    completed: { label: 'Ukončeno', class: 'bg-gray-500/20 text-gray-300' },
  }

  return (
    <UnifiedPageLayout maxWidth="7xl">
      {/* Back navigation */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/arena">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Zpět na Arénu
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassSurface className="p-8 mb-8">
          <Stack direction="col" gap={4}>
            <Stack direction="row" justify="between" align="start" wrap className="gap-4">
              <Box className="flex-1">
                <Stack direction="row" gap={3} align="center" className="mb-2">
                  <Trophy className="w-8 h-8 text-purple-400" />
                  <Box
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge[hackathon.status].class}`}
                  >
                    {statusBadge[hackathon.status].label}
                  </Box>
                </Stack>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {hackathon.title}
                </h1>
                <p className="text-xl text-purple-300">{hackathon.theme}</p>
              </Box>

              {hackathon.status === 'upcoming' && !userTeam && (
                <Button onClick={() => setShowRegisterModal(true)} size="lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Registrovat se
                </Button>
              )}
            </Stack>

            {/* Quick stats */}
            <Grid columns={2} md={4} gap={4} className="mt-4">
              <Box className="p-4 bg-white/5 rounded-lg text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="text-2xl font-bold text-white">
                  {daysUntilStart > 0 ? daysUntilStart : 0}
                </p>
                <p className="text-sm text-gray-400">Dní do začátku</p>
              </Box>

              <Box className="p-4 bg-white/5 rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <p className="text-2xl font-bold text-white">
                  {daysUntilDeadline > 0 ? daysUntilDeadline : 0}
                </p>
                <p className="text-sm text-gray-400">Dní do registrace</p>
              </Box>

              <Box className="p-4 bg-white/5 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold text-white">{hackathon.teams.length}</p>
                <p className="text-sm text-gray-400">Týmů přihlášeno</p>
              </Box>

              <Box className="p-4 bg-white/5 rounded-lg text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-white">{hackathon.prizes.length}</p>
                <p className="text-sm text-gray-400">Ceny k výhře</p>
              </Box>
            </Grid>
          </Stack>
        </GlassSurface>
      </motion.div>

      {/* User's team info */}
      {userTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <GlassSurface className="p-6 border border-green-500/30">
            <Stack direction="row" justify="between" align="center">
              <Stack direction="row" gap={3} align="center">
                <Zap className="w-6 h-6 text-green-400" />
                <Box>
                  <p className="text-sm text-gray-400">Tvůj tým</p>
                  <p className="text-xl font-bold text-white">{userTeam.name}</p>
                </Box>
              </Stack>
              <Box className="text-right">
                <p className="text-sm text-gray-400">
                  {userTeam.memberCount}/{hackathon.maxTeamSize} členů
                </p>
              </Box>
            </Stack>
          </GlassSurface>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <GlassSurface className="inline-flex p-1">
          <Button
            variant={selectedTab === 'overview' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('overview')}
            className="rounded-lg"
          >
            Přehled
          </Button>
          <Button
            variant={selectedTab === 'teams' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('teams')}
            className="rounded-lg"
          >
            Týmy ({hackathon.teams.length})
          </Button>
          <Button
            variant={selectedTab === 'rules' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('rules')}
            className="rounded-lg"
          >
            Pravidla
          </Button>
        </GlassSurface>
      </motion.div>

      {/* Tab content */}
      <Grid columns={1} lg={3} gap={8}>
        {/* Main content area */}
        <Box className="lg:col-span-2">
          <Stack direction="col" gap={6}>
            {selectedTab === 'overview' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <GlassSurface className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">O hackathonu</h2>
                    <p className="text-gray-300 leading-relaxed">{hackathon.description}</p>
                  </GlassSurface>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassSurface className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Ceny</h2>
                    <Stack direction="col" gap={4}>
                      {hackathon.prizes.map((prize, i) => (
                        <motion.div
                          key={prize.place}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Stack
                            direction="row"
                            gap={4}
                            align="start"
                            className="p-4 bg-white/5 rounded-lg"
                          >
                            <Box
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                                prize.place === 1
                                  ? 'bg-yellow-500 text-black'
                                  : prize.place === 2
                                    ? 'bg-gray-400 text-black'
                                    : 'bg-orange-600 text-white'
                              }`}
                            >
                              {prize.place}.
                            </Box>
                            <Box className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{prize.title}</h3>
                              {prize.description && (
                                <p className="text-sm text-gray-400 mb-2">{prize.description}</p>
                              )}
                              {prize.value && (
                                <p className="text-lg font-bold text-purple-300">{prize.value}</p>
                              )}
                            </Box>
                          </Stack>
                        </motion.div>
                      ))}
                    </Stack>
                  </GlassSurface>
                </motion.div>

                {hackathon.judges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <GlassSurface className="p-6">
                      <h2 className="text-2xl font-bold text-white mb-4">Porota</h2>
                      <Stack direction="col" gap={4}>
                        {hackathon.judges.map((judge, i) => (
                          <motion.div
                            key={judge.id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + i * 0.1 }}
                          >
                            <Stack direction="row" gap={4} align="start">
                              <Box className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                {judge.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </Box>
                              <Box className="flex-1">
                                <h3 className="font-semibold text-white">{judge.name}</h3>
                                <p className="text-sm text-purple-300">
                                  {judge.title} @ {judge.company}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">{judge.bio}</p>
                              </Box>
                            </Stack>
                          </motion.div>
                        ))}
                      </Stack>
                    </GlassSurface>
                  </motion.div>
                )}
              </>
            )}

            {selectedTab === 'teams' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GlassSurface className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Přihlášené týmy</h2>
                  <Stack direction="col" gap={4}>
                    {hackathon.teams.map((team, i) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <Stack direction="row" justify="between" align="start" className="mb-3">
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <span className="text-sm text-gray-400">
                            {team.memberCount}/{hackathon.maxTeamSize} členů
                          </span>
                        </Stack>
                        <Stack direction="row" wrap gap={2}>
                          {team.members.map(member => (
                            <Box
                              key={member.id}
                              className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full"
                            >
                              <span className="text-sm text-white">
                                {member.user.name || member.user.username || 'Anonym'}
                              </span>
                              {member.role === 'leader' && (
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              )}
                            </Box>
                          ))}
                        </Stack>
                        {team.memberCount < hackathon.maxTeamSize &&
                          hackathon.status === 'upcoming' &&
                          !userTeam && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleJoinTeam(team.id)}
                              className="mt-3"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Připojit se k týmu
                            </Button>
                          )}
                      </motion.div>
                    ))}

                    {hackathon.teams.length === 0 && (
                      <Box className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">Zatím nejsou přihlášené žádné týmy.</p>
                        <p className="text-purple-300 mt-2">Buď první!</p>
                      </Box>
                    )}
                  </Stack>
                </GlassSurface>
              </motion.div>
            )}

            {selectedTab === 'rules' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GlassSurface className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Pravidla a pokyny</h2>
                  <Stack direction="col" gap={6}>
                    <Box>
                      <Stack direction="row" gap={2} align="center" className="mb-3">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Složení týmu</h3>
                      </Stack>
                      <ul className="space-y-2 text-gray-300 ml-7">
                        <li>• Maximální počet členů v týmu: {hackathon.maxTeamSize}</li>
                        <li>• Minimální počet členů: 1 (solo účast možná)</li>
                        <li>• Všichni členové musí být registrovaní uživatelé</li>
                        <li>• Jeden člověk může být součástí pouze jednoho týmu</li>
                      </ul>
                    </Box>

                    <Box>
                      <Stack direction="row" gap={2} align="center" className="mb-3">
                        <Target className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Požadavky na projekt</h3>
                      </Stack>
                      <ul className="space-y-2 text-gray-300 ml-7">
                        <li>• Projekt musí být vytvořen během hackathonu</li>
                        <li>• Použití open-source knihoven je povoleno</li>
                        <li>• Zdrojový kód musí být nahrán na GitHub</li>
                        <li>• Projekt musí obsahovat README s popisem a instrukcemi</li>
                        <li>• Funkční demo nebo video prezentace je povinné</li>
                      </ul>
                    </Box>

                    <Box>
                      <Stack direction="row" gap={2} align="center" className="mb-3">
                        <Award className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Hodnocení</h3>
                      </Stack>
                      <ul className="space-y-2 text-gray-300 ml-7">
                        <li>• Inovativnost a originalita (30%)</li>
                        <li>• Technická implementace (30%)</li>
                        <li>• Praktické využití a dopad (20%)</li>
                        <li>• Kvalita prezentace (20%)</li>
                      </ul>
                    </Box>
                  </Stack>
                </GlassSurface>
              </motion.div>
            )}
          </Stack>
        </Box>

        {/* Sidebar */}
        <Box>
          <Stack direction="col" gap={6}>
            {/* Registration CTA */}
            {hackathon.status === 'upcoming' && !userTeam && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassSurface className="p-6 text-center border border-purple-500/30">
                  <Zap className="w-10 h-10 mx-auto text-purple-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Připoj se k výzvě!</h3>
                  <p className="text-gray-400 mb-4">
                    Registrace končí za {daysUntilDeadline > 0 ? daysUntilDeadline : 0} dní
                  </p>
                  <Button onClick={() => setShowRegisterModal(true)} className="w-full">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Registrovat se
                  </Button>
                </GlassSurface>
              </motion.div>
            )}

            {/* Event details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <GlassSurface className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Detaily akce</h3>
                <Stack direction="col" gap={4}>
                  <Stack direction="row" gap={3} align="start">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <Box>
                      <p className="text-sm text-gray-400">Začátek</p>
                      <p className="text-white">{formatDateTime(hackathon.startDate)}</p>
                    </Box>
                  </Stack>
                  <Stack direction="row" gap={3} align="start">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <Box>
                      <p className="text-sm text-gray-400">Konec</p>
                      <p className="text-white">{formatDateTime(hackathon.endDate)}</p>
                    </Box>
                  </Stack>
                  <Stack direction="row" gap={3} align="start">
                    <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <Box>
                      <p className="text-sm text-gray-400">Formát</p>
                      <p className="text-white">Online (remote)</p>
                    </Box>
                  </Stack>
                </Stack>
              </GlassSurface>
            </motion.div>

            {/* Sponsors */}
            {hackathon.sponsors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassSurface className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Sponzoři</h3>
                  <Grid columns={2} gap={3}>
                    {hackathon.sponsors.map((sponsor, i) => (
                      <Box
                        key={i}
                        className="p-3 bg-white/5 rounded-lg text-center text-sm text-gray-300 hover:bg-white/10 transition-all"
                      >
                        {sponsor}
                      </Box>
                    ))}
                  </Grid>
                </GlassSurface>
              </motion.div>
            )}

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <GlassSurface className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sdílet</h3>
                <Button variant="secondary" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Sdílet hackathon
                </Button>
              </GlassSurface>
            </motion.div>
          </Stack>
        </Box>
      </Grid>

      {/* Registration Modal */}
      {showRegisterModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowRegisterModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassSurface className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Registrace na hackathon</h2>

              {!session?.user ? (
                <Stack direction="col" align="center" gap={4}>
                  <p className="text-gray-300 text-center">Pro registraci se musíš přihlásit.</p>
                  <Button asChild>
                    <Link href="/auth/login">Přihlásit se</Link>
                  </Button>
                </Stack>
              ) : level >= 5 ? (
                <Stack direction="col" gap={4}>
                  {joinError && (
                    <Box className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                      {joinError}
                    </Box>
                  )}

                  {!creatingTeam ? (
                    <>
                      <p className="text-gray-300">Vyber možnost:</p>
                      <button
                        onClick={() => setCreatingTeam(true)}
                        className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <h3 className="font-semibold text-white mb-1">Vytvořit nový tým</h3>
                        <p className="text-sm text-gray-400">Založ nový tým a pozvi další členy</p>
                      </button>
                      <button
                        onClick={() => {
                          setShowRegisterModal(false)
                          setSelectedTab('teams')
                        }}
                        className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <h3 className="font-semibold text-white mb-1">Připojit se k týmu</h3>
                        <p className="text-sm text-gray-400">
                          Prohlédni si existující týmy a připoj se
                        </p>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300">Vytvořit nový tým:</p>
                      <input
                        type="text"
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Název týmu"
                        className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10"
                      />
                      <Stack direction="row" gap={2}>
                        <Button
                          variant="secondary"
                          onClick={() => setCreatingTeam(false)}
                          className="flex-1"
                        >
                          Zpět
                        </Button>
                        <Button
                          onClick={handleCreateTeam}
                          disabled={!teamName.trim()}
                          className="flex-1"
                        >
                          Vytvořit
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              ) : (
                <Stack direction="col" align="center" gap={4}>
                  <Box className="text-center">
                    <p className="text-gray-400 mb-2">Pro registraci musíš mít úroveň alespoň 5.</p>
                    <p className="text-white">
                      Aktuální úroveň: <span className="text-purple-400 font-bold">{level}</span>
                    </p>
                  </Box>
                  <Button asChild>
                    <Link href="/chapters">Pokračovat v učení</Link>
                  </Button>
                </Stack>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  setShowRegisterModal(false)
                  setCreatingTeam(false)
                  setTeamName('')
                  setJoinError(null)
                }}
                className="mt-6 w-full"
              >
                Zavřít
              </Button>
            </GlassSurface>
          </motion.div>
        </motion.div>
      )}
    </UnifiedPageLayout>
  )
}
