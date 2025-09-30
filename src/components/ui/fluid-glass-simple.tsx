'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FluidGlassSimpleProps {
  children?: ReactNode
  className?: string
  mode?: 'lens' | 'bar' | 'cube'
}

export function FluidGlassSimple({ children, className, mode = 'bar' }: FluidGlassSimpleProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10',
        mode === 'lens' && 'rounded-full aspect-square',
        mode === 'cube' && 'rounded-xl',
        mode === 'bar' && 'rounded-lg',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}