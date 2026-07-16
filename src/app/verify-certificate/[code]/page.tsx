import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Award, CheckCircle, Calendar, Hash, User } from 'lucide-react'
import { PublicPageLayout } from '@/components/layout/PublicPageLayout'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { code } = await params

  const certificate = await prisma.certificate.findUnique({
    where: { uniqueCode: code },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  })

  if (!certificate) {
    notFound()
  }

  return (
    <PublicPageLayout maxWidth="4xl" contentClassName="flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Success badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Ověřený certifikát</span>
          </div>
        </div>

        {/* Certificate card */}
        <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-2xl p-8 border border-indigo-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-1">CERTIFIKÁT</h1>
            <p className="text-indigo-300">Učebnice programování AI</p>
          </div>

          {/* Certificate details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <User className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm text-gray-500">Absolvent</div>
                <div className="font-medium text-white">{certificate.userName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm text-gray-500">Datum vydání</div>
                <div className="font-medium text-white">
                  {certificate.completedAt.toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <Hash className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-sm text-gray-500">Číslo certifikátu</div>
                <div className="font-mono text-indigo-400">{certificate.uniqueCode}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-indigo-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{certificate.totalChapters}</div>
              <div className="text-sm text-gray-400">kapitol</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {certificate.totalXP.toLocaleString('cs-CZ')}
              </div>
              <div className="text-sm text-gray-400">XP bodů</div>
            </div>
          </div>

          {/* Course level */}
          <div className="mt-6 text-center">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                certificate.courseLevel === 'advanced'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {certificate.courseLevel === 'advanced' ? '🎓 Pokročilý kurz' : '📚 Základní kurz'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Tento certifikát byl vydán platformou</p>
          <p className="text-indigo-400 font-medium">Učebnice programování AI</p>
        </div>
      </div>
    </PublicPageLayout>
  )
}
