'use client'

import { Lightning } from '@/components/ui/lightning'
import { Navigation } from '@/components/layout/navigation'
import { Box } from '@/components/layout'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  showLightning?: boolean
  showNavigation?: boolean
  contentClassName?: string
}

export function PageLayout({
  children,
  className,
  showLightning = true,
  showNavigation = true,
  contentClassName,
}: PageLayoutProps) {
  return (
    <Box className={cn('relative min-h-screen bg-black', className)}>
      {showLightning && <Lightning className="fixed inset-0 z-0" />}
      {showNavigation && <Navigation />}
      <Box
        as="main"
        className={cn(
          'relative z-10 pt-[20vh] pb-16 px-4 sm:px-6 lg:px-8',
          contentClassName
        )}
      >
        <Box className="max-w-7xl mx-auto">{children}</Box>
      </Box>
    </Box>
  )
}
