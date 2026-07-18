'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BookOpen, List, Sparkle, SquaresFour, X } from '@phosphor-icons/react'
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
          'public-focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-[#151724] text-white'
            : 'text-[#b8bfd2] hover:bg-[#151724] hover:text-white',
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
        'public-shell flex min-h-screen flex-col bg-[#090a10] text-[#f8f8fc]',
        className
      )}
    >
      <a
        href="#public-main-content"
        className="public-focus-ring sr-only z-[100] rounded-lg bg-white px-4 py-2 text-gray-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Přeskočit na obsah
      </a>

      {showNavigation && (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090a10]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="public-focus-ring flex min-h-11 items-center gap-3 rounded-xl"
              aria-label="Učebnice AI – domů"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#44d8ed_0%,#5d9cff_35%,#b371ff_70%,#ed6be8_100%)] shadow-lg shadow-purple-950/40">
                <Sparkle className="h-5 w-5 text-white" weight="fill" aria-hidden="true" />
              </span>
              <span className="public-display text-lg font-bold tracking-tight text-white">
                Učebnice AI
              </span>
            </Link>

            <nav
              aria-label="Hlavní navigace"
              className="hidden items-center gap-1 min-[900px]:flex"
            >
              {PUBLIC_NAV_ITEMS.map(item => renderLink(item))}
            </nav>

            <div className="hidden items-center gap-2 min-[900px]:flex">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="public-focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6747ff] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#6747ff]/20 transition hover:bg-[#846bff]"
                >
                  <SquaresFour className="h-4 w-4" aria-hidden="true" />
                  Otevřít kurz
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="public-focus-ring inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-semibold text-[#b8bfd2] transition hover:bg-[#151724] hover:text-white"
                  >
                    Přihlásit se
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="public-focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6747ff] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#6747ff]/20 transition hover:bg-[#846bff]"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Začít kurz
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              className="public-focus-ring flex h-11 w-11 items-center justify-center rounded-xl p-2 text-[#b8bfd2] transition hover:bg-[#151724] hover:text-white min-[900px]:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-navigation"
              aria-label={mobileMenuOpen ? 'Zavřít hlavní navigaci' : 'Otevřít hlavní navigaci'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <List className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav
              id="public-mobile-navigation"
              aria-label="Mobilní navigace"
              className="border-t border-white/10 bg-[#090a10] px-4 py-4 min-[900px]:hidden"
            >
              <div className="mx-auto max-w-7xl space-y-1">
                {PUBLIC_NAV_ITEMS.map(item => renderLink(item, true))}
                <div className="my-3 h-px bg-white/10" />
                <Link
                  href={isAuthenticated ? '/dashboard' : '/auth/signin'}
                  className="public-focus-ring block rounded-xl bg-[#6747ff] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#846bff]"
                >
                  {isAuthenticated ? 'Otevřít kurz' : 'Přihlásit se'}
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/auth/signup"
                    className="public-focus-ring block rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-gray-100"
                  >
                    Začít kurz
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
