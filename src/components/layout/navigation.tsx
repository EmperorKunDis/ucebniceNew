'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GreySurface } from '@/components/ui/grey-surface'
import { Stack } from '@/components/layout'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/user-store'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  label: string
  href: string
  showWhenAuth?: boolean
  hideWhenAuth?: boolean
}

const navItems: NavItem[] = [
  { label: 'Domů', href: '/' },
  { label: 'Kapitoly', href: '/chapters' },
  { label: 'Apex Aréna', href: '/arena' },
  { label: 'Žebříček', href: '/leaderboard' },
]

export function Navigation() {
  const pathname = usePathname()
  const { username, avatar } = useUserStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAuthenticated = !!username

  const filteredNavItems = navItems.filter(item => {
    if (item.showWhenAuth && !isAuthenticated) return false
    if (item.hideWhenAuth && isAuthenticated) return false
    return true
  })

  return (
    <Box as="nav" className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <Box className="max-w-7xl mx-auto">
        <GreySurface className="px-6 py-4" borderRadius={16}>
          <Stack direction="row" justify="between" align="center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Učebnice
            </Link>

            {/* Desktop navigation */}
            <Stack direction="row" gap={4} align="center" className="hidden lg:flex">
              {filteredNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-300 hover:text-white transition-colors ${
                    pathname === item.href ? 'text-white font-medium' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      username.charAt(0).toUpperCase()
                    )}
                  </Box>
                  <span className="text-white hover:text-gray-300 transition-colors whitespace-nowrap">
                    {username}
                  </span>
                </Link>
              ) : (
                <Stack direction="row" gap={3} align="center">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Přihlásit se</Link>
                  </Button>
                  <Button variant="primary" asChild>
                    <Link href="/onboarding">Začít zdarma</Link>
                  </Button>
                </Stack>
              )}
            </Stack>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </Stack>
        </GreySurface>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <GreySurface className="mt-2 p-4 lg:hidden">
                <Stack direction="col" gap={2}>
                  {filteredNavItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                        pathname === item.href ? 'text-white bg-white/10 font-medium' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Box className="h-px bg-gray-700 my-2" />

                  {isAuthenticated ? (
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        pathname === '/profile'
                          ? 'text-white bg-white/10 font-medium'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={username || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          username.charAt(0).toUpperCase()
                        )}
                      </Box>
                      <span>{username}</span>
                    </Link>
                  ) : (
                    <Stack direction="col" gap={2} className="mx-4">
                      <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Přihlásit se
                        </Button>
                      </Link>
                      <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="primary" className="w-full">
                          Začít zdarma
                        </Button>
                      </Link>
                    </Stack>
                  )}
                </Stack>
              </GreySurface>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}
