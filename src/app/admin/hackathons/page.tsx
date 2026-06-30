'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  theme: string
  startDate: string
  endDate: string
  status: string
  maxTeamSize: number
  registrationDeadline: string
  stats: {
    teams: number
    projects: number
  }
}

export default function HackathonsManagement() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchHackathons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/hackathons?${params}`)
      const data = await res.json()
      setHackathons(data.hackathons)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchHackathons()
  }, [fetchHackathons])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchHackathons()
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm('Opravdu chcete smazat tento hackathon? Všechny týmy a projekty budou také smazány.')
    )
      return

    try {
      const res = await fetch(`/api/admin/hackathons/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchHackathons()
      } else {
        alert('Nepodařilo se smazat hackathon')
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      alert('Nepodařilo se smazat hackathon')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nadcházející' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Probíhá' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Ukončeno' },
    }
    const badge = badges[status] ?? badges.upcoming!
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Správa hackathonů</h1>
        <Link
          href="/admin/hackathons/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + Nový hackathon
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat hackathony..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hledat
              </button>
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Všechny stavy</option>
            <option value="upcoming">Nadcházející</option>
            <option value="active">Probíhající</option>
            <option value="completed">Ukončené</option>
          </select>
        </div>
      </div>

      {/* Hackathons Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Načítání...</div>
        ) : hackathons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Žádné hackathony nenalezeny</p>
            <Link
              href="/admin/hackathons/new"
              className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              Vytvořit první hackathon
            </Link>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Název
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Týmy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projekty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hackathons.map(hackathon => (
                  <tr key={hackathon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hackathon.title}</div>
                      <div className="text-sm text-gray-500">{hackathon.theme}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registrace do: {formatDate(hackathon.registrationDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(hackathon.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hackathon.stats.teams}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hackathon.stats.projects}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/hackathons/${hackathon.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/admin/hackathons/${hackathon.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Upravit
                      </Link>
                      <button
                        onClick={() => handleDelete(hackathon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Předchozí
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Další
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Stránka <span className="font-medium">{page}</span> z{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Předchozí
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Další
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
