import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      username?: string | null
      xp: number
      level: number
      currentStreak: number
      longestStreak: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
}