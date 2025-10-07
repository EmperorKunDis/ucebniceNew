'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface UnifiedPageLayoutProps {
  children: React.ReactNode
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl'
  showNav?: boolean
  className?: string
  contentClassName?: string
}

const NAV_LINKS = [
  { href: '/chapters', label: 'Kapitoly' },
  { href: '/profile', label: 'Profil' },
  { href: '/achievements', label: 'Úspěchy' },
  { href: '/arena', label: 'Apex Aréna' },
  { href: '/leaderboard', label: 'Žebříček' },
]

export function UnifiedPageLayout({
  children,
  maxWidth = '4xl',
  showNav = true,
  className,
  contentClassName,
}: UnifiedPageLayoutProps) {
  const pathname = usePathname()

  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900',
        className
      )}
    >
      {/* Navigation Bar */}
      {showNav && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
              >
                Učebnice AI
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex gap-6">
                {NAV_LINKS.map(link => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-sm font-medium transition-all duration-200',
                        isActive ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-gray-300 hover:text-purple-300" aria-label="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={cn(maxWidthClasses[maxWidth], 'mx-auto px-4 py-12')}>
        <div className={cn('space-y-8', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}
