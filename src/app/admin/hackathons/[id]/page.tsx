'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface TeamMember {
  id: string
  role: string
  skills: string[]
  user: {
    id: string
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
}

interface Team {
  id: string
  name: string
  createdAt: string
  members: TeamMember[]
  project: {
    id: string
    title: string
    submittedAt: string
    score: number | null
    placement: number | null
  } | null
}

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  startDate: string
  endDate: string
  status: string
  maxTeamSize: number
  registrationDeadline: string
  bannerImage: string | null
  prizes: { place: number; title: string; description: string; value: string }[]
  judges: { name: string; title: string; company: string; bio: string }[]
  sponsors: string[]
  teams: Team[]
}

export default function HackathonDetailPage() {
  const params = useParams()
  const hackathonId = params.id as string

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const res = await fetch(`/api/admin/hackathons/${hackathonId}`)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nadcházející' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Probíhá' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Ukončeno' },
    }
    const badge = badges[status] || badges.upcoming
    return (
      <span
        className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (error || !hackathon) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-red-600">{error || 'Hackathon nenalezen'}</div>
        <div className="text-center mt-4">
          <Link href="/admin/hackathons" className="text-indigo-600 hover:text-indigo-500">
            Zpět na seznam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <Link
          href="/admin/hackathons"
          className="text-indigo-600 hover:text-indigo-500 text-sm"
        >
          &larr; Zpět na seznam
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
            <p className="text-gray-500 mt-1">{hackathon.theme}</p>
          </div>
          <div className="flex gap-2 items-center">
            {getStatusBadge(hackathon.status)}
            <Link
              href={`/admin/hackathons/${hackathon.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Upravit
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Týmy</p>
          <p className="text-2xl font-bold text-gray-900">{hackathon.teams.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Účastníci</p>
          <p className="text-2xl font-bold text-gray-900">
            {hackathon.teams.reduce((sum, team) => sum + team.members.length, 0)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Projekty</p>
          <p className="text-2xl font-bold text-gray-900">
            {hackathon.teams.filter(t => t.project).length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Max. tým</p>
          <p className="text-2xl font-bold text-gray-900">{hackathon.maxTeamSize} členů</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informace</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Popis</p>
              <p className="text-gray-900">{hackathon.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Začátek</p>
                <p className="text-gray-900">{formatDate(hackathon.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Konec</p>
                <p className="text-gray-900">{formatDate(hackathon.endDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline registrace</p>
              <p className="text-gray-900">{formatDate(hackathon.registrationDeadline)}</p>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ceny</h2>
          <div className="space-y-3">
            {hackathon.prizes.map((prize, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{prize.title}</p>
                  <p className="text-sm text-gray-500">{prize.description}</p>
                </div>
                <p className="font-bold text-indigo-600">{prize.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Judges */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Porota</h2>
          {hackathon.judges.length === 0 ? (
            <p className="text-gray-500">Zatím nebyli přidáni žádní porotci</p>
          ) : (
            <div className="space-y-3">
              {hackathon.judges.map((judge, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-gray-900">{judge.name}</p>
                  <p className="text-sm text-gray-600">
                    {judge.title} @ {judge.company}
                  </p>
                  <p className="text-sm text-gray-500">{judge.bio}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sponsors */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sponzoři</h2>
          {hackathon.sponsors.length === 0 ? (
            <p className="text-gray-500">Zatím nebyli přidáni žádní sponzoři</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hackathon.sponsors.map((sponsor, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {sponsor}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Týmy ({hackathon.teams.length})
        </h2>
        {hackathon.teams.length === 0 ? (
          <p className="text-gray-500">Zatím se nezaregistroval žádný tým</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tým
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Členové
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hodnocení
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hackathon.teams.map(team => (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-500">
                        Vytvořeno: {formatDate(team.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {team.members.map(member => (
                          <span
                            key={member.id}
                            className={`px-2 py-1 text-xs rounded-full ${
                              member.role === 'leader'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title={member.user.email || ''}
                          >
                            {member.user.name || member.user.username || 'Anonym'}
                            {member.role === 'leader' && ' (Leader)'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.project ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.project.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Odevzdáno: {formatDate(team.project.submittedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Neodevzdáno</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.project?.score !== null && team.project?.score !== undefined ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.project.score} bodů
                          </div>
                          {team.project.placement && (
                            <div className="text-sm text-indigo-600">
                              {team.project.placement}. místo
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
