'use client'

import { forwardRef, memo } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Pokud true, button se chová jako Slot a renderuje své child jako root element
   * Užitečné pro použití s Next.js Link komponentou
   * @default false
   */
  asChild?: boolean

  /**
   * Varianta tlačítka
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'

  /**
   * Velikost tlačítka
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Zobrazit tlačítko na celou šířku rodiče
   * @default false
   */
  fullWidth?: boolean

  children: React.ReactNode
}

/**
 * Button komponenta s podporou různých variant a velikostí
 * Neobsahuje žádné layout styly (margin, width) - ty se nastavují přes className
 *
 * @example
 * <Button variant="primary" size="md">Klikni na mě</Button>
 *
 * @example s vlastními layout styly
 * <Button className="mt-4 w-full">Celá šířka s horním marginem</Button>
 */
const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(
          // Základní styly
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Varianty
          {
            'bg-[#6747ff] text-white shadow-lg shadow-[#6747ff]/30 hover:bg-[#846bff] focus-visible:ring-[#44d8ed]':
              variant === 'primary',
            'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20':
              variant === 'secondary',
            'text-gray-300 hover:text-white hover:bg-white/10': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500':
              variant === 'destructive',
          },

          // Velikosti
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          // Volitelná plná šířka (deprecated - raději použijte className="w-full")
          fullWidth && 'w-full',

          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

ButtonComponent.displayName = 'Button'

// Memoize to prevent unnecessary re-renders
export const Button = memo(ButtonComponent)
