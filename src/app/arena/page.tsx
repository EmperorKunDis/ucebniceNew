'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
  Clock
} from 'lucide-react'

import { PageLayout } from '@/components/layout/page-layout'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Button } from '@/components/ui/button'
import { Box, Stack, Grid } from '@/components/layout'
// import { useUserStore } from '@/store/user-store'
import { Hackathon, Graduate } from '@/types/arena'

// Mock data for hackathons
const mockHackathons: Hackathon[] = [
  {
    id: 'hack-1',
    title: 'AI Innovation Challenge 2024',
    description: 'Vytvořte revolucní AI řešení, která změní svět. Zaměřte se na praktické aplikace v reálném světě.',
    theme: 'Umělá inteligence pro lepší budoucnost',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-17'),
    status: 'upcoming',
    prizes: [
      { place: 1, title: 'Hlavní cena', description: 'Mentoring + stáž', value: '50 000 Kč' },
      { place: 2, title: 'Druhé místo', description: 'Online kurzy', value: '30 000 Kč' },
      { place: 3, title: 'Třetí místo', description: 'Knihy a vybavení', value: '15 000 Kč' }
    ],
    judges: [
      {
        id: 'judge-1',
        name: 'Dr. Eva Nováková',
        title: 'Head of AI Research',
        company: 'TechCorp',
        bio: '15 let zkušeností v AI výzkumu'
      }
    ],
    sponsors: ['TechCorp', 'AI Labs', 'Future Fund'],
    maxTeamSize: 4,
    registrationDeadline: new Date('2024-02-10'),
    bannerImage: '/hackathon-ai.jpg'
  },
  {
    id: 'hack-2',
    title: 'Web3 Developer Sprint',
    description: 'Postavte decentralizované aplikace budoucnosti na blockchainu.',
    theme: 'Decentralizované finance a Web3',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-03'),
    status: 'upcoming',
    prizes: [
      { place: 1, title: 'Crypto Prize', description: 'ETH tokens', value: '5 ETH' },
      { place: 2, title: 'NFT Collection', description: 'Exclusive NFTs', value: '3 ETH' },
      { place: 3, title: 'DeFi Toolkit', description: 'Premium tools', value: '1 ETH' }
    ],
    judges: [],
    sponsors: ['CryptoVentures', 'BlockchainHub'],
    maxTeamSize: 5,
    registrationDeadline: new Date('2024-02-25')
  }
]

// Mock data for graduates
const mockGraduates: Graduate[] = [
  {
    id: 'grad-1',
    username: 'CodeMaster',
    fullName: 'Jan Novák',
    email: 'jan@example.com',
    bio: 'Passionate full-stack developer specializující se na AI a machine learning. Miluji řešení složitých problémů.',
    graduatedAt: new Date('2023-12-15'),
    certificateId: 'CERT-2023-001',
    skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'Docker'],
    portfolio: [
      {
        id: 'port-1',
        title: 'AI Chatbot',
        description: 'Inteligentní chatbot pro zákaznickou podporu',
        url: 'https://github.com/user/chatbot',
        type: 'project',
        thumbnail: '/project1.jpg',
        technologies: ['Python', 'NLP', 'FastAPI']
      }
    ],
    hackathonWins: 2,
    github: 'https://github.com/codemaster',
    linkedIn: 'https://linkedin.com/in/codemaster',
    lookingForWork: true,
    preferredRoles: ['ML Engineer', 'Full-Stack Developer']
  },
  {
    id: 'grad-2',
    username: 'DataWizard',
    fullName: 'Marie Svobodová',
    email: 'marie@example.com',
    bio: 'Data scientist s vášní pro vizualizace a insights. Specializuji se na prediktivní modelování.',
    graduatedAt: new Date('2023-11-20'),
    certificateId: 'CERT-2023-002',
    skills: ['Python', 'R', 'SQL', 'Tableau', 'Scikit-learn'],
    portfolio: [],
    hackathonWins: 1,
    github: 'https://github.com/datawizard',
    lookingForWork: false,
    preferredRoles: ['Data Scientist', 'Data Analyst']
  }
]

type TabType = 'hackathons' | 'graduates' | 'my-teams'

export default function ArenaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hackathons')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all')
  // const { username, level } = useUserStore()
  
  const filteredHackathons = mockHackathons.filter(hack => {
    if (filterStatus !== 'all' && hack.status !== filterStatus) return false
    if (searchQuery && !hack.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !hack.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })
  
  const filteredGraduates = mockGraduates.filter(grad => {
    if (searchQuery && !grad.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !grad.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    return true
  })
  
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Apex Aréna
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Místo, kde se setkávají talentovaní vývojáři, soutěží v hackathonech a prezentují své dovednosti potenciálním zaměstnavatelům.
          Propoj se s komunitou, získej hodnotnou zpětnou vazbu od odborníků a otevři si dveře ke kariérním příležitostem.
        </p>
      </motion.div>

      {/* Tabs */}
      <Stack justify="center" className="mb-8">
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
      <Stack
        direction="row"
        gap={4}
        className="mb-8 max-w-3xl mx-auto flex-col sm:flex-row"
      >
        <Box className="flex-1">
          <GlassSurface className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'hackathons' ? 'Hledat hackathony...' : 'Hledat absolventy...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredHackathons.map((hackathon, i) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ElectricBorder className="h-full rounded-lg">
                  <GlassSurface className="p-6 h-full">
                <Stack direction="col" gap={4}>
                  <Stack direction="row" justify="between" align="start">
                    <Box>
                      <h3 className="text-2xl font-bold text-white mb-2">{hackathon.title}</h3>
                      <p className="text-gray-400">{hackathon.theme}</p>
                    </Box>
                    <Box className={`px-3 py-1 rounded-full text-sm font-medium ${
                      hackathon.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                      hackathon.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {hackathon.status === 'upcoming' ? 'Nadcházející' :
                       hackathon.status === 'active' ? 'Probíhá' : 'Ukončeno'}
                    </Box>
                  </Stack>
                  
                  <p className="text-gray-300">{hackathon.description}</p>
                  
                  <Stack direction="col" gap={3}>
                    <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                  {hackathon.startDate.toLocaleDateString('cs-CZ')} - {hackathon.endDate.toLocaleDateString('cs-CZ')}
                      </span>
                    </Stack>
                    <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Max. {hackathon.maxTeamSize} členů v týmu</span>
                    </Stack>
                    <Stack direction="row" gap={2} align="center" className="text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Registrace do: {hackathon.registrationDeadline.toLocaleDateString('cs-CZ')}</span>
                    </Stack>
                  </Stack>
                  
                  <Box>
                    <h4 className="text-sm font-semibold text-white mb-2">Ceny:</h4>
                    <Stack gap={2}>
                      {hackathon.prizes.slice(0, 3).map((prize) => (
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
                    
                    <Button
                      asChild
                      size="sm"
                    >
                      <Link href={`/arena/hackathon/${hackathon.id}`}>
                  Více info
                  <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </Stack>
                </Stack>
                  </GlassSurface>
                </ElectricBorder>
              </motion.div>
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
                {filteredGraduates.map((graduate, i) => (
              <motion.div
                key={graduate.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassSurface className="p-6 h-full">
                  <Stack direction="col" gap={4}>
                <Stack direction="col" align="center">
                  <Box className="w-24 h-24 mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                    {graduate.fullName.split(' ').map(n => n[0]).join('')}
                  </Box>
                  <h3 className="text-xl font-bold text-white">{graduate.fullName}</h3>
                  <p className="text-gray-400">@{graduate.username}</p>
                </Stack>
                
                <p className="text-sm text-gray-300 line-clamp-3">{graduate.bio}</p>
                
                <Stack direction="col" gap={3}>
                  <Stack direction="row" justify="between" className="text-sm">
                    <span className="text-gray-400">Absolvoval</span>
                    <span className="text-white">{graduate.graduatedAt.toLocaleDateString('cs-CZ')}</span>
                  </Stack>
                  <Stack direction="row" justify="between" className="text-sm">
                    <span className="text-gray-400">Hackathon výhry</span>
                    <span className="text-purple-300 font-medium">{graduate.hackathonWins}</span>
                  </Stack>
                  {graduate.lookingForWork && (
                    <Stack direction="row" gap={2} align="center" className="text-sm text-green-400">
                      <Briefcase className="w-4 h-4" />
                      <span>Hledá práci</span>
                    </Stack>
                  )}
                </Stack>
                
                <Box>
                  <h4 className="text-sm font-semibold text-white mb-2">Dovednosti:</h4>
                  <Stack direction="row" wrap gap={2}>
                    {graduate.skills.slice(0, 5).map((skill) => (
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
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a
                  href={graduate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                      >
                  <Code className="w-4 h-4 mr-2" />
                  GitHub
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/arena/graduate/${graduate.id}`}>
                      Profil
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </Stack>
                  </Stack>
                </GlassSurface>
              </motion.div>
                ))}
                
                {filteredGraduates.length === 0 && (
              <Box className="col-span-full text-center py-12">
                <p className="text-gray-400">Žádní absolventi nebyli nalezeni</p>
              </Box>
                )}
              </Grid>
            )}
            
            {activeTab === 'my-teams' && (
              <Box className="max-w-4xl mx-auto">
                <GlassSurface className="p-8 text-center">
              <Stack direction="col" align="center" gap={4}>
                <Users className="w-16 h-16 text-gray-600" />
                <h3 className="text-2xl font-bold text-white">Zatím nejsi členem žádného týmu</h3>
                <p className="text-gray-400">
                  Připoj se k hackathonu a vytvoř nebo se připoj k týmu!
                </p>
                <Button
                  onClick={() => setActiveTab('hackathons')}
                  className="mt-2"
                >
                  Procházet hackathony
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Stack>
                </GlassSurface>
              </Box>
            )}
          </Box>
    </PageLayout>
  )
}