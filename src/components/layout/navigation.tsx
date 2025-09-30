'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GlassSurface } from '@/components/ui/glass-surface'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { ElectricBorder } from '@/components/ui/electric-border'
import { useUserStore } from '@/store/user-store'
import { Menu, X, ChevronDown } from 'lucide-react'
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
  { label: 'Lekce', href: '/lessons' },
  { label: 'Kapitoly', href: '/chapters' },
  { label: 'Dashboard', href: '/dashboard', showWhenAuth: true },
  { label: 'Apex Aréna', href: '/arena' },
  { label: 'Profil', href: '/profile', showWhenAuth: true },
]

export function Navigation() {
  const pathname = usePathname()
  const { username } = useUserStore()
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
        <GlassSurface className="px-6 py-4" borderRadius={16} blur={20} backgroundOpacity={0.02} opacity={0.95}>
          <Stack direction="row" justify="between" align="center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Učebnice AI
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
                <Stack direction="row" gap={2} align="center" className="px-3 py-1 bg-white/10 rounded-full">
                  <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {username.charAt(0).toUpperCase()}
                  </Box>
                  <span className="text-white">{username}</span>
                </Stack>
              ) : (
                <ElectricBorder className="rounded-lg">
                  <Button
                    variant="primary"
                    asChild
                  >
                    <Link href="/onboarding">
                      Začít zdarma
                    </Link>
                  </Button>
                </ElectricBorder>
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
        </GlassSurface>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <GlassSurface className="mt-2 p-4 lg:hidden">
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
                    <Stack direction="row" gap={2} align="center" className="px-4 py-2">
                      <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {username.charAt(0).toUpperCase()}
                      </Box>
                      <span className="text-white">{username}</span>
                    </Stack>
                  ) : (
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4"
                    >
                      <Button variant="primary" className="w-full">
                        Začít zdarma
                      </Button>
                    </Link>
                  )}
                </Stack>
              </GlassSurface>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )
}