'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { HackathonForm } from '../../components/hackathon-form'

interface Hackathon {
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
  prizes: { place: number; title: string; description: string; value: string }[]
  judges: { id?: string; name: string; title: string; company: string; bio: string }[]
  sponsors: string[]
}

export default function EditHackathonPage() {
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

  // Convert ISO dates to datetime-local format
  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toISOString().slice(0, 16)
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

  const initialData = {
    title: hackathon.title,
    description: hackathon.description,
    theme: hackathon.theme,
    startDate: formatDateForInput(hackathon.startDate),
    endDate: formatDateForInput(hackathon.endDate),
    registrationDeadline: formatDateForInput(hackathon.registrationDeadline),
    maxTeamSize: hackathon.maxTeamSize,
    status: hackathon.status,
    bannerImage: hackathon.bannerImage || '',
    prizes: hackathon.prizes,
    judges: hackathon.judges,
    sponsors: hackathon.sponsors,
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/admin/hackathons/${hackathonId}`}
          className="text-indigo-600 hover:text-indigo-500 text-sm"
        >
          &larr; Zpět na detail
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Upravit hackathon</h1>
        <p className="text-gray-500">{hackathon.title}</p>
      </div>

      <HackathonForm initialData={initialData} hackathonId={hackathonId} isEditing />
    </div>
  )
}
