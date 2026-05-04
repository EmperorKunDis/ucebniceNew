'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Loader2, ChevronDown, X } from 'lucide-react'

import { UnifiedPageLayout } from '@/components/layout/unified-page-layout'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Button } from '@/components/ui/button'
import { Stack, Box } from '@/components/layout'

interface HackathonOption {
  id: string
  title: string
  status: string
  registrationDeadline: string
}

const TECH_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Node.js',
  'Java',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Swift',
  'Kotlin',
  'Flutter',
  'Django',
  'FastAPI',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Figma',
  'Tailwind CSS',
]

// Reusable chip-select button
function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        selected ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  )
}

export default function HackathonRegistracePage() {
  const [hackathons, setHackathons] = useState<HackathonOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Form state
  const [hackathonId, setHackathonId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [school, setSchool] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('')
  const [experience, setExperience] = useState('')
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [github, setGithub] = useState('')
  const [linkedIn, setLinkedIn] = useState('')
  const [preferredRole, setPreferredRole] = useState('')
  const [motivation, setMotivation] = useState('')
  const [teamPreference, setTeamPreference] = useState('solo')
  const [teamName, setTeamName] = useState('')
  const [tshirtSize, setTshirtSize] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [howDidYouHear, setHowDidYouHear] = useState('')
  const [previousHackathons, setPreviousHackathons] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)

  // Fetch available hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch('/api/hackathons')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const open = (data.hackathons as HackathonOption[]).filter(
          h => h.status !== 'completed' && new Date(h.registrationDeadline) > new Date()
        )
        setHackathons(open)
        if (open.length === 1 && open[0]) setHackathonId(open[0].id)
      } catch {
        setError('Nepodařilo se načíst hackathony')
      } finally {
        setLoading(false)
      }
    }
    fetchHackathons()
  }, [])

  const addTechnology = (tech: string) => {
    const trimmed = tech.trim()
    if (trimmed && !technologies.includes(trimmed) && technologies.length < 15) {
      setTechnologies([...technologies, trimmed])
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech))
  }

  const filteredSuggestions = TECH_SUGGESTIONS.filter(
    t => t.toLowerCase().includes(techInput.toLowerCase()) && !technologies.includes(t)
  ).slice(0, 6)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      const res = await fetch('/api/hackathons/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId,
          fullName,
          email,
          phone: phone || undefined,
          school: school || undefined,
          yearOfStudy: yearOfStudy || undefined,
          experience,
          technologies,
          github: github || undefined,
          linkedIn: linkedIn || undefined,
          preferredRole: preferredRole || undefined,
          motivation: motivation || undefined,
          teamPreference,
          teamName: teamName || undefined,
          tshirtSize: tshirtSize || undefined,
          dietaryRestrictions: dietaryRestrictions || undefined,
          specialNeeds: specialNeeds || undefined,
          howDidYouHear: howDidYouHear || undefined,
          previousHackathons: previousHackathons || undefined,
          gdprConsent,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details)
        } else {
          setError(data.error || 'Registrace se nezdařila')
        }
        return
      }

      setSubmitted(true)
    } catch {
      setError('Chyba připojení k serveru')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <UnifiedPageLayout maxWidth="4xl" showNav={false}>
        <Stack direction="col" align="center" justify="center" className="min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        </Stack>
      </UnifiedPageLayout>
    )
  }

  if (submitted) {
    return (
      <UnifiedPageLayout maxWidth="4xl" showNav={false}>
        <Stack direction="col" align="center" justify="center" className="min-h-[60vh]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <GlassSurface className="p-12 text-center max-w-md">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Registrace dokončena!</h2>
              <p className="text-gray-400">
                Děkujeme za přihlášení. Potvrzení jsme odeslali na{' '}
                <span className="text-purple-300">{email}</span>.
              </p>
            </GlassSurface>
          </motion.div>
        </Stack>
      </UnifiedPageLayout>
    )
  }

  const inputClass =
    'w-full p-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1'
  const errorClass = 'text-red-400 text-xs mt-1'
  const sectionTitle = 'text-lg font-semibold text-white mb-4 flex items-center gap-2'

  return (
    <UnifiedPageLayout maxWidth="4xl" showNav={false}>
      <SectionHeader subtitle="Vyplň formulář a zaregistruj se do hackathonu">
        Přihlášení do Hackathonu
      </SectionHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit}>
          <Stack direction="col" gap={6}>
            {/* === SECTION: Základní údaje === */}
            <GlassSurface className="p-8">
              <h3 className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  1
                </span>
                Základní údaje
              </h3>
              <Stack direction="col" gap={4}>
                {/* Hackathon select */}
                {hackathons.length > 1 && (
                  <Box>
                    <label className={labelClass}>
                      Hackathon <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={hackathonId}
                        onChange={e => setHackathonId(e.target.value)}
                        required
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" className="bg-gray-900">
                          Vyber hackathon...
                        </option>
                        {hackathons.map(h => (
                          <option key={h.id} value={h.id} className="bg-gray-900">
                            {h.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {fieldErrors.hackathonId && (
                      <p className={errorClass}>{fieldErrors.hackathonId}</p>
                    )}
                  </Box>
                )}

                {hackathons.length === 0 && (
                  <Box className="p-4 bg-yellow-500/10 rounded-lg text-yellow-300 text-center">
                    Momentálně nejsou otevřené žádné hackathony pro registraci.
                  </Box>
                )}

                {/* Name */}
                <Box>
                  <label className={labelClass}>
                    Celé jméno <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jan Novák"
                    required
                    className={inputClass}
                  />
                  {fieldErrors.fullName && <p className={errorClass}>{fieldErrors.fullName}</p>}
                </Box>

                {/* Email */}
                <Box>
                  <label className={labelClass}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jan@example.com"
                    required
                    className={inputClass}
                  />
                  {fieldErrors.email && <p className={errorClass}>{fieldErrors.email}</p>}
                </Box>

                {/* Phone */}
                <Box>
                  <label className={labelClass}>Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+420 123 456 789"
                    className={inputClass}
                  />
                </Box>

                {/* School + Year */}
                <Stack direction="row" gap={4} className="flex-col sm:flex-row">
                  <Box className="flex-1">
                    <label className={labelClass}>Škola / organizace</label>
                    <input
                      type="text"
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      placeholder="ČVUT, Masarykova univerzita..."
                      className={inputClass}
                    />
                  </Box>
                  <Box className="sm:w-48">
                    <label className={labelClass}>Ročník studia</label>
                    <div className="relative">
                      <select
                        value={yearOfStudy}
                        onChange={e => setYearOfStudy(e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" className="bg-gray-900">
                          Vybrat...
                        </option>
                        <option value="1" className="bg-gray-900">
                          1. ročník
                        </option>
                        <option value="2" className="bg-gray-900">
                          2. ročník
                        </option>
                        <option value="3" className="bg-gray-900">
                          3. ročník
                        </option>
                        <option value="4" className="bg-gray-900">
                          4. ročník
                        </option>
                        <option value="5+" className="bg-gray-900">
                          5+ ročník
                        </option>
                        <option value="graduated" className="bg-gray-900">
                          Absolvent
                        </option>
                        <option value="other" className="bg-gray-900">
                          Jiné
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </Box>
                </Stack>
              </Stack>
            </GlassSurface>

            {/* === SECTION: Zkušenosti a dovednosti === */}
            <GlassSurface className="p-8">
              <h3 className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  2
                </span>
                Zkušenosti a dovednosti
              </h3>
              <Stack direction="col" gap={4}>
                {/* Experience */}
                <Box>
                  <label className={labelClass}>
                    Úroveň zkušeností <span className="text-red-400">*</span>
                  </label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {[
                      { value: 'beginner', label: 'Začátečník' },
                      { value: 'intermediate', label: 'Středně pokročilý' },
                      { value: 'advanced', label: 'Pokročilý' },
                    ].map(opt => (
                      <ChipButton
                        key={opt.value}
                        selected={experience === opt.value}
                        onClick={() => setExperience(opt.value)}
                      >
                        {opt.label}
                      </ChipButton>
                    ))}
                  </Stack>
                  {fieldErrors.experience && <p className={errorClass}>{fieldErrors.experience}</p>}
                </Box>

                {/* Previous hackathons */}
                <Box>
                  <label className={labelClass}>Kolik hackathonů máš za sebou?</label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {[
                      { value: '0', label: 'Žádný (první)' },
                      { value: '1-2', label: '1–2' },
                      { value: '3+', label: '3 a více' },
                    ].map(opt => (
                      <ChipButton
                        key={opt.value}
                        selected={previousHackathons === opt.value}
                        onClick={() => setPreviousHackathons(opt.value)}
                      >
                        {opt.label}
                      </ChipButton>
                    ))}
                  </Stack>
                </Box>

                {/* Technologies */}
                <Box>
                  <label className={labelClass}>Technologie, které ovládáš</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTechnology(techInput)
                        }
                      }}
                      placeholder="Napiš a stiskni Enter..."
                      className={inputClass}
                    />
                    {techInput && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-white/10 rounded-lg overflow-hidden">
                        {filteredSuggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addTechnology(s)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {technologies.length > 0 && (
                    <Stack direction="row" wrap gap={2} className="mt-2">
                      {technologies.map(tech => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechnology(tech)}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </Stack>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{technologies.length}/15</p>
                </Box>

                {/* Preferred role */}
                <Box>
                  <label className={labelClass}>Preferovaná role v týmu</label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {[
                      { value: 'frontend', label: 'Frontend' },
                      { value: 'backend', label: 'Backend' },
                      { value: 'fullstack', label: 'Fullstack' },
                      { value: 'design', label: 'Design' },
                      { value: 'pm', label: 'PM' },
                    ].map(opt => (
                      <ChipButton
                        key={opt.value}
                        selected={preferredRole === opt.value}
                        onClick={() => setPreferredRole(opt.value)}
                      >
                        {opt.label}
                      </ChipButton>
                    ))}
                  </Stack>
                </Box>

                {/* GitHub + LinkedIn */}
                <Stack direction="row" gap={4} className="flex-col sm:flex-row">
                  <Box className="flex-1">
                    <label className={labelClass}>GitHub</label>
                    <input
                      type="text"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className={inputClass}
                    />
                  </Box>
                  <Box className="flex-1">
                    <label className={labelClass}>LinkedIn</label>
                    <input
                      type="text"
                      value={linkedIn}
                      onChange={e => setLinkedIn(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </Box>
                </Stack>
              </Stack>
            </GlassSurface>

            {/* === SECTION: Tým === */}
            <GlassSurface className="p-8">
              <h3 className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  3
                </span>
                Tým a motivace
              </h3>
              <Stack direction="col" gap={4}>
                {/* Team preference */}
                <Box>
                  <label className={labelClass}>Týmová preference</label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {[
                      { value: 'solo', label: 'Solo' },
                      { value: 'have-team', label: 'Mám tým' },
                      { value: 'looking-for-team', label: 'Hledám tým' },
                    ].map(opt => (
                      <ChipButton
                        key={opt.value}
                        selected={teamPreference === opt.value}
                        onClick={() => setTeamPreference(opt.value)}
                      >
                        {opt.label}
                      </ChipButton>
                    ))}
                  </Stack>
                </Box>

                {/* Team name (conditional) */}
                {teamPreference === 'have-team' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Box>
                      <label className={labelClass}>Název týmu</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Název vašeho týmu"
                        className={inputClass}
                      />
                    </Box>
                  </motion.div>
                )}

                {/* Motivation */}
                <Box>
                  <label className={labelClass}>Motivace</label>
                  <textarea
                    value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    placeholder="Proč se chceš zúčastnit? Co tě motivuje?"
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-gray-500 text-xs mt-1">{motivation.length}/500</p>
                </Box>
              </Stack>
            </GlassSurface>

            {/* === SECTION: Logistika === */}
            <GlassSurface className="p-8">
              <h3 className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  4
                </span>
                Logistika
              </h3>
              <Stack direction="col" gap={4}>
                {/* T-shirt size */}
                <Box>
                  <label className={labelClass}>Velikost trička</label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <ChipButton
                        key={size}
                        selected={tshirtSize === size}
                        onClick={() => setTshirtSize(size)}
                      >
                        {size}
                      </ChipButton>
                    ))}
                  </Stack>
                </Box>

                {/* Dietary restrictions */}
                <Box>
                  <label className={labelClass}>Stravovací omezení</label>
                  <input
                    type="text"
                    value={dietaryRestrictions}
                    onChange={e => setDietaryRestrictions(e.target.value)}
                    placeholder="Vegetarián, vegan, bezlepková dieta..."
                    className={inputClass}
                  />
                </Box>

                {/* Special needs */}
                <Box>
                  <label className={labelClass}>Speciální potřeby / přístupnost</label>
                  <input
                    type="text"
                    value={specialNeeds}
                    onChange={e => setSpecialNeeds(e.target.value)}
                    placeholder="Bezbariérový přístup, tichá místnost..."
                    className={inputClass}
                  />
                </Box>
              </Stack>
            </GlassSurface>

            {/* === SECTION: Závěr === */}
            <GlassSurface className="p-8">
              <h3 className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  5
                </span>
                Závěr
              </h3>
              <Stack direction="col" gap={4}>
                {/* How did you hear */}
                <Box>
                  <label className={labelClass}>Jak ses o hackathonu dozvěděl/a?</label>
                  <Stack direction="row" gap={3} className="flex-wrap">
                    {[
                      { value: 'social', label: 'Sociální sítě' },
                      { value: 'school', label: 'Škola' },
                      { value: 'friend', label: 'Kamarád' },
                      { value: 'other', label: 'Jinak' },
                    ].map(opt => (
                      <ChipButton
                        key={opt.value}
                        selected={howDidYouHear === opt.value}
                        onClick={() => setHowDidYouHear(opt.value)}
                      >
                        {opt.label}
                      </ChipButton>
                    ))}
                  </Stack>
                </Box>

                {/* GDPR consent */}
                <Box>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gdprConsent}
                      onChange={e => setGdprConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">
                      Souhlasím se zpracováním osobních údajů pro účely organizace hackathonu v
                      souladu s GDPR. <span className="text-red-400">*</span>
                    </span>
                  </label>
                  {fieldErrors.gdprConsent && (
                    <p className={errorClass}>{fieldErrors.gdprConsent}</p>
                  )}
                </Box>

                {/* Error message */}
                {error && (
                  <Box className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">{error}</Box>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    hackathons.length === 0 ||
                    !hackathonId ||
                    !experience ||
                    !gdprConsent
                  }
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Odesílání...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Odeslat přihlášku
                    </>
                  )}
                </Button>
              </Stack>
            </GlassSurface>
          </Stack>
        </form>
      </motion.div>
    </UnifiedPageLayout>
  )
}
