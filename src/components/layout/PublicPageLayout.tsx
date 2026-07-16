import { cn } from '@/lib/utils'
import { PublicShell } from './PublicShell'

interface PublicPageLayoutProps {
  children: React.ReactNode
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'none'
  showNav?: boolean
  showFooter?: boolean
  className?: string
  contentClassName?: string
}

const MAX_WIDTH_CLASSES = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  none: 'max-w-none',
}

export function PublicPageLayout({
  children,
  maxWidth = '4xl',
  showNav = true,
  showFooter = true,
  className,
  contentClassName,
}: PublicPageLayoutProps) {
  return (
    <PublicShell showNavigation={showNav} showFooter={showFooter} className={className}>
      <main
        className={cn(
          'mx-auto w-full flex-1 space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8',
          MAX_WIDTH_CLASSES[maxWidth],
          contentClassName
        )}
      >
        {children}
      </main>
    </PublicShell>
  )
}
