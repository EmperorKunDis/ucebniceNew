'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * HTML tag pro renderování
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'

  children?: React.ReactNode
}

/**
 * Box komponenta - základní building block pro layouty
 * Jednoduchý wrapper, který přijímá className pro styling
 *
 * @example
 * <Box className="p-4 bg-white rounded-lg shadow">
 *   <h1>Obsah</h1>
 * </Box>
 *
 * @example
 * <Box as="section" className="max-w-7xl mx-auto">
 *   <Content />
 * </Box>
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(className)} {...props}>
        {children}
      </Component>
    )
  }
)

Box.displayName = 'Box'
