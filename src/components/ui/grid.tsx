'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Počet sloupců - můžete použít číslo nebo Tailwind třídu
   * @example columns={3} // grid-cols-3
   * @example columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   */
  columns?: number | string
  
  /**
   * Počet řádků - můžete použít číslo nebo Tailwind třídu
   * @example rows={2} // grid-rows-2
   */
  rows?: number | string
  
  /**
   * Mezera mezi prvky - můžete použít Tailwind třídy nebo čísla (násobky 4px)
   * @example gap={4} // gap-4
   * @example gap="gap-4"
   */
  gap?: string | number
  
  /**
   * Horizontální mezera mezi prvky
   * @example gapX={4} // gap-x-4
   */
  gapX?: string | number
  
  /**
   * Vertikální mezera mezi prvky
   * @example gapY={4} // gap-y-4
   */
  gapY?: string | number
  
  /**
   * Způsob rozmístění prvků v mřížce
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  
  /**
   * Zarovnání obsahu v buňkách
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  
  /**
   * HTML element, který se má renderovat
   * @default 'div'
   */
  as?: React.ElementType
  
  children?: React.ReactNode
}

/**
 * Layout komponenta pro mřížkové rozložení
 * Používá CSS Grid pro vytváření komplexních layoutů
 * 
 * @example
 * <Grid columns={3} gap={4}>
 *   <div>Buňka 1</div>
 *   <div>Buňka 2</div>
 *   <div>Buňka 3</div>
 * </Grid>
 * 
 * @example s responzivními sloupci
 * <Grid columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" gap={6}>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </Grid>
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    columns,
    rows,
    gap,
    gapX,
    gapY,
    justify = 'start',
    align = 'stretch',
    as: Component = 'div',
    className,
    children,
    ...props 
  }, ref) => {
    // Převod čísla na Tailwind třídu
    const getColumnsClass = () => {
      if (typeof columns === 'number') return `grid-cols-${columns}`
      return columns
    }
    
    const getRowsClass = () => {
      if (typeof rows === 'number') return `grid-rows-${rows}`
      return rows
    }
    
    const getGapClass = () => {
      if (typeof gap === 'number') return `gap-${gap}`
      return gap
    }
    
    const getGapXClass = () => {
      if (typeof gapX === 'number') return `gap-x-${gapX}`
      return gapX
    }
    
    const getGapYClass = () => {
      if (typeof gapY === 'number') return `gap-y-${gapY}`
      return gapY
    }
    
    // Mapování justify hodnot na Tailwind třídy
    const justifyClasses = {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      between: 'justify-items-between',
      around: 'justify-items-around',
      evenly: 'justify-items-evenly',
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
          'grid',
          getColumnsClass(),
          getRowsClass(),
          getGapClass(),
          getGapXClass(),
          getGapYClass(),
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

Grid.displayName = 'Grid'