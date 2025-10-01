/**
 * Gamification utilities for calculating XP, levels, and achievements
 */

// XP calculation constants
export const XP_PER_CHAPTER = 100
export const XP_PER_QUIZ = 50
export const XP_PER_CHALLENGE = 150
export const XP_STREAK_BONUS = 25

// Level system - kvadratický růst
export function calculateLevel(xp: number): number {
  // Level = sqrt(XP / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXPForLevel(level: number): number {
  // XP potřebné pro dosažení levelu
  return Math.pow(level - 1, 2) * 100
}

export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

export function getProgressToNextLevel(xp: number): {
  currentLevel: number
  currentLevelXP: number
  nextLevelXP: number
  progressXP: number
  progressPercent: number
} {
  const currentLevel = calculateLevel(xp)
  const currentLevelXP = getXPForLevel(currentLevel)
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const progressXP = xp - currentLevelXP
  const progressPercent = (progressXP / (nextLevelXP - currentLevelXP)) * 100

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressXP,
    progressPercent
  }
}

// Badge/Achievement definitions
export const BADGES = {
  FIRST_CHAPTER: {
    id: 'first-chapter',
    name: 'První krok',
    description: 'Dokončil jsi první kapitolu',
    icon: '🎯',
    xpReward: 50,
    rarity: 'common'
  },
  FIVE_CHAPTERS: {
    id: 'five-chapters',
    name: 'Pilný student',
    description: 'Dokončil jsi 5 kapitol',
    icon: '📚',
    xpReward: 100,
    rarity: 'uncommon'
  },
  TEN_CHAPTERS: {
    id: 'ten-chapters',
    name: 'Mistr učení',
    description: 'Dokončil jsi 10 kapitol',
    icon: '🎓',
    xpReward: 200,
    rarity: 'rare'
  },
  ALL_CHAPTERS: {
    id: 'all-chapters',
    name: 'Absolutní expert',
    description: 'Dokončil jsi všechny kapitoly',
    icon: '👑',
    xpReward: 500,
    rarity: 'legendary'
  },
  WEEK_STREAK: {
    id: 'week-streak',
    name: 'Týdenní warrior',
    description: 'Udržel jsi 7denní streak',
    icon: '🔥',
    xpReward: 150,
    rarity: 'uncommon'
  },
  MONTH_STREAK: {
    id: 'month-streak',
    name: 'Neúnavný',
    description: 'Udržel jsi 30denní streak',
    icon: '⚡',
    xpReward: 500,
    rarity: 'epic'
  },
  FIRST_CHALLENGE: {
    id: 'first-challenge',
    name: 'Výzva přijata',
    description: 'Splnil jsi první cognitive glitch',
    icon: '🧠',
    xpReward: 75,
    rarity: 'common'
  },
  CHALLENGE_MASTER: {
    id: 'challenge-master',
    name: 'Mistr výzev',
    description: 'Splnil jsi všechny cognitive glitches',
    icon: '💎',
    xpReward: 300,
    rarity: 'epic'
  },
  HACKATHON_WINNER: {
    id: 'hackathon-winner',
    name: 'Hackathon šampion',
    description: 'Vyhrál jsi hackathon',
    icon: '🏆',
    xpReward: 1000,
    rarity: 'legendary'
  },
  GRADUATE: {
    id: 'graduate',
    name: 'Absolvent',
    description: 'Dokončil jsi Graduate výzvu',
    icon: '🎖️',
    xpReward: 750,
    rarity: 'epic'
  },
  SPEED_LEARNER: {
    id: 'speed-learner',
    name: 'Rychlík',
    description: 'Dokončil jsi kapitolu za méně než 10 minut',
    icon: '⚡',
    xpReward: 100,
    rarity: 'rare'
  },
  PERFECT_SCORE: {
    id: 'perfect-score',
    name: 'Perfekcionista',
    description: 'Dosáhl jsi 100% v kvízu',
    icon: '💯',
    xpReward: 125,
    rarity: 'rare'
  }
} as const

export type BadgeId = keyof typeof BADGES

// Achievement checking functions
export function checkAchievements(
  completedChapters: number,
  currentStreak: number,
  completedChallenges: number,
  perfectScores: number,
  existingBadges: string[]
): BadgeId[] {
  const newBadges: BadgeId[] = []

  // Chapter-based achievements
  if (completedChapters >= 1 && !existingBadges.includes(BADGES.FIRST_CHAPTER.id)) {
    newBadges.push('FIRST_CHAPTER')
  }
  if (completedChapters >= 5 && !existingBadges.includes(BADGES.FIVE_CHAPTERS.id)) {
    newBadges.push('FIVE_CHAPTERS')
  }
  if (completedChapters >= 10 && !existingBadges.includes(BADGES.TEN_CHAPTERS.id)) {
    newBadges.push('TEN_CHAPTERS')
  }

  // Streak-based achievements
  if (currentStreak >= 7 && !existingBadges.includes(BADGES.WEEK_STREAK.id)) {
    newBadges.push('WEEK_STREAK')
  }
  if (currentStreak >= 30 && !existingBadges.includes(BADGES.MONTH_STREAK.id)) {
    newBadges.push('MONTH_STREAK')
  }

  // Challenge-based achievements
  if (completedChallenges >= 1 && !existingBadges.includes(BADGES.FIRST_CHALLENGE.id)) {
    newBadges.push('FIRST_CHALLENGE')
  }

  // Perfect score achievement
  if (perfectScores >= 1 && !existingBadges.includes(BADGES.PERFECT_SCORE.id)) {
    newBadges.push('PERFECT_SCORE')
  }

  return newBadges
}

// Calculate total XP from various sources
export function calculateTotalXP(data: {
  completedChapters: number
  completedQuizzes: number
  completedChallenges: number
  streakBonus: number
  badges: string[]
}): number {
  let totalXP = 0

  totalXP += data.completedChapters * XP_PER_CHAPTER
  totalXP += data.completedQuizzes * XP_PER_QUIZ
  totalXP += data.completedChallenges * XP_PER_CHALLENGE
  totalXP += data.streakBonus * XP_STREAK_BONUS

  // Add XP from badges
  data.badges.forEach(badgeId => {
    const badge = Object.values(BADGES).find(b => b.id === badgeId)
    if (badge) {
      totalXP += badge.xpReward
    }
  })

  return totalXP
}

// Streak management
export function shouldUpdateStreak(lastActivityDate: Date | null): {
  shouldIncrement: boolean
  shouldReset: boolean
} {
  if (!lastActivityDate) {
    return { shouldIncrement: true, shouldReset: false }
  }

  const now = new Date()
  const lastActivity = new Date(lastActivityDate)

  // Normalize to start of day
  now.setHours(0, 0, 0, 0)
  lastActivity.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Same day - no change
    return { shouldIncrement: false, shouldReset: false }
  } else if (diffDays === 1) {
    // Next day - increment
    return { shouldIncrement: true, shouldReset: false }
  } else {
    // Missed a day - reset
    return { shouldIncrement: false, shouldReset: true }
  }
}
