'use client'

import { useState } from 'react'
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
  Trophy,
  Calendar,
  ExternalLink,
  Download,
  Briefcase,
  Code,
  BookOpen,
  Video
} from 'lucide-react'

import { Lightning } from '@/components/ui/lightning'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Graduate } from '@/types/arena'

// Mock data - in real app would fetch from API
const mockGraduate: Graduate = {
  id: 'grad-1',
  username: 'CodeMaster',
  fullName: 'Jan Novák',
  email: 'jan@example.com',
  bio: 'Passionate full-stack developer specializující se na AI a machine learning. Miluji řešení složitých problémů a vytváření inovativních aplikací. Mám zkušenosti s vývojem webových aplikací, mobilních aplikací a AI modelů.',
  graduatedAt: new Date('2023-12-15'),
  certificateId: 'CERT-2023-001',
  skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'Docker', 'TypeScript', 'PostgreSQL', 'AWS', 'FastAPI', 'Next.js'],
  portfolio: [
    {
      id: 'port-1',
      title: 'AI Chatbot pro zákaznickou podporu',
      description: 'Inteligentní chatbot využívající NLP pro automatizaci zákaznické podpory. Snížil dobu odpovědi o 70%.',
      url: 'https://github.com/user/ai-chatbot',
      type: 'project',
      thumbnail: '/project1.jpg',
      technologies: ['Python', 'TensorFlow', 'FastAPI', 'React']
    },
    {
      id: 'port-2',
      title: 'Real-time Analytics Dashboard',
      description: 'Webová aplikace pro vizualizaci dat v reálném čase s pokročilými grafy a filtrovaní.',
      url: 'https://github.com/user/analytics-dashboard',
      type: 'project',
      thumbnail: '/project2.jpg',
      technologies: ['Next.js', 'D3.js', 'WebSocket', 'PostgreSQL']
    },
    {
      id: 'port-3',
      title: 'Machine Learning v praxi',
      description: 'Článek o implementaci ML modelů v produkčním prostředí',
      url: 'https://medium.com/@user/ml-production',
      type: 'article',
      technologies: ['Machine Learning', 'MLOps', 'Python']
    },
    {
      id: 'port-4',
      title: 'TensorFlow Developer Certificate',
      description: 'Oficiální certifikace od Google pro TensorFlow development',
      url: '/certificates/tensorflow.pdf',
      type: 'certificate',
      technologies: ['TensorFlow', 'Deep Learning']
    }
  ],
  hackathonWins: 2,
  github: 'https://github.com/codemaster',
  linkedIn: 'https://linkedin.com/in/codemaster',
  website: 'https://jannovák.dev',
  lookingForWork: true,
  preferredRoles: ['ML Engineer', 'Full-Stack Developer', 'AI Researcher']
}

const skillCategories = {
  'Languages': ['Python', 'TypeScript', 'JavaScript'],
  'Frameworks': ['React', 'Next.js', 'Node.js', 'FastAPI'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Scikit-learn'],
  'Databases': ['PostgreSQL', 'MongoDB', 'Redis'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
}

export default function GraduateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'project' | 'article' | 'certificate'>('all')
  
  const graduateId = params?.graduateId as string
  const graduate = mockGraduate // In real app: fetch based on graduateId
  
  if (!graduate) {
    return <div>Absolvent nenalezen</div>
  }
  
  const filteredPortfolio = graduate.portfolio.filter(
    item => selectedCategory === 'all' || item.type === selectedCategory
  )
  
  const getPortfolioIcon = (type: string) => {
    switch (type) {
      case 'project': return <Code className="w-4 h-4" />
      case 'article': return <BookOpen className="w-4 h-4" />
      case 'presentation': return <Video className="w-4 h-4" />
      case 'certificate': return <Award className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
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
                <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">
                  Apex Aréna
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
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
      
      {/* Main content */}
      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
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
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                  {graduate.fullName.split(' ').map(n => n[0]).join('')}
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
                  <a
                    href={`mailto:${graduate.email}`}
                    className="w-full py-2 px-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Kontakt
                  </a>
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
              <ElectricBorder className="rounded-lg">
                <GlassSurface className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                  <h3 className="font-semibold text-white mb-2">Certifikát absolventa</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {graduate.graduatedAt.toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">ID: {graduate.certificateId}</p>
                  <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Stáhnout certifikát
                  </button>
                </GlassSurface>
              </ElectricBorder>
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
                        {cat === 'all' ? 'Vše' :
                         cat === 'project' ? 'Projekty' :
                         cat === 'article' ? 'Články' :
                         'Certifikáty'}
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
                    <p className="text-center text-gray-400 py-8">
                      Žádné položky v této kategorii
                    </p>
                  )}
                </div>
              </GlassSurface>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
