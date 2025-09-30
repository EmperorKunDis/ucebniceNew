'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Box, Button, Stack } from '@/components/ui'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validace
    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrace se nezdařila')
      }

      // Po úspěšné registraci přesměrovat na přihlášení
      router.push('/auth/signin?registered=true')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Něco se pokazilo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
                Registrace
              </h1>
              <p className="text-gray-400">
                Vytvořte si účet a začněte se učit
              </p>
            </div>

            {error && (
              <Box className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </Box>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Jméno
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jan Novák"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Uživatelské jméno
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jannovak"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Potvrzení hesla
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
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
                    Registrace...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Zaregistrovat se
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-400">Už máte účet? </span>
              <Link
                href="/auth/signin"
                className="text-blue-400 hover:text-blue-300"
              >
                Přihlaste se
              </Link>
            </div>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}