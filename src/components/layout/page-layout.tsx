'use client'

import dynamic from 'next/dynamic'
import { Navigation } from '@/components/layout/navigation'
import { Box } from '@/components/layout'
import { cn } from '@/lib/utils'

// Lazy load WebGL component for better performance
const Lightning = dynamic(
  () => import('@/components/ui/lightning').then(mod => ({ default: mod.Lightning })),
  {
    ssr: false,
  }
)

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
        className={cn('relative z-10 pt-28 pb-14 px-4 sm:px-6 lg:px-8', contentClassName)}
      >
        <Box className="max-w-7xl mx-auto">{children}</Box>
      </Box>
    </Box>
  )
}
