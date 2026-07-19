import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/#obsah', label: 'Obsah kurzu' },
  { href: '/auth/signin', label: 'Přihlášení' },
  { href: '/arena', label: 'Apex Aréna' },
  { href: '/leaderboard', label: 'Žebříček' },
  { href: '/achievements', label: 'Úspěchy' },
]

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-[#090a10] px-4 pb-8 pt-12 text-[#939bae] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-9 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Link
              href="/"
              className="public-focus-ring inline-flex min-h-11 items-center gap-3 rounded-xl text-[#f8f8fc]"
              aria-label="Učebnice AI – zpět na úvod"
            >
              <Image
                src="/ucebnice-logo.png"
                alt=""
                width={47}
                height={36}
                className="h-9 w-auto"
              />
              <span className="public-display text-lg font-extrabold tracking-[-0.04em]">
                Učebnice AI
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#939bae]">
              Kurz AI a programování s jasnou cestou od základů až po vlastní projekty.
            </p>
          </div>

          <nav aria-label="Odkazy v patičce" className="flex max-w-2xl flex-wrap gap-x-2 gap-y-1">
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="public-focus-ring inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#b8bfd2] transition hover:bg-[#151724] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="py-7">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#939bae]">
            Partneři projektu
          </p>
          <div className="rounded-2xl border border-white/10 bg-[#10111a] p-4 shadow-lg sm:p-6">
            <div className="relative aspect-[13.79/1] w-full">
              <Image
                src="/images/LogaUcebnice.png"
                alt="Loga partnerů Učebnice AI"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>

        <p className="border-t border-white/10 pt-6 text-xs text-[#939bae]">
          © {new Date().getFullYear()} Učebnice AI. Vzdělávání, které má jasný směr.
        </p>
      </div>
    </footer>
  )
}
