'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BookOpen, LayoutDashboard, Menu, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Footer } from './footer'

const PUBLIC_NAV_ITEMS = [
  { href: '/', label: 'Domů' },
  { href: '/dashboard', label: 'Kurz' },
  { href: '/arena', label: 'Apex Aréna' },
  { href: '/leaderboard', label: 'Žebříček' },
  { href: '/achievements', label: 'Úspěchy' },
]

interface PublicShellProps {
  children: React.ReactNode
  className?: string
  showNavigation?: boolean
  showFooter?: boolean
}

export function PublicShell({
  children,
  className,
  showNavigation = true,
  showFooter = true,
}: PublicShellProps) {
  const pathname = usePathname()
  const { status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  const renderLink = (item: (typeof PUBLIC_NAV_ITEMS)[number], mobile = false) => {
    const isActive =
      item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`)

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
          isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white',
          mobile && 'block w-full px-4 py-3'
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30rem),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_32rem),linear-gradient(180deg,#060914_0%,#0b1020_55%,#060914_100%)] text-gray-100',
        className
      )}
    >
      <a
        href="#public-main-content"
        className="sr-only z-[100] rounded-lg bg-white px-4 py-2 text-gray-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Přeskočit na obsah
      </a>

      {showNavigation && (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3" aria-label="Učebnice AI – domů">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-950/40">
                <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Učebnice AI
              </span>
            </Link>

            <nav aria-label="Hlavní navigace" className="hidden items-center gap-1 lg:flex">
              {PUBLIC_NAV_ITEMS.map(item => renderLink(item))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-pink-500"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Otevřít kurz
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Přihlásit se
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-pink-500"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Začít zdarma
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              className="rounded-xl p-2 text-gray-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-navigation"
              aria-label={mobileMenuOpen ? 'Zavřít hlavní navigaci' : 'Otevřít hlavní navigaci'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav
              id="public-mobile-navigation"
              aria-label="Mobilní navigace"
              className="border-t border-white/10 bg-gray-950 px-4 py-4 lg:hidden"
            >
              <div className="mx-auto max-w-7xl space-y-1">
                {PUBLIC_NAV_ITEMS.map(item => renderLink(item, true))}
                <div className="my-3 h-px bg-white/10" />
                <Link
                  href={isAuthenticated ? '/dashboard' : '/auth/signin'}
                  className="block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  {isAuthenticated ? 'Otevřít kurz' : 'Přihlásit se'}
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/auth/signup"
                    className="block rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-gray-100"
                  >
                    Začít zdarma
                  </Link>
                )}
              </div>
            </nav>
          )}
        </header>
      )}

      <div id="public-main-content" className="flex flex-1 flex-col">
        {children}
      </div>

      {showFooter && <Footer />}
    </div>
  )
}
