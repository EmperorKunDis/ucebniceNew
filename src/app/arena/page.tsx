'use client'

import { useState, useMemo, memo, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Star,
  Code,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react'

import { PublicPageLayout } from '@/components/layout/PublicPageLayout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Button } from '@/components/ui/button'
import { Box, Stack, Grid } from '@/components/layout'

// Types for API responses
interface HackathonData {
  id: string
  title: string
  description: string
  theme: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  prizes: { place: number; title: string; description: string; value: string }[]
  judges: { id?: string; name: string; title: string; company: string; bio: string }[]
  sponsors: string[]
  maxTeamSize: number
  registrationDeadline: string
  bannerImage?: string
  teamCount?: number
}

interface GraduateData {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    level: number
    xp: number
  }
  bio: string | null
  graduatedAt: string
  certificateId: string
  skills: string[]
  portfolio: {
    id?: string
    title: string
    description: string
    url: string
    type: string
    technologies: string[]
  }[]
  linkedIn: string | null
  github: string | null
  website: string | null
  lookingForWork: boolean
  preferredRoles: string[]
  hackathonWins: number
}

interface TeamData {
  id: string
  name: string
  hackathon: {
    id: string
    title: string
    status: string
    startDate: string
    endDate: string
  }
  memberCount: number
  members: {
    id: string
    role: string
    user: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
  }[]
  hasProject: boolean
  project: {
    id: string
    title: string
    submittedAt: string
  } | null
  myRole: string
}

type TabType = 'hackathons' | 'graduates' | 'my-teams'

// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('cs-CZ')
}

// Memoized HackathonCard component for better performance
const HackathonCard = memo(({ hackathon }: { hackathon: HackathonData }) => {
  return (
    <div className="h-full rounded-lg bg-gradient-to-br from-[#6747ff]/15 to-[#44d8ed]/15 p-[1px] transition-all hover:scale-[1.02] hover:from-[#6747ff]/25 hover:to-[#44d8ed]/25">
      <GlassSurface className="p-6 h-full">
        <Stack direction="col" gap={4}>
          <Stack direction="row" justify="between" align="start">
            <Box>
              <h3 className="text-2xl font-bold text-white mb-2">{hackathon.title}</h3>
              <p className="text-gray-400">{hackathon.theme}</p>
            </Box>
            <Box
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                hackathon.status === 'upcoming'
                  ? 'bg-blue-500/20 text-blue-300'
                  : hackathon.status === 'active'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-300'
              }`}
            >
              {hackathon.status === 'upcoming'
                ? 'Nadcházející'
                : hackathon.status === 'active'
                  ? 'Probíhá'
                  : 'Ukončeno'}
            </Box>
          </Stack>

          <p className="text-gray-300">{hackathon.description}</p>

          <Stack direction="col" gap={3}>
            <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
              </span>
            </Stack>
            <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>Max. {hackathon.maxTeamSize} členů v týmu</span>
            </Stack>
            <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Registrace do: {formatDate(hackathon.registrationDeadline)}</span>
            </Stack>
          </Stack>

          <Box>
            <h4 className="text-sm font-semibold text-white mb-2">Ceny:</h4>
            <Stack gap={2}>
              {hackathon.prizes.slice(0, 3).map(prize => (
                <Stack key={prize.place} direction="row" justify="between" className="text-sm">
                  <span className="text-gray-400">{prize.place}. místo</span>
                  <span className="text-purple-300 font-medium">{prize.value}</span>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" justify="between" align="center">
            <Stack direction="row" className="-space-x-2">
              {hackathon.sponsors.slice(0, 3).map((sponsor, i) => (
                <Box
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-gray-900"
                  title={sponsor}
                >
                  {sponsor.charAt(0)}
                </Box>
              ))}
              {hackathon.sponsors.length > 3 && (
                <Box className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-gray-900">
                  +{hackathon.sponsors.length - 3}
                </Box>
              )}
            </Stack>

            <Button asChild size="sm">
              <Link href={`/arena/hackathon/${hackathon.id}`}>
                Více info
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </Stack>
        </Stack>
      </GlassSurface>
    </div>
  )
})

HackathonCard.displayName = 'HackathonCard'

export default function ArenaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hackathons')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'active' | 'completed'>(
    'all'
  )

  // State for API data
  const [hackathons, setHackathons] = useState<HackathonData[]>([])
  const [graduates, setGraduates] = useState<GraduateData[]>([])
  const [myTeams, setMyTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  // Fetch hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch('/api/hackathons')
        if (!res.ok) throw new Error('Failed to fetch hackathons')
        const data = await res.json()
        setHackathons(data.hackathons)
      } catch (err) {
        console.error('Error fetching hackathons:', err)
        setError('Nepodařilo se načíst hackathony')
      }
    }
    fetchHackathons()
  }, [])

  // Fetch graduates
  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        const res = await fetch('/api/graduates')
        if (!res.ok) throw new Error('Failed to fetch graduates')
        const data = await res.json()
        setGraduates(data.graduates)
      } catch (err) {
        console.error('Error fetching graduates:', err)
      }
    }
    fetchGraduates()
  }, [])

  // Fetch my teams
  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        const res = await fetch('/api/teams')
        if (!res.ok) {
          // User might not be logged in, that's OK
          setMyTeams([])
          return
        }
        const data = await res.json()
        setMyTeams(data.teams)
      } catch (err) {
        console.error('Error fetching teams:', err)
        setMyTeams([])
      } finally {
        setLoading(false)
      }
    }
    fetchMyTeams()
  }, [])

  // Memoize filtered data to avoid unnecessary recalculations
  const filteredHackathons = useMemo(() => {
    return hackathons.filter(hack => {
      if (filterStatus !== 'all' && hack.status !== filterStatus) return false
      if (
        searchQuery &&
        !hack.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !hack.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
  }, [hackathons, filterStatus, searchQuery])

  const filteredGraduates = useMemo(() => {
    return graduates.filter(grad => {
      const name = grad.user.name || grad.user.username || ''
      if (
        searchQuery &&
        !name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !grad.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
        return false
      return true
    })
  }, [graduates, searchQuery])

  return (
    <PublicPageLayout maxWidth="7xl">
      <SectionHeader subtitle="Místo, kde se setkávají talentovaní vývojáři, soutěží v hackathonech a prezentují své dovednosti potenciálním zaměstnavatelům. Propoj se s komunitou, získej hodnotnou zpětnou vazbu od odborníků a otevři si dveře ke kariérním příležitostem.">
        Apex Aréna
      </SectionHeader>

      {/* Tabs */}
      <Stack justify="center">
        <GlassSurface className="inline-flex p-1">
          <Button
            variant={activeTab === 'hackathons' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('hackathons')}
            className="rounded-lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Hackathony
          </Button>
          <Button
            variant={activeTab === 'graduates' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('graduates')}
            className="rounded-lg"
          >
            <Star className="w-5 h-5 mr-2" />
            Absolventi
          </Button>
          <Button
            variant={activeTab === 'my-teams' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('my-teams')}
            className="rounded-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Moje týmy
          </Button>
        </GlassSurface>
      </Stack>

      {/* Search and filters */}
      <Stack direction="row" gap={4} className="max-w-3xl mx-auto flex-col sm:flex-row">
        <Box className="flex-1">
          <GlassSurface className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'hackathons' ? 'Hledat hackathony...' : 'Hledat absolventy...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none"
            />
          </GlassSurface>
        </Box>

        {activeTab === 'hackathons' && (
          <GlassSurface className="inline-flex p-1">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="rounded"
            >
              Vše
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('upcoming')}
              className="rounded"
            >
              Nadcházející
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="rounded"
            >
              Probíhající
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
              className="rounded"
            >
              Ukončené
            </Button>
          </GlassSurface>
        )}
      </Stack>

      {/* Content */}
      <Box>
        {activeTab === 'hackathons' && (
          <Grid columns={1} md={2} gap={6}>
            {filteredHackathons.map(hackathon => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}

            {filteredHackathons.length === 0 && (
              <Box className="col-span-2 text-center py-12">
                <p className="text-gray-400">Žádné hackathony nebyly nalezeny</p>
              </Box>
            )}
          </Grid>
        )}

        {activeTab === 'graduates' && (
          <Grid columns={1} md={2} lg={3} gap={6}>
            {filteredGraduates.map((graduate, i) => {
              const name = graduate.user.name || graduate.user.username || 'Anonym'
              const initials = name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
              return (
                <motion.div
                  key={graduate.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassSurface className="p-6 h-full">
                    <Stack direction="col" gap={4}>
                      <Stack direction="col" align="center">
                        {graduate.user.image ? (
                          <>
                            {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={graduate.user.image}
                              alt={name}
                              className="w-24 h-24 mb-3 rounded-full object-cover"
                            />
                          </>
                        ) : (
                          <Box className="w-24 h-24 mb-3 rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff] flex items-center justify-center text-3xl font-bold text-white">
                            {initials}
                          </Box>
                        )}
                        <h3 className="text-xl font-bold text-white">{name}</h3>
                        {graduate.user.username && (
                          <p className="text-gray-400">@{graduate.user.username}</p>
                        )}
                      </Stack>

                      <p className="text-sm text-gray-300 line-clamp-3">
                        {graduate.bio || 'Žádné bio'}
                      </p>

                      <Stack direction="col" gap={3}>
                        <Stack direction="row" justify="between" className="text-sm">
                          <span className="text-gray-400">Absolvoval</span>
                          <span className="text-white">{formatDate(graduate.graduatedAt)}</span>
                        </Stack>
                        <Stack direction="row" justify="between" className="text-sm">
                          <span className="text-gray-400">Hackathon výhry</span>
                          <span className="text-purple-300 font-medium">
                            {graduate.hackathonWins}
                          </span>
                        </Stack>
                        {graduate.lookingForWork && (
                          <Stack
                            direction="row"
                            gap={2}
                            align="center"
                            className="text-sm text-green-400"
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Hledá práci</span>
                          </Stack>
                        )}
                      </Stack>

                      <Box>
                        <h4 className="text-sm font-semibold text-white mb-2">Dovednosti:</h4>
                        <Stack direction="row" wrap gap={2}>
                          {graduate.skills.slice(0, 5).map(skill => (
                            <Box
                              key={skill}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                            >
                              {skill}
                            </Box>
                          ))}
                          {graduate.skills.length > 5 && (
                            <Box className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              +{graduate.skills.length - 5}
                            </Box>
                          )}
                        </Stack>
                      </Box>

                      <Stack direction="row" gap={2}>
                        {graduate.github && (
                          <Button variant="secondary" size="sm" className="flex-1" asChild>
                            <a href={graduate.github} target="_blank" rel="noopener noreferrer">
                              <Code className="w-4 h-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/arena/graduate/${graduate.id}`}>
                            Profil
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </Stack>
                    </Stack>
                  </GlassSurface>
                </motion.div>
              )
            })}

            {filteredGraduates.length === 0 && (
              <Box className="col-span-full text-center py-12">
                <p className="text-gray-400">Žádní absolventi nebyli nalezeni</p>
              </Box>
            )}
          </Grid>
        )}

        {activeTab === 'my-teams' && (
          <Box className="max-w-4xl mx-auto">
            {loading ? (
              <GlassSurface className="p-8 text-center">
                <Stack direction="col" align="center" gap={4}>
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-gray-400">Načítání týmů...</p>
                </Stack>
              </GlassSurface>
            ) : myTeams.length === 0 ? (
              <GlassSurface className="p-8 text-center">
                <Stack direction="col" align="center" gap={4}>
                  <Users className="w-16 h-16 text-gray-600" />
                  <h3 className="text-2xl font-bold text-white">Zatím nejsi členem žádného týmu</h3>
                  <p className="text-gray-400">
                    Připoj se k hackathonu a vytvoř nebo se připoj k týmu!
                  </p>
                  <Button onClick={() => setActiveTab('hackathons')} className="mt-2">
                    Procházet hackathony
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Stack>
              </GlassSurface>
            ) : (
              <Stack direction="col" gap={4}>
                {myTeams.map(team => (
                  <GlassSurface key={team.id} className="p-6">
                    <Stack direction="row" justify="between" align="start">
                      <Box>
                        <Stack direction="row" gap={2} align="center">
                          <h3 className="text-xl font-bold text-white">{team.name}</h3>
                          <Box
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              team.myRole === 'leader'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {team.myRole === 'leader' ? 'Vedoucí' : 'Člen'}
                          </Box>
                        </Stack>
                        <p className="text-gray-400 text-sm mt-1">{team.hackathon.title}</p>
                      </Box>
                      <Box
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.hackathon.status === 'upcoming'
                            ? 'bg-blue-500/20 text-blue-300'
                            : team.hackathon.status === 'active'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {team.hackathon.status === 'upcoming'
                          ? 'Nadcházející'
                          : team.hackathon.status === 'active'
                            ? 'Probíhá'
                            : 'Ukončeno'}
                      </Box>
                    </Stack>

                    <Stack direction="row" gap={6} className="mt-4">
                      <Stack direction="col" gap={1}>
                        <span className="text-gray-400 text-sm">Členové</span>
                        <Stack direction="row" className="-space-x-2">
                          {team.members.slice(0, 4).map(member => (
                            <Box
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-xs text-white border-2 border-gray-900"
                              title={member.user.name || member.user.username || 'Anonym'}
                            >
                              {(member.user.name || member.user.username || 'A')
                                .charAt(0)
                                .toUpperCase()}
                            </Box>
                          ))}
                          {team.members.length > 4 && (
                            <Box className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-gray-900">
                              +{team.members.length - 4}
                            </Box>
                          )}
                        </Stack>
                      </Stack>

                      <Stack direction="col" gap={1}>
                        <span className="text-gray-400 text-sm">Projekt</span>
                        <span className="text-white">
                          {team.hasProject ? (
                            <span className="text-green-400">{team.project?.title}</span>
                          ) : (
                            <span className="text-gray-500">Neodevzdán</span>
                          )}
                        </span>
                      </Stack>
                    </Stack>

                    <Stack direction="row" justify="end" gap={2} className="mt-4">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/arena/hackathon/${team.hackathon.id}`}>
                          Detail hackathonu
                        </Link>
                      </Button>
                    </Stack>
                  </GlassSurface>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </PublicPageLayout>
  )
}
