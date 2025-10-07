'use client'

import { forwardRef, memo } from 'react'
import { cn } from '@/lib/utils'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Směr uspořádání prvků
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'

  /**
   * Mezera mezi prvky - můžete použít Tailwind třídy nebo čísla (násobky 4px)
   * @example gap={4} // 16px
   * @example gap="gap-4" // 16px
   */
  gap?: string | number

  /**
   * Zarovnání na hlavní ose (justify-content)
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

  /**
   * Zarovnání na vedlejší ose (align-items)
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'

  /**
   * Zabalit prvky když se nevejdou (flex-wrap)
   * @default false
   */
  wrap?: boolean

  /**
   * HTML element, který se má renderovat
   * @default 'div'
   */
  as?: React.ElementType

  children?: React.ReactNode
}

/**
 * Layout komponenta pro vertikální nebo horizontální uspořádání prvků
 * Používá flexbox pro jednoduché rozložení
 *
 * @example
 * <Stack gap={4} direction="vertical" align="center">
 *   <div>První prvek</div>
 *   <div>Druhý prvek</div>
 * </Stack>
 */
const StackComponent = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      gap,
      justify = 'start',
      align = 'stretch',
      wrap = false,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Převod čísla na Tailwind třídu
    const getGapClass = () => {
      if (typeof gap === 'number') return `gap-${gap}`
      return gap
    }

    // Mapování justify hodnot na Tailwind třídy
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }

    // Mapování align hodnot na Tailwind třídy
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    }

    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          wrap && 'flex-wrap',
          getGapClass(),
          justifyClasses[justify],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

StackComponent.displayName = 'Stack'

// Memoize to prevent unnecessary re-renders
export const Stack = memo(StackComponent)
