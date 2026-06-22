'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`)
        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email byl úspěšně ověřen!')
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Ověření se nezdařilo')
        }
      } catch {
        setStatus('error')
        setMessage('Něco se pokazilo. Zkus to prosím znovu.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ověřuji email...</h1>
          <p className="text-gray-400">Počkej prosím chvilku</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Email ověřen! 🎉</h1>
          <p className="text-gray-400 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-4">Přesměrování na dashboard...</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
              Přejít na dashboard
            </Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ověření selhalo</h1>
          <p className="text-gray-400 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
                Přihlásit se
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Můžeš si nechat poslat nový ověřovací email v nastavení účtu.
            </p>
          </div>
        </>
      )}

      {status === 'no-token' && (
        <>
          <Mail className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ověření emailu</h1>
          <p className="text-gray-400 mb-6">
            Zkontroluj svou emailovou schránku a klikni na ověřovací odkaz.
          </p>
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-white mb-2">Nepřišel email?</h3>
            <ul className="text-sm text-gray-400 text-left space-y-1">
              <li>• Zkontroluj složku spam/nevyžádaná pošta</li>
              <li>• Počkej několik minut</li>
              <li>• Zkus si nechat poslat nový email</li>
            </ul>
          </div>
          <Link href="/auth/signin">
            <Button variant="secondary" className="w-full">
              Zpět na přihlášení
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center">
      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Načítání...</h1>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
