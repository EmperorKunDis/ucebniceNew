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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

      <Box className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na hlavní stránku
        </Link>

        <div className="relative">
          {/* Glass effect container */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10" />

          <div className="relative p-8">
            <Stack className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Přihlášení
                </h1>
                <p className="text-gray-300">
                  Vítejte zpět! Přihlaste se ke svému účtu
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Stack className="space-y-4">
                <Button
                  onClick={() => handleOAuthSignIn('google')}
                  variant="secondary"
                  className="w-full justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10"
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
                  className="w-full justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10"
                  disabled={isLoading}
                >
                  <Github className="w-5 h-5" />
                  Pokračovat s GitHub
                </Button>
              </Stack>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-300">nebo</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="vas@email.cz"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Heslo
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
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
                <span className="text-gray-300">Nemáte účet? </span>
                <Link
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Zaregistrujte se
                </Link>
              </div>
            </Stack>
          </div>
        </div>
      </Box>
    </div>
  )
}