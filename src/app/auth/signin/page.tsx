'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Box, Button, Stack } from '@/components/ui'
import { Github, Mail, Loader2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Nesprávný email nebo heslo')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Něco se pokazilo. Zkuste to znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <Box className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Box className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na hlavní stránku
        </Link>

        <Box className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <Stack className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Přihlášení
              </h1>
              <p className="text-gray-400">
                Vítejte zpět! Přihlaste se ke svému účtu
              </p>
            </div>

            {error && (
              <Box className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </Box>
            )}

            <Stack className="space-y-4">
              <Button
                onClick={() => handleOAuthSignIn('google')}
                variant="secondary"
                className="w-full justify-center gap-3"
                disabled={isLoading}
              >
                <Image
                  src="/images/google-icon.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Pokračovat s Google
              </Button>

              <Button
                onClick={() => handleOAuthSignIn('github')}
                variant="secondary"
                className="w-full justify-center gap-3"
                disabled={isLoading}
              >
                <Github className="w-5 h-5" />
                Pokračovat s GitHub
              </Button>
            </Stack>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">nebo</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="vas@email.cz"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Heslo
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Přihlašování...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Přihlásit se emailem
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-400">Nemáte účet? </span>
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300"
              >
                Zaregistrujte se
              </Link>
            </div>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}