'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { useUserStore } from '@/store/user-store'
import { Hackathon, Team } from '@/types/arena'

// Mock data - in real app would fetch from API
const mockHackathon: Hackathon = {
  id: 'hack-1',
  title: 'AI Innovation Challenge 2024',
  description:
    'Vytvořte revolucní AI řešení, která změní svět. Zaměřte se na praktické aplikace v reálném světě.',
  theme: 'Umělá inteligence pro lepší budoucnost',
  startDate: new Date('2024-02-15'),
  endDate: new Date('2024-02-17'),
  status: 'upcoming',
  prizes: [
    {
      place: 1,
      title: 'Hlavní cena',
      description: 'Mentoring + stáž ve společnosti TechCorp',
      value: '50 000 Kč',
    },
    {
      place: 2,
      title: 'Druhé místo',
      description: 'Online kurzy a certifikace',
      value: '30 000 Kč',
    },
    {
      place: 3,
      title: 'Třetí místo',
      description: 'Knihy a vývojové vybavení',
      value: '15 000 Kč',
    },
  ],
  judges: [
    {
      id: 'judge-1',
      name: 'Dr. Eva Nováková',
      title: 'Head of AI Research',
      company: 'TechCorp',
      bio: '15 let zkušeností v AI výzkumu. Specializuje se na NLP a počítačové vidění.',
      avatar: '/judge1.jpg',
    },
    {
      id: 'judge-2',
      name: 'Ing. Tomáš Dvořák',
      title: 'CTO',
      company: 'StartupHub',
      bio: 'Zakladatel několika úspěšných startupů v oblasti AI a ML.',
      avatar: '/judge2.jpg',
    },
    {
      id: 'judge-3',
      name: 'Mgr. Kateřina Svobodová',
      title: 'Product Manager',
      company: 'AI Labs',
      bio: 'Expert na produktový management a UX design v AI aplikacích.',
      avatar: '/judge3.jpg',
    },
  ],
  sponsors: ['TechCorp', 'AI Labs', 'Future Fund', 'CloudProvider', 'DataScience Inc.'],
  maxTeamSize: 4,
  registrationDeadline: new Date('2024-02-10'),
  bannerImage: '/hackathon-ai.jpg',
}

// Mock teams
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Neural Ninjas',
    members: [
      {
        userId: 'user-1',
        username: 'CodeMaster',
        role: 'leader',
        skills: ['Python', 'TensorFlow'],
      },
      { userId: 'user-2', username: 'DataWiz', role: 'member', skills: ['Data Science', 'SQL'] },
      { userId: 'user-3', username: 'MLGuru', role: 'member', skills: ['ML', 'PyTorch'] },
    ],
    hackathonId: 'hack-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'team-2',
    name: 'AI Avengers',
    members: [
      { userId: 'user-4', username: 'PythonPro', role: 'leader', skills: ['Python', 'FastAPI'] },
      {
        userId: 'user-5',
        username: 'ReactRanger',
        role: 'member',
        skills: ['React', 'TypeScript'],
      },
    ],
    hackathonId: 'hack-1',
    createdAt: new Date('2024-01-20'),
  },
]

export default function HackathonDetailPage() {
  const router = useRouter()
  const { level } = useUserStore()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'teams' | 'rules'>('overview')

  // const hackathonId = params?.hackathonId as string
  const hackathon = mockHackathon // In real app: fetch based on hackathonId
  const teams = mockTeams

  const daysUntilStart = Math.ceil(
    (hackathon.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const daysUntilDeadline = Math.ceil(
    (hackathon.registrationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  if (!hackathon) {
    return <div>Hackathon nenalezen</div>
  }

  return (
    <div className="min-h-screen relative">
      <Lightning />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-4">
        <div className="max-w-7xl mx-auto">
          <GlassSurface
            className="p-6"
            borderRadius={16}
            blur={20}
            backgroundOpacity={0.02}
            opacity={0.95}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Učebnice AI
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">
                  Apex Aréna
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profil
                </Link>
              </div>
            </div>
          </GlassSurface>
        </div>
      </nav>

      {/* Hero section with banner */}
      <section className="relative z-10 pt-28">
        <div className="relative h-64 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <button
                onClick={() => router.push('/arena')}
                className="text-white/80 hover:text-white flex items-center gap-2 mb-4 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Zpět na Arénu
              </button>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{hackathon.title}</h1>
              <p className="text-xl text-white/80">{hackathon.theme}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="relative z-10 px-4 -mt-16">
        <div className="max-w-7xl mx-auto">
          {/* Quick stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <GlassSurface className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">{daysUntilStart}</p>
              <p className="text-sm text-gray-400">Dní do začátku</p>
            </GlassSurface>

            <GlassSurface className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold text-white">{daysUntilDeadline}</p>
              <p className="text-sm text-gray-400">Dní do registrace</p>
            </GlassSurface>

            <GlassSurface className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-white">{teams.length}</p>
              <p className="text-sm text-gray-400">Týmů přihlášeno</p>
            </GlassSurface>

            <GlassSurface className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-white">{hackathon.prizes.length}</p>
              <p className="text-sm text-gray-400">Ceny k výhru</p>
            </GlassSurface>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 relative z-20">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === 'overview'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Přehled
            </button>
            <button
              onClick={() => setSelectedTab('teams')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === 'teams'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Týmy ({teams.length})
            </button>
            <button
              onClick={() => setSelectedTab('rules')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === 'rules'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Pravidla
            </button>
          </div>

          {/* Tab content */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              {selectedTab === 'overview' && (
                <>
                  <GlassSurface className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">O hackathonu</h2>
                    <p className="text-gray-300 leading-relaxed mb-6">{hackathon.description}</p>
                    <p className="text-gray-300 leading-relaxed">
                      Připoj se k nám na třídennní maratonu inovací, kde budete mít možnost ukázat
                      své dovednosti, naučit se nové technologie a soutěžit o skvělé ceny. Ať už
                      jste začátečník nebo zkušený vývojář, najdete zde inspiraci a výzvy na své
                      úrovni.
                    </p>
                  </GlassSurface>

                  <GlassSurface className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Ceny</h2>
                    <div className="space-y-4">
                      {hackathon.prizes.map((prize, i) => (
                        <motion.div
                          key={prize.place}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-white/5 rounded-lg"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              prize.place === 1
                                ? 'bg-yellow-500 text-black'
                                : prize.place === 2
                                  ? 'bg-gray-400 text-black'
                                  : 'bg-orange-600 text-white'
                            }`}
                          >
                            {prize.place}.
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{prize.title}</h3>
                            <p className="text-sm text-gray-400 mb-2">{prize.description}</p>
                            <p className="text-lg font-bold text-purple-300">{prize.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassSurface>

                  <GlassSurface className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Porota</h2>
                    <div className="space-y-4">
                      {hackathon.judges.map((judge, i) => (
                        <motion.div
                          key={judge.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                            {judge.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{judge.name}</h3>
                            <p className="text-sm text-purple-300">
                              {judge.title} @ {judge.company}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">{judge.bio}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassSurface>
                </>
              )}

              {selectedTab === 'teams' && (
                <GlassSurface className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Přihlášené týmy</h2>
                  <div className="space-y-4">
                    {teams.map((team, i) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <span className="text-sm text-gray-400">
                            {team.members.length}/{hackathon.maxTeamSize} členů
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map(member => (
                            <div
                              key={member.userId}
                              className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full"
                            >
                              <span className="text-sm text-white">{member.username}</span>
                              {member.role === 'leader' && (
                                <span className="text-xs text-yellow-400">Leader</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {team.members.length < hackathon.maxTeamSize && (
                          <p className="text-sm text-purple-300 mt-2">Hledá další členy</p>
                        )}
                      </motion.div>
                    ))}

                    {teams.length === 0 && (
                      <p className="text-center text-gray-400 py-8">
                        Zatím nejsou přihlášené žádné týmy. Buď první!
                      </p>
                    )}
                  </div>
                </GlassSurface>
              )}

              {selectedTab === 'rules' && (
                <GlassSurface className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Pravidla a pokyny</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        Složení týmu
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Maximální počet členů v týmu: {hackathon.maxTeamSize}</li>
                        <li>• Minimální počet členů: 1 (solo účast možná)</li>
                        <li>• Všichni člennové musí být registrovaní uživatelé</li>
                        <li>• Jeden člověk může být součástí pouze jednoho týmu</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Požadavky na projekt
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Projekt musí být vytvořen během hackathonu</li>
                        <li>• Použití open-source knihoven je povoleno</li>
                        <li>• Zdrojový kód musí být nahrán na GitHub</li>
                        <li>• Projekt musí obsahovat README s popisem a instrukcemí</li>
                        <li>• Funkční demo nebo video prezentace je povinné</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        Hodnocení
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Inovativnost a originalita (30%)</li>
                        <li>• Technická implementace (30%)</li>
                        <li>• Praktické využití a dopad (20%)</li>
                        <li>• Kvalita prezentace (20%)</li>
                      </ul>
                    </div>
                  </div>
                </GlassSurface>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration CTA */}
              {hackathon.status === 'upcoming' && (
                <ElectricBorder className="rounded-lg">
                  <GlassSurface className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Připoj se k výzvě!</h3>
                    <p className="text-gray-400 mb-4">
                      Registrace končí za {daysUntilDeadline} dní
                    </p>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Registrovat se
                    </button>
                  </GlassSurface>
                </ElectricBorder>
              )}

              {/* Event details */}
              <GlassSurface className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Detaily akce</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Začátek</p>
                      <p className="text-white">
                        {hackathon.startDate.toLocaleDateString('cs-CZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Konec</p>
                      <p className="text-white">
                        {hackathon.endDate.toLocaleDateString('cs-CZ', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Formát</p>
                      <p className="text-white">Online (remote)</p>
                    </div>
                  </div>
                </div>
              </GlassSurface>

              {/* Sponsors */}
              <GlassSurface className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sponzoři</h3>
                <div className="grid grid-cols-2 gap-3">
                  {hackathon.sponsors.map((sponsor, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white/5 rounded-lg text-center text-sm text-gray-300 hover:bg-white/10 transition-all"
                    >
                      {sponsor}
                    </div>
                  ))}
                </div>
              </GlassSurface>

              {/* Share */}
              <GlassSurface className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sdílet</h3>
                <button className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Sdílet hackathon
                </button>
              </GlassSurface>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      {showRegisterModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowRegisterModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={e => e.stopPropagation()}
          >
            <ElectricBorder className="rounded-lg">
              <GlassSurface className="p-8 max-w-md">
                <h2 className="text-2xl font-bold text-white mb-4">Registrace na hackathon</h2>
                <p className="text-gray-400 mb-6">
                  Pro registraci musíš mít úroveň alespoň 5. Aktuální úroveň: {level}
                </p>

                {level >= 5 ? (
                  <div className="space-y-4">
                    <p className="text-gray-300">Vyber možnost:</p>
                    <button className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <h3 className="font-semibold text-white mb-1">Vytvořit nový tým</h3>
                      <p className="text-sm text-gray-400">Založ nový tým a pozvi další členy</p>
                    </button>
                    <button className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <h3 className="font-semibold text-white mb-1">Připojit se k týmu</h3>
                      <p className="text-sm text-gray-400">
                        Najdi existující tým a požádej o přijetí
                      </p>
                    </button>
                    <button className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <h3 className="font-semibold text-white mb-1">Solo účast</h3>
                      <p className="text-sm text-gray-400">Pracuj sám na svém projektu</p>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      Potřebuješ ještě {5 - level} úrovně pro registraci.
                    </p>
                    <Link
                      href="/lessons"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                    >
                      Pokračovat v učení
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="mt-6 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Zavřít
                </button>
              </GlassSurface>
            </ElectricBorder>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
