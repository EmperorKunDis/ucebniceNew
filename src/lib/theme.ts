// Centrální theme konstanty pro konzistentní design

export const colors = {
  // Primary colors
  primary: {
    purple: 'rgb(168, 85, 247)', // purple-500
    pink: 'rgb(236, 72, 153)', // pink-500
    blue: 'rgb(96, 165, 250)', // blue-400
  },

  // Gradient combinations
  gradients: {
    primary: 'from-purple-400 to-pink-400',
    secondary: 'from-blue-400 via-purple-400 to-pink-400',
    success: 'from-green-400 to-emerald-500',
    warning: 'from-yellow-400 to-orange-500',
    error: 'from-red-400 to-pink-500',

    // Specific use cases
    button: 'from-purple-600 to-pink-600',
    card: 'from-purple-900/30 to-pink-900/30',
    glass: 'from-white/10 to-white/5',
  },

  // Background colors
  background: {
    primary: 'rgb(17, 24, 39)', // gray-900
    secondary: 'rgb(31, 41, 55)', // gray-800
    tertiary: 'rgb(55, 65, 81)', // gray-700
    glass: 'rgba(255, 255, 255, 0.1)',
  },

  // Text colors
  text: {
    primary: 'rgb(255, 255, 255)', // white
    secondary: 'rgb(209, 213, 219)', // gray-300
    muted: 'rgb(156, 163, 175)', // gray-400
    disabled: 'rgb(107, 114, 128)', // gray-500
  },

  // Border colors
  border: {
    primary: 'rgb(75, 85, 99)', // gray-600
    secondary: 'rgb(55, 65, 81)', // gray-700
    glass: 'rgba(255, 255, 255, 0.1)',
  },
} as const

export const spacing = {
  // Padding/margin values
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
} as const

export const borderRadius = {
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: {
    purple: '0 0 40px rgba(168, 85, 247, 0.5)',
    pink: '0 0 40px rgba(236, 72, 153, 0.5)',
    blue: '0 0 40px rgba(96, 165, 250, 0.5)',
  },
} as const

export const transitions = {
  fast: '150ms ease',
  normal: '300ms ease',
  slow: '500ms ease',
  spring: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Utility function pro konzistentní gradient text
export const gradientText = (gradient: keyof typeof colors.gradients = 'primary') =>
  `bg-gradient-to-r ${colors.gradients[gradient]} bg-clip-text text-transparent`

// Utility function pro glass effect
export const glassEffect = (opacity = 0.1, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: `1px solid ${colors.border.glass}`,
})

// Export theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  utils: {
    gradientText,
    glassEffect,
  },
} as const

export default theme
