'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Počet sloupců v mřížce
   * @default 1
   */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto'
  
  /**
   * Počet sloupců pro různé breakpointy
   */
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  
  /**
   * Mezera mezi prvky (Tailwind spacing scale)
   * @default 0
   */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  
  /**
   * Různé mezery pro řádky a sloupce
   */
  gapX?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  gapY?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  
  /**
   * Zarovnání obsahu v mřížce
   */
  placeItems?: 'start' | 'end' | 'center' | 'stretch'
  
  children: React.ReactNode
}

/**
 * Grid komponenta pro vytváření responzivních mřížkových layoutů
 * 
 * @example
 * <Grid columns={1} md={2} lg={3} gap={4}>
 *   <Card>Karta 1</Card>
 *   <Card>Karta 2</Card>
 *   <Card>Karta 3</Card>
 * </Grid>
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    children, 
    className,
    columns = 1,
    sm,
    md,
    lg,
    xl,
    gap,
    gapX,
    gapY,
    placeItems,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          // Základní počet sloupců
          columns === 'auto' ? 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]' : `grid-cols-${columns}`,
          // Responzivní sloupce
          sm && `sm:grid-cols-${sm}`,
          md && `md:grid-cols-${md}`,
          lg && `lg:grid-cols-${lg}`,
          xl && `xl:grid-cols-${xl}`,
          // Mezery
          gap !== undefined && `gap-${gap}`,
          gapX !== undefined && `gap-x-${gapX}`,
          gapY !== undefined && `gap-y-${gapY}`,
          // Zarovnání
          placeItems && {
            'place-items-start': placeItems === 'start',
            'place-items-end': placeItems === 'end',
            'place-items-center': placeItems === 'center',
            'place-items-stretch': placeItems === 'stretch',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'