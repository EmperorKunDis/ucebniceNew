'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element nebo React komponent, který se má renderovat
   * @default 'div'
   */
  as?: React.ElementType
  
  /**
   * Padding - můžete použít Tailwind třídy nebo čísla (násobky 4px)
   * @example padding={4} // 16px
   * @example padding="p-4" // 16px
   */
  padding?: string | number
  
  /**
   * Margin - můžete použít Tailwind třídy nebo čísla (násobky 4px)
   * @example margin={4} // 16px
   * @example margin="m-4" // 16px
   */
  margin?: string | number
  
  children?: React.ReactNode
}

/**
 * Základní layout komponenta pro box model
 * Poskytuje flexibilní způsob vytváření kontejnerů s různými HTML elementy
 * 
 * @example
 * <Box as="section" padding={4} className="bg-gray-100">
 *   Obsah
 * </Box>
 */
export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ 
    as: Component = 'div',
    padding,
    margin,
    className,
    children,
    ...props 
  }, ref) => {
    // Převod čísla na Tailwind třídu
    const getPaddingClass = () => {
      if (typeof padding === 'number') return `p-${padding}`
      return padding
    }
    
    const getMarginClass = () => {
      if (typeof margin === 'number') return `m-${margin}`
      return margin
    }
    
    return (
      <Component
        ref={ref}
        className={cn(
          getPaddingClass(),
          getMarginClass(),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Box.displayName = 'Box'