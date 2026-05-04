import { describe, it, expect } from 'vitest'
import {
  calculateLevel,
  getXPForLevel,
  getXPForNextLevel,
  getProgressToNextLevel,
  calculateTotalXP,
  checkAchievements,
  shouldUpdateStreak,
  XP_PER_CHAPTER,
  XP_PER_QUIZ,
  XP_PER_CHALLENGE,
  XP_STREAK_BONUS,
  BADGES,
} from '../gamification'

describe('calculateLevel', () => {
  it('returns 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns 1 for 99 XP (just below level 2)', () => {
    expect(calculateLevel(99)).toBe(1)
  })

  it('returns 2 for exactly 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('returns 2 for 399 XP (just below level 3)', () => {
    expect(calculateLevel(399)).toBe(2)
  })

  it('returns 3 for exactly 400 XP', () => {
    expect(calculateLevel(400)).toBe(3)
  })

  it('returns 4 for exactly 900 XP', () => {
    expect(calculateLevel(900)).toBe(4)
  })

  it('returns 5 for exactly 1600 XP', () => {
    expect(calculateLevel(1600)).toBe(5)
  })

  it('handles large XP values correctly', () => {
    // Level 10 requires (10-1)^2 * 100 = 8100 XP
    expect(calculateLevel(8100)).toBe(10)
    expect(calculateLevel(8099)).toBe(9)
  })

  it('handles negative XP gracefully', () => {
    // sqrt of negative / 100 becomes NaN, floor of NaN is NaN, +1 is still NaN
    // But Math.sqrt(-1) returns NaN in JS, so this tests edge case behavior
    const result = calculateLevel(-100)
    expect(result).toBeNaN()
  })
})

describe('getXPForLevel', () => {
  it('returns 0 XP for level 1', () => {
    expect(getXPForLevel(1)).toBe(0)
  })

  it('returns 100 XP for level 2', () => {
    expect(getXPForLevel(2)).toBe(100)
  })

  it('returns 400 XP for level 3', () => {
    expect(getXPForLevel(3)).toBe(400)
  })

  it('returns 900 XP for level 4', () => {
    expect(getXPForLevel(4)).toBe(900)
  })

  it('returns 1600 XP for level 5', () => {
    expect(getXPForLevel(5)).toBe(1600)
  })

  it('returns 8100 XP for level 10', () => {
    expect(getXPForLevel(10)).toBe(8100)
  })

  it('follows quadratic formula (level-1)^2 * 100', () => {
    for (let level = 1; level <= 15; level++) {
      expect(getXPForLevel(level)).toBe(Math.pow(level - 1, 2) * 100)
    }
  })
})

describe('getXPForNextLevel', () => {
  it('returns 100 XP needed for next level when at level 1', () => {
    expect(getXPForNextLevel(1)).toBe(100)
  })

  it('returns 400 XP needed for next level when at level 2', () => {
    expect(getXPForNextLevel(2)).toBe(400)
  })

  it('returns 900 XP needed for next level when at level 3', () => {
    expect(getXPForNextLevel(3)).toBe(900)
  })

  it('follows quadratic formula level^2 * 100', () => {
    for (let level = 1; level <= 10; level++) {
      expect(getXPForNextLevel(level)).toBe(Math.pow(level, 2) * 100)
    }
  })
})

describe('getProgressToNextLevel', () => {
  it('returns correct progress for 0 XP', () => {
    const result = getProgressToNextLevel(0)
    expect(result.currentLevel).toBe(1)
    expect(result.currentLevelXP).toBe(0)
    expect(result.nextLevelXP).toBe(100)
    expect(result.progressXP).toBe(0)
    expect(result.progressPercent).toBe(0)
  })

  it('returns correct progress for 50 XP (halfway to level 2)', () => {
    const result = getProgressToNextLevel(50)
    expect(result.currentLevel).toBe(1)
    expect(result.progressXP).toBe(50)
    expect(result.progressPercent).toBe(50)
  })

  it('returns correct progress for 150 XP', () => {
    const result = getProgressToNextLevel(150)
    expect(result.currentLevel).toBe(2)
    expect(result.currentLevelXP).toBe(100)
    expect(result.nextLevelXP).toBe(400)
    expect(result.progressXP).toBe(50)
    // 50 / (400 - 100) * 100 = 50/300*100 = 16.67%
    expect(result.progressPercent).toBeCloseTo(16.67, 1)
  })

  it('returns 0% progress at exact level boundary', () => {
    const result = getProgressToNextLevel(100)
    expect(result.currentLevel).toBe(2)
    expect(result.progressXP).toBe(0)
    expect(result.progressPercent).toBe(0)
  })

  it('returns correct progress just before level up', () => {
    const result = getProgressToNextLevel(99)
    expect(result.currentLevel).toBe(1)
    expect(result.progressXP).toBe(99)
    expect(result.progressPercent).toBe(99)
  })
})

describe('calculateTotalXP', () => {
  it('calculates XP from chapters', () => {
    const result = calculateTotalXP({
      completedChapters: 5,
      completedQuizzes: 0,
      completedChallenges: 0,
      streakBonus: 0,
      badges: [],
    })
    expect(result).toBe(5 * XP_PER_CHAPTER)
  })

  it('calculates XP from quizzes', () => {
    const result = calculateTotalXP({
      completedChapters: 0,
      completedQuizzes: 3,
      completedChallenges: 0,
      streakBonus: 0,
      badges: [],
    })
    expect(result).toBe(3 * XP_PER_QUIZ)
  })

  it('calculates XP from challenges', () => {
    const result = calculateTotalXP({
      completedChapters: 0,
      completedQuizzes: 0,
      completedChallenges: 2,
      streakBonus: 0,
      badges: [],
    })
    expect(result).toBe(2 * XP_PER_CHALLENGE)
  })

  it('calculates XP from streak bonus', () => {
    const result = calculateTotalXP({
      completedChapters: 0,
      completedQuizzes: 0,
      completedChallenges: 0,
      streakBonus: 7,
      badges: [],
    })
    expect(result).toBe(7 * XP_STREAK_BONUS)
  })

  it('calculates XP from badges', () => {
    const result = calculateTotalXP({
      completedChapters: 0,
      completedQuizzes: 0,
      completedChallenges: 0,
      streakBonus: 0,
      badges: ['first-chapter', 'perfect-score'],
    })
    expect(result).toBe(BADGES.FIRST_CHAPTER.xpReward + BADGES.PERFECT_SCORE.xpReward)
  })

  it('calculates combined XP from all sources', () => {
    const result = calculateTotalXP({
      completedChapters: 2,
      completedQuizzes: 3,
      completedChallenges: 1,
      streakBonus: 5,
      badges: ['first-chapter'],
    })
    const expected =
      2 * XP_PER_CHAPTER +
      3 * XP_PER_QUIZ +
      1 * XP_PER_CHALLENGE +
      5 * XP_STREAK_BONUS +
      BADGES.FIRST_CHAPTER.xpReward
    expect(result).toBe(expected)
  })

  it('ignores unknown badge IDs', () => {
    const result = calculateTotalXP({
      completedChapters: 0,
      completedQuizzes: 0,
      completedChallenges: 0,
      streakBonus: 0,
      badges: ['unknown-badge', 'another-fake-badge'],
    })
    expect(result).toBe(0)
  })
})

describe('checkAchievements', () => {
  it('awards FIRST_CHAPTER badge when completing first chapter', () => {
    const newBadges = checkAchievements(1, 0, 0, 0, [])
    expect(newBadges).toContain('FIRST_CHAPTER')
  })

  it('awards FIVE_CHAPTERS badge when completing 5 chapters', () => {
    const newBadges = checkAchievements(5, 0, 0, 0, ['first-chapter'])
    expect(newBadges).toContain('FIVE_CHAPTERS')
  })

  it('awards TEN_CHAPTERS badge when completing 10 chapters', () => {
    const newBadges = checkAchievements(10, 0, 0, 0, ['first-chapter', 'five-chapters'])
    expect(newBadges).toContain('TEN_CHAPTERS')
  })

  it('awards WEEK_STREAK badge for 7-day streak', () => {
    const newBadges = checkAchievements(0, 7, 0, 0, [])
    expect(newBadges).toContain('WEEK_STREAK')
  })

  it('awards MONTH_STREAK badge for 30-day streak', () => {
    const newBadges = checkAchievements(0, 30, 0, 0, ['week-streak'])
    expect(newBadges).toContain('MONTH_STREAK')
  })

  it('awards FIRST_CHALLENGE badge when completing first challenge', () => {
    const newBadges = checkAchievements(0, 0, 1, 0, [])
    expect(newBadges).toContain('FIRST_CHALLENGE')
  })

  it('awards PERFECT_SCORE badge for first perfect score', () => {
    const newBadges = checkAchievements(0, 0, 0, 1, [])
    expect(newBadges).toContain('PERFECT_SCORE')
  })

  it('does not re-award already earned badges', () => {
    const newBadges = checkAchievements(5, 7, 1, 1, [
      'first-chapter',
      'five-chapters',
      'week-streak',
      'first-challenge',
      'perfect-score',
    ])
    expect(newBadges).toHaveLength(0)
  })

  it('awards multiple badges at once', () => {
    const newBadges = checkAchievements(5, 7, 1, 1, [])
    expect(newBadges).toContain('FIRST_CHAPTER')
    expect(newBadges).toContain('FIVE_CHAPTERS')
    expect(newBadges).toContain('WEEK_STREAK')
    expect(newBadges).toContain('FIRST_CHALLENGE')
    expect(newBadges).toContain('PERFECT_SCORE')
  })
})

describe('shouldUpdateStreak', () => {
  it('increments streak on first activity (null last activity)', () => {
    const result = shouldUpdateStreak(null)
    expect(result.shouldIncrement).toBe(true)
    expect(result.shouldReset).toBe(false)
  })

  it('does not change streak for same day activity', () => {
    const now = new Date()
    const result = shouldUpdateStreak(now)
    expect(result.shouldIncrement).toBe(false)
    expect(result.shouldReset).toBe(false)
  })

  it('increments streak for next day activity', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = shouldUpdateStreak(yesterday)
    expect(result.shouldIncrement).toBe(true)
    expect(result.shouldReset).toBe(false)
  })

  it('resets streak when more than 1 day missed', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const result = shouldUpdateStreak(twoDaysAgo)
    expect(result.shouldIncrement).toBe(false)
    expect(result.shouldReset).toBe(true)
  })

  it('resets streak when many days missed', () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const result = shouldUpdateStreak(weekAgo)
    expect(result.shouldIncrement).toBe(false)
    expect(result.shouldReset).toBe(true)
  })
})

describe('XP Constants', () => {
  it('has correct XP values', () => {
    expect(XP_PER_CHAPTER).toBe(50)
    expect(XP_PER_QUIZ).toBe(50)
    expect(XP_PER_CHALLENGE).toBe(150)
    expect(XP_STREAK_BONUS).toBe(25)
  })
})

describe('BADGES', () => {
  it('has unique IDs for all badges', () => {
    const ids = Object.values(BADGES).map(b => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all badges have required properties', () => {
    Object.values(BADGES).forEach(badge => {
      expect(badge).toHaveProperty('id')
      expect(badge).toHaveProperty('name')
      expect(badge).toHaveProperty('description')
      expect(badge).toHaveProperty('icon')
      expect(badge).toHaveProperty('xpReward')
      expect(badge).toHaveProperty('rarity')
      expect(typeof badge.xpReward).toBe('number')
      expect(badge.xpReward).toBeGreaterThan(0)
    })
  })

  it('all badges have valid rarity values', () => {
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    Object.values(BADGES).forEach(badge => {
      expect(validRarities).toContain(badge.rarity)
    })
  })
})
