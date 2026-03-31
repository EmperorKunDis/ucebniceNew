'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Award, Download, ExternalLink, Lock, CheckCircle } from 'lucide-react'

interface CertificateData {
  eligible: boolean
  reason?: string
  completedChapters: number
  requiredChapters: number
  certificate?: {
    id: string
    uniqueCode: string
    completedAt: string
    downloadUrl: string
    verificationUrl: string
  }
}

export default function CertificatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [data, setData] = useState<CertificateData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCertificate()
  }, [])

  async function fetchCertificate() {
    try {
      const res = await fetch('/api/certificate')
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Chyba při načítání')
        return
      }

      setData(result)
    } catch {
      setError('Nepodařilo se načíst data')
    } finally {
      setLoading(false)
    }
  }

  async function generateCertificate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
      })
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Chyba při generování')
        return
      }

      // Refresh data
      fetchCertificate()
    } catch {
      setError('Nepodařilo se vygenerovat certifikát')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  // User has certificate
  if (data?.certificate) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 bg-gray-800/50">
          <div className="text-center mb-8">
            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Tvůj certifikát</h1>
            <p className="text-gray-400">
              Vydáno: {new Date(data.certificate.completedAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>

          {/* Certificate preview */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-8 mb-6 border border-indigo-500/30">
            <div className="text-center">
              <div className="text-sm text-indigo-400 mb-2">CERTIFIKÁT</div>
              <div className="text-2xl font-bold text-white mb-4">Učebnice programování AI</div>
              <div className="text-gray-400 mb-4">
                Číslo:{' '}
                <span className="font-mono text-indigo-400">{data.certificate.uniqueCode}</span>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            </div>
          </div>

          <div className="space-y-3">
            <a href={data.certificate.downloadUrl} download className="block">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
                <Download className="w-4 h-4 mr-2" /> Stáhnout PDF
              </Button>
            </a>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.open(data.certificate?.verificationUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Ověřit certifikát
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Sdílej svůj úspěch</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const text = `Právě jsem získal certifikát z Učebnice programování AI! 🎓`
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                    '_blank'
                  )
                }}
              >
                Twitter
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const url = data.certificate?.verificationUrl
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || '')}`,
                    '_blank'
                  )
                }}
              >
                LinkedIn
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // User is not eligible
  if (!data?.eligible) {
    const progress = Math.round(
      ((data?.completedChapters || 0) / (data?.requiredChapters || 40)) * 100
    )

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 bg-gray-800/50">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Certifikát zatím nedostupný</h1>
            <p className="text-gray-400">{data?.reason}</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Tvůj pokrok</span>
              <span>
                {data?.completedChapters}/{data?.requiredChapters} kapitol
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-2xl font-bold text-white mt-2">{progress}%</div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Pokračovat v učení
            </Button>

            {(data?.completedChapters || 0) >= 40 && (
              <Button
                onClick={() => router.push('/final-test')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                <Award className="w-4 h-4 mr-2" /> Složit finální test
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Eligible but no certificate yet - generate
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8 bg-gray-800/50">
        <div className="text-center mb-8">
          <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-2">Gratulujeme! 🎉</h1>
          <p className="text-gray-400">Splnil jsi všechny požadavky pro získání certifikátu!</p>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">{error}</div>}

        <Button
          onClick={generateCertificate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generuji certifikát...
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" /> Vygenerovat certifikát
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}
