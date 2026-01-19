'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  avatar?: string | null
}

interface HackathonFormData {
  title: string
  description: string
  theme: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxTeamSize: number
  status: 'upcoming' | 'active' | 'completed'
  bannerImage: string
  prizes: Prize[]
  judges: Judge[]
  sponsors: string[]
}

interface HackathonFormProps {
  initialData?: Partial<HackathonFormData>
  hackathonId?: string
  isEditing?: boolean
}

const defaultFormData: HackathonFormData = {
  title: '',
  description: '',
  theme: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  maxTeamSize: 4,
  status: 'upcoming',
  bannerImage: '',
  prizes: [
    { place: 1, title: '1. místo', description: '', value: '' },
    { place: 2, title: '2. místo', description: '', value: '' },
    { place: 3, title: '3. místo', description: '', value: '' },
  ],
  judges: [],
  sponsors: [],
}

export function HackathonForm({ initialData, hackathonId, isEditing = false }: HackathonFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<HackathonFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSponsor, setNewSponsor] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxTeamSize' ? parseInt(value) || 4 : value,
    }))
  }

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) =>
        i === index ? { ...prize, [field]: value } : prize
      ),
    }))
  }

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        { place: prev.prizes.length + 1, title: '', description: '', value: '' },
      ],
    }))
  }

  const removePrize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }))
  }

  const handleJudgeChange = (index: number, field: keyof Judge, value: string) => {
    setFormData(prev => ({
      ...prev,
      judges: prev.judges.map((judge, i) =>
        i === index ? { ...judge, [field]: value } : judge
      ),
    }))
  }

  const addJudge = () => {
    setFormData(prev => ({
      ...prev,
      judges: [...prev.judges, { name: '', title: '', company: '', bio: '' }],
    }))
  }

  const removeJudge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      judges: prev.judges.filter((_, i) => i !== index),
    }))
  }

  const addSponsor = () => {
    if (newSponsor.trim()) {
      setFormData(prev => ({
        ...prev,
        sponsors: [...prev.sponsors, newSponsor.trim()],
      }))
      setNewSponsor('')
    }
  }

  const removeSponsor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditing
        ? `/api/admin/hackathons/${hackathonId}`
        : '/api/admin/hackathons'
      const method = isEditing ? 'PUT' : 'POST'

      // Format dates to ISO
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        bannerImage: formData.bannerImage || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Nepodařilo se uložit hackathon')
      }

      router.push('/admin/hackathons')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Základní informace</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Název *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Téma *
            </label>
            <input
              type="text"
              id="theme"
              name="theme"
              required
              value={formData.theme}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Popis *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700">
              URL banneru (volitelné)
            </label>
            <input
              type="url"
              id="bannerImage"
              name="bannerImage"
              value={formData.bannerImage}
              onChange={handleChange}
              placeholder="https://example.com/banner.jpg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Dates & Config */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Termíny a konfigurace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Datum začátku *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Datum konce *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="registrationDeadline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline registrace *
            </label>
            <input
              type="datetime-local"
              id="registrationDeadline"
              name="registrationDeadline"
              required
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700">
              Max. velikost týmu
            </label>
            <input
              type="number"
              id="maxTeamSize"
              name="maxTeamSize"
              min={1}
              max={10}
              value={formData.maxTeamSize}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Stav
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="upcoming">Nadcházející</option>
              <option value="active">Probíhá</option>
              <option value="completed">Ukončeno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prizes */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Ceny</h2>
          <button
            type="button"
            onClick={addPrize}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            + Přidat cenu
          </button>
        </div>
        <div className="space-y-4">
          {formData.prizes.map((prize, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-gray-700">{prize.place}. místo</span>
                {formData.prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="text-red-600 hover:text-red-500 text-sm"
                  >
                    Odebrat
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Název</label>
                  <input
                    type="text"
                    value={prize.title}
                    onChange={e => handlePrizeChange(index, 'title', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Popis</label>
                  <input
                    type="text"
                    value={prize.description}
                    onChange={e => handlePrizeChange(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hodnota</label>
                  <input
                    type="text"
                    value={prize.value}
                    onChange={e => handlePrizeChange(index, 'value', e.target.value)}
                    placeholder="např. 50 000 Kč"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Judges */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Porota</h2>
          <button
            type="button"
            onClick={addJudge}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            + Přidat porotce
          </button>
        </div>
        {formData.judges.length === 0 ? (
          <p className="text-gray-500 text-sm">Zatím nebyli přidáni žádní porotci</p>
        ) : (
          <div className="space-y-4">
            {formData.judges.map((judge, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-end mb-3">
                  <button
                    type="button"
                    onClick={() => removeJudge(index)}
                    className="text-red-600 hover:text-red-500 text-sm"
                  >
                    Odebrat
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jméno *</label>
                    <input
                      type="text"
                      required
                      value={judge.name}
                      onChange={e => handleJudgeChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pozice *</label>
                    <input
                      type="text"
                      required
                      value={judge.title}
                      onChange={e => handleJudgeChange(index, 'title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Společnost *
                    </label>
                    <input
                      type="text"
                      required
                      value={judge.company}
                      onChange={e => handleJudgeChange(index, 'company', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio *</label>
                    <input
                      type="text"
                      required
                      value={judge.bio}
                      onChange={e => handleJudgeChange(index, 'bio', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sponsors */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sponzoři</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSponsor}
            onChange={e => setNewSponsor(e.target.value)}
            placeholder="Název sponzora"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSponsor())}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addSponsor}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Přidat
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sponsors.map((sponsor, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              {sponsor}
              <button
                type="button"
                onClick={() => removeSponsor(index)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </span>
          ))}
          {formData.sponsors.length === 0 && (
            <p className="text-gray-500 text-sm">Zatím nebyli přidáni žádní sponzoři</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Ukládání...' : isEditing ? 'Uložit změny' : 'Vytvořit hackathon'}
        </button>
      </div>
    </form>
  )
}
