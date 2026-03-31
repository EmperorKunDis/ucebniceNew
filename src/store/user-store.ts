import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}

interface UserProgress {
  lessonId: string
  completedAt: Date
  xpEarned: number
}

interface UserState {
  // User info
  userId: string | null
  username: string | null
  email: string | null
  avatar: string | null
  onboardingCompleted: boolean
  userGoal: string | null
  experienceLevel: string | null

  // Gamification
  xp: number
  level: number
  streak: number
  lastActiveDate: string | null
  badges: Badge[]
  progress: UserProgress[]

  // Hydration state
  _hasHydrated: boolean

  // Actions
  setUser: (user: { userId: string; username: string; email: string; avatar?: string }) => void
  setUsername: (username: string) => void
  completeOnboarding: () => void
  setUserPreferences: (goal: string, experience: string) => void
  addXP: (amount: number) => void
  addBadge: (badge: Badge) => void
  updateStreak: () => void
  unlockBadge: (badge: Badge) => void
  completeLesson: (lessonId: string, xpEarned: number) => void
  reset: () => void
  setHasHydrated: (state: boolean) => void
}

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      // Initial state
      userId: null,
      username: null,
      email: null,
      avatar: null,
      onboardingCompleted: false,
      userGoal: null,
      experienceLevel: null,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: [],
      progress: [],
      _hasHydrated: false,

      // Actions
      setUser: user =>
        set({
          userId: user.userId,
          username: user.username,
          email: user.email,
          avatar: user.avatar || null,
        }),

      setUsername: username => set({ username }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      setUserPreferences: (goal, experience) =>
        set({
          userGoal: goal,
          experienceLevel: experience,
        }),

      addXP: amount =>
        set(state => {
          const newXP = state.xp + amount
          const newLevel = calculateLevel(newXP)
          return {
            xp: newXP,
            level: newLevel,
          }
        }),

      addBadge: badge =>
        set(state => {
          const exists = state.badges.some(b => b.id === badge.id)
          if (exists) return state
          return {
            badges: [...state.badges, { ...badge, unlockedAt: badge.unlockedAt || new Date() }],
          }
        }),

      updateStreak: () =>
        set(state => {
          const today = new Date().toDateString()
          const lastActive = state.lastActiveDate

          if (!lastActive) {
            return { streak: 1, lastActiveDate: today }
          }

          const lastDate = new Date(lastActive)
          const todayDate = new Date(today)
          const dayDiff = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (dayDiff === 0) {
            // Same day, no change
            return state
          } else if (dayDiff === 1) {
            // Consecutive day
            return {
              streak: state.streak + 1,
              lastActiveDate: today,
            }
          } else {
            // Streak broken
            return {
              streak: 1,
              lastActiveDate: today,
            }
          }
        }),

      unlockBadge: badge =>
        set(state => ({
          badges: [...state.badges, { ...badge, unlockedAt: new Date() }],
        })),

      completeLesson: (lessonId, xpEarned) =>
        set(state => {
          const alreadyCompleted = state.progress.some(p => p.lessonId === lessonId)
          if (alreadyCompleted) return state

          return {
            progress: [
              ...state.progress,
              {
                lessonId,
                completedAt: new Date(),
                xpEarned,
              },
            ],
            xp: state.xp + xpEarned,
            level: calculateLevel(state.xp + xpEarned),
          }
        }),

      reset: () =>
        set({
          userId: null,
          username: null,
          email: null,
          avatar: null,
          onboardingCompleted: false,
          userGoal: null,
          experienceLevel: null,
          xp: 0,
          level: 1,
          streak: 0,
          lastActiveDate: null,
          badges: [],
          progress: [],
        }),

      setHasHydrated: state => set({ _hasHydrated: state }),
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },
    }
  )
)

/**
 * Hook that returns store values only after hydration is complete.
 * Prevents hydration mismatch by returning default values on server/first render.
 */
export function useUserStoreHydrated() {
  const store = useUserStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return {
      ...store,
      // Return safe defaults during SSR
      userId: null,
      username: null,
      email: null,
      avatar: null,
      onboardingCompleted: false,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      progress: [],
      _hasHydrated: false,
    }
  }

  return store
}
