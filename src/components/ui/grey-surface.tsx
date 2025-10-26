'use client'

import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GreySurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  borderRadius?: number
}

/**
 * Jednoduchá šedá surface komponenta bez glass efektů
 * Používá se jako náhrada za GlassSurface pro lepší výkon
 */
export const GreySurface = forwardRef<HTMLDivElement, GreySurfaceProps>(
  ({ children, className, style, borderRadius = 20, ...props }, ref) => {
    const containerStyle: React.CSSProperties = {
      ...style,
      borderRadius: `${borderRadius}px`,
      backgroundColor: 'rgba(31, 41, 55, 0.6)', // gray-800 s transparencí
      border: '1px solid rgba(55, 65, 81, 0.3)', // gray-700 border
    }

    return (
      <div ref={ref} className={cn(className)} style={containerStyle} {...props}>
        {children}
      </div>
    )
  }
)

GreySurface.displayName = 'GreySurface'
