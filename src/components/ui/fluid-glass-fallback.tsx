'use client'

import { ReactNode } from 'react'
import { GlassSurface } from './glass-surface'

interface FluidGlassFallbackProps {
  children?: ReactNode
  className?: string
  mode?: 'lens' | 'bar' | 'cube'
}

export function FluidGlassFallback({ children, className = '', mode = 'bar' }: FluidGlassFallbackProps) {
  const props = {
    className,
    width: mode === 'lens' ? 300 : '100%',
    height: mode === 'lens' ? 300 : mode === 'cube' ? 300 : 80,
    borderRadius: mode === 'lens' ? 150 : mode === 'cube' ? 30 : 20,
    blur: 12,
    distortionScale: -100,
    backgroundOpacity: 0.1,
  }

  return (
    <GlassSurface {...props}>
      <div className="w-full h-full flex items-center justify-center p-4">
        {children}
      </div>
    </GlassSurface>
  )
}