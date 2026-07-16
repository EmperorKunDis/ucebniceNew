'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Menu, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Uživatelé' },
  { href: '/admin/chapters', label: 'Kapitoly' },
  { href: '/admin/achievements', label: 'Úspěchy' },
  { href: '/admin/analytics', label: 'Analytika' },
  { href: '/admin/hackathons', label: 'Hackathony' },
  { href: '/admin/leagues', label: 'Ligy' },
  { href: '/admin/quests', label: 'Úkoly' },
  { href: '/admin/shop', label: 'Obchod' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileNavOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileNavOpen])

  const renderNavLink = (item: (typeof ADMIN_NAV_ITEMS)[number]) => {
    const isActive =
      item.href === '/admin'
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/30'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_32rem),linear-gradient(180deg,#060914_0%,#0b1020_100%)] text-gray-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex shrink-0 items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="hidden font-display text-base font-bold sm:inline">Administrace</span>
          </Link>

          <nav
            aria-label="Administrátorská navigace"
            className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex"
          >
            {ADMIN_NAV_ITEMS.map(renderNavLink)}
          </nav>

          <Link
            href="/dashboard"
            className="ml-auto hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zpět do kurzu
          </Link>

          <button
            type="button"
            onClick={() => setMobileNavOpen(open => !open)}
            className="ml-auto rounded-xl p-2 text-gray-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-navigation"
            aria-label={
              mobileNavOpen
                ? 'Zavřít administrátorskou navigaci'
                : 'Otevřít administrátorskou navigaci'
            }
          >
            {mobileNavOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <nav
            id="admin-mobile-navigation"
            aria-label="Mobilní administrátorská navigace"
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-gray-950 p-4 lg:hidden"
          >
            <div className="mx-auto grid max-w-3xl gap-2 sm:grid-cols-2">
              {ADMIN_NAV_ITEMS.map(renderNavLink)}
              <Link
                href="/dashboard"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-gray-200 sm:col-span-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Zpět do kurzu
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  )
}
