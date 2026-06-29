import Link from 'next/link'
import { HackathonForm } from '../components/hackathon-form'

export default function NewHackathonPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <Link href="/admin/hackathons" className="text-indigo-600 hover:text-indigo-500 text-sm">
          &larr; Zpět na seznam
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Nový hackathon</h1>
      </div>

      <HackathonForm />
    </div>
  )
}
