'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Button } from '@/components/ui/button'
import { Stack, Box } from '@/components/layout'
import { Github, Mail, Loader2, ArrowLeft } from 'lucide-react'
import { signInSchema } from '@/lib/validation-schemas'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    // Validate form data
    const validation = signInSchema.safeParse({ email: email.trim(), password })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      for (const err of validation.error.issues) {
        if (err.path.length > 0) {
          const key = err.path[0]
          if (key !== undefined) {
            errors[key.toString()] = err.message
          }
        }
      }
      setValidationErrors(errors)
      toast.error('Opravte prosím chyby ve formuláři')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Nesprávný email nebo heslo')
        toast.error('Nesprávný email nebo heslo')
      } else {
        toast.success('Přihlášení úspěšné!')
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Něco se pokazilo. Zkuste to znovu.')
      toast.error('Něco se pokazilo. Zkuste to znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    // OAuth providers require redirect to work - NextAuth handles the full OAuth flow
    // This will redirect to the OAuth provider's authorization page, then back to callback
    signIn(provider, {
      callbackUrl: '/dashboard',
      // redirect defaults to true for OAuth - redirects to provider's auth page
    })

    // Note: With redirect:true (default), execution continues but page will navigate
    // We keep loading state true until redirect happens or error occurs
    // If provider is not configured, NextAuth will redirect to error page with query params
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <Box className="flex items-center justify-center min-h-[80vh]">
        <Box className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zpět na hlavní stránku
            </Link>

            <GlassSurface className="p-8">
              <Stack direction="col" gap={6}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Přihlášení
                  </h1>
                  <p className="text-gray-300">Vítejte zpět! Přihlaste se ke svému účtu</p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg p-4"
                  >
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Stack direction="col" gap={4}>
                    <Button
                      onClick={() => handleOAuthSignIn('google')}
                      variant="secondary"
                      className="w-full justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10"
                      disabled={isLoading}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900"
                      >
                        G
                      </span>
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
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-gray-300">nebo</span>
                  </div>
                </div>

                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value)
                        if (validationErrors.email) {
                          setValidationErrors(prev => {
                            const { email, ...rest } = prev
                            return rest
                          })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        validationErrors.email
                          ? 'border-red-500/50 focus:ring-red-500'
                          : 'border-white/20'
                      }`}
                      placeholder="vas@email.cz"
                      required
                      disabled={isLoading}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                    )}
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
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value)
                        if (validationErrors.password) {
                          setValidationErrors(prev => {
                            const { password, ...rest } = prev
                            return rest
                          })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        validationErrors.password
                          ? 'border-red-500/50 focus:ring-red-500'
                          : 'border-white/20'
                      }`}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
                    )}
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
                </motion.form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center text-sm"
                >
                  <span className="text-gray-300">Nemáte účet? </span>
                  <Link
                    href="/auth/signup"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Zaregistrujte se
                  </Link>
                </motion.div>
              </Stack>
            </GlassSurface>
          </motion.div>
        </Box>
      </Box>
    </main>
  )
}
