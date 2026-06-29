'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Směr skládání prvků
   * @default 'col'
   */
  direction?: 'row' | 'col'

  /**
   * Mezera mezi prvky (Tailwind spacing scale)
   * @default 0
   */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24

  /**
   * Zarovnání na hlavní ose
   */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'

  /**
   * Zarovnání na vedlejší ose
   */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'

  /**
   * Zalamování prvků
   */
  wrap?: boolean

  children: React.ReactNode
}

/**
 * Stack komponenta pro jednoduché vertikální nebo horizontální skládání prvků
 *
 * @example
 * <Stack direction="col" gap={4} align="center">
 *   <Button>Tlačítko 1</Button>
 *   <Button>Tlačítko 2</Button>
 * </Stack>
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    { children, className, direction = 'col', gap = 0, justify, align, wrap = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'col' && 'flex-col',
          direction === 'row' && 'flex-row',
          gap > 0 && `gap-${gap}`,
          justify && {
            'justify-start': justify === 'start',
            'justify-end': justify === 'end',
            'justify-center': justify === 'center',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',
          },
          align && {
            'items-start': align === 'start',
            'items-end': align === 'end',
            'items-center': align === 'center',
            'items-baseline': align === 'baseline',
            'items-stretch': align === 'stretch',
          },
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'
