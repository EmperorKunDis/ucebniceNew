'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronLeft,
  Github,
  Linkedin,
  Globe,
  Mail,
  Award,
  ExternalLink,
  Download,
  Briefcase,
  Code,
  BookOpen,
  Video,
  Loader2,
} from 'lucide-react'

import { GlassSurface } from '@/components/ui/glass-surface'
import { Graduate, PortfolioItem } from '@/types/arena'
import { PublicPageLayout } from '@/components/layout/PublicPageLayout'

const skillCategories = {
  Languages: ['Python', 'TypeScript', 'JavaScript'],
  Frameworks: ['React', 'Next.js', 'Node.js', 'FastAPI'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Scikit-learn'],
  Databases: ['PostgreSQL', 'MongoDB', 'Redis'],
  DevOps: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
}

interface GraduateApiResponse {
  graduate: {
    id: string
    user?: {
      name?: string | null
      username?: string | null
      image?: string | null
    }
    bio?: string | null
    graduatedAt: string
    certificateId: string
    skills?: string[]
    portfolio?: unknown
    linkedIn?: string | null
    github?: string | null
    website?: string | null
    lookingForWork?: boolean
    preferredRoles?: string[]
    hackathonWins?: number
  }
}

function isPortfolioItem(item: unknown): item is PortfolioItem {
  if (!item || typeof item !== 'object') return false

  const value = item as Partial<PortfolioItem>
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.url === 'string' &&
    ['project', 'article', 'presentation', 'certificate'].includes(value.type ?? '') &&
    Array.isArray(value.technologies)
  )
}

function mapGraduate(data: GraduateApiResponse['graduate']): Graduate {
  const username = data.user?.username ?? 'absolvent'
  const fullName = data.user?.name ?? username
  const portfolio = Array.isArray(data.portfolio) ? data.portfolio.filter(isPortfolioItem) : []

  return {
    id: data.id,
    username,
    fullName,
    email: '',
    avatar: data.user?.image ?? undefined,
    bio: data.bio ?? 'Tento absolvent zatím nemá vyplněné bio.',
    graduatedAt: new Date(data.graduatedAt),
    certificateId: data.certificateId,
    skills: data.skills ?? [],
    portfolio,
    hackathonWins: data.hackathonWins ?? 0,
    linkedIn: data.linkedIn ?? undefined,
    github: data.github ?? undefined,
    website: data.website ?? undefined,
    lookingForWork: data.lookingForWork ?? false,
    preferredRoles: data.preferredRoles ?? [],
  }
}

export default function GraduateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'project' | 'article' | 'certificate'
  >('all')
  const [graduate, setGraduate] = useState<Graduate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const graduateId = typeof params?.graduateId === 'string' ? params.graduateId : null

  useEffect(() => {
    const fetchGraduate = async () => {
      if (!graduateId) {
        setError('Neplatný detail absolventa')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/graduates/${graduateId}`)

        if (res.status === 404) {
          setGraduate(null)
          setError('Absolvent nebyl nalezen')
          return
        }

        if (!res.ok) throw new Error('Failed to fetch graduate')

        const data = (await res.json()) as GraduateApiResponse
        setGraduate(mapGraduate(data.graduate))
      } catch (err) {
        console.error('Error fetching graduate:', err)
        setGraduate(null)
        setError('Profil absolventa se nepodařilo načíst')
      } finally {
        setLoading(false)
      }
    }

    fetchGraduate()
  }, [graduateId])

  if (loading) {
    return (
      <PublicPageLayout
        maxWidth="7xl"
        contentClassName="flex min-h-[60vh] items-center justify-center"
      >
        <GlassSurface className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-300">Načítání profilu absolventa...</p>
        </GlassSurface>
      </PublicPageLayout>
    )
  }

  if (error || !graduate) {
    return (
      <PublicPageLayout
        maxWidth="7xl"
        contentClassName="flex min-h-[60vh] items-center justify-center"
      >
        <GlassSurface className="p-8 text-center max-w-md">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Absolvent nenalezen</h1>
          <p className="text-gray-400 mb-6">
            {error ?? 'Profil absolventa pro toto ID neexistuje.'}
          </p>
          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Zpět do Arény
          </Link>
        </GlassSurface>
      </PublicPageLayout>
    )
  }

  const filteredPortfolio = graduate.portfolio.filter(
    item => selectedCategory === 'all' || item.type === selectedCategory
  )

  const getPortfolioIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="w-4 h-4" />
      case 'article':
        return <BookOpen className="w-4 h-4" />
      case 'presentation':
        return <Video className="w-4 h-4" />
      case 'certificate':
        return <Award className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getCategorizedSkills = () => {
    const categorized: Record<string, string[]> = {}
    const uncategorized: string[] = []

    graduate.skills.forEach(skill => {
      let found = false
      Object.entries(skillCategories).forEach(([category, skills]) => {
        if (skills.includes(skill)) {
          if (!categorized[category]) categorized[category] = []
          categorized[category].push(skill)
          found = true
        }
      })
      if (!found) uncategorized.push(skill)
    })

    if (uncategorized.length > 0) {
      categorized['Other'] = uncategorized
    }

    return categorized
  }

  return (
    <PublicPageLayout maxWidth="7xl">
      <button
        onClick={() => router.push('/arena')}
        className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Zpět na Arénu
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <GlassSurface className="p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#846bff] to-[#6747ff] flex items-center justify-center text-4xl font-bold text-white">
              {graduate.avatar ? (
                <>
                  {/* Dynamic user avatars can be arbitrary remote URLs outside next/image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={graduate.avatar}
                    alt={graduate.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </>
              ) : (
                graduate.fullName
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{graduate.fullName}</h1>
            <p className="text-gray-400 mb-4">@{graduate.username}</p>

            {graduate.lookingForWork && (
              <div className="mb-4 px-3 py-1 bg-green-500/20 text-green-300 rounded-full inline-flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">Hledá práci</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              {graduate.github && (
                <a
                  href={graduate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {graduate.linkedIn && (
                <a
                  href={graduate.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {graduate.website && (
                <a
                  href={graduate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
              {graduate.email && (
                <a
                  href={`mailto:${graduate.email}`}
                  className="w-full py-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Kontakt
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{graduate.hackathonWins}</p>
                <p className="text-sm text-gray-400">Hackathon výhry</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{graduate.portfolio.length}</p>
                <p className="text-sm text-gray-400">Portfolio položek</p>
              </div>
            </div>
          </GlassSurface>

          {/* Certificate */}
          <GlassSurface className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
            <h3 className="font-semibold text-white mb-2">Certifikát absolventa</h3>
            <p className="text-sm text-gray-400 mb-4">
              {graduate.graduatedAt.toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500 mb-4">ID: {graduate.certificateId}</p>
            <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Stáhnout certifikát
            </button>
          </GlassSurface>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <GlassSurface className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">O mně</h2>
            <p className="text-gray-300 leading-relaxed">{graduate.bio}</p>

            {graduate.preferredRoles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Hledané pozice</h3>
                <div className="flex flex-wrap gap-2">
                  {graduate.preferredRoles.map(role => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassSurface>

          {/* Skills */}
          <GlassSurface className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dovednosti</h2>
            <div className="space-y-6">
              {Object.entries(getCategorizedSkills()).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm hover:bg-purple-500/30 transition-all cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassSurface>

          {/* Portfolio */}
          <GlassSurface className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Portfolio</h2>
              <div className="flex gap-2">
                {(['all', 'project', 'article', 'certificate'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all'
                      ? 'Vše'
                      : cat === 'project'
                        ? 'Projekty'
                        : cat === 'article'
                          ? 'Články'
                          : 'Certifikáty'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredPortfolio.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                      {getPortfolioIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.technologies.map(tech => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-white/10 text-xs text-gray-300 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                        >
                          Zobrazit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPortfolio.length === 0 && (
                <p className="text-center text-gray-400 py-8">Žádné položky v této kategorii</p>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>
    </PublicPageLayout>
  )
}
