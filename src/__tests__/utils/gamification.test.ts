import {
  calculateLevel,
  getXPForLevel,
  getXPForNextLevel,
  getProgressToNextLevel,
  checkAchievements,
  calculateTotalXP,
  shouldUpdateStreak,
  XP_PER_CHAPTER,
  XP_PER_QUIZ,
  XP_PER_CHALLENGE,
  XP_STREAK_BONUS,
  BADGES,
} from '@/lib/gamification'

describe('Gamification Utils', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1)
    })

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2)
    })

    it('should return level 3 for 400 XP', () => {
      expect(calculateLevel(400)).toBe(3)
    })

    it('should return level 10 for 8100 XP', () => {
      expect(calculateLevel(8100)).toBe(10)
    })

    it('should handle large XP values', () => {
      expect(calculateLevel(100000)).toBe(32)
    })
  })

  describe('getXPForLevel', () => {
    it('should return 0 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(0)
    })

    it('should return 100 XP for level 2', () => {
      expect(getXPForLevel(2)).toBe(100)
    })

    it('should return 400 XP for level 3', () => {
      expect(getXPForLevel(3)).toBe(400)
    })

    it('should return 8100 XP for level 10', () => {
      expect(getXPForLevel(10)).toBe(8100)
    })
  })

  describe('getXPForNextLevel', () => {
    it('should return 100 XP for next level from level 1', () => {
      expect(getXPForNextLevel(1)).toBe(100)
    })

    it('should return 400 XP for next level from level 2', () => {
      expect(getXPForNextLevel(2)).toBe(400)
    })

    it('should return 900 XP for next level from level 3', () => {
      expect(getXPForNextLevel(3)).toBe(900)
    })
  })

  describe('getProgressToNextLevel', () => {
    it('should calculate progress correctly for 150 XP (level 2)', () => {
      const progress = getProgressToNextLevel(150)

      expect(progress.currentLevel).toBe(2)
      expect(progress.currentLevelXP).toBe(100)
      expect(progress.nextLevelXP).toBe(400)
      expect(progress.progressXP).toBe(50)
      expect(progress.progressPercent).toBeCloseTo(16.67, 1)
    })

    it('should show 0% progress at exact level XP', () => {
      const progress = getProgressToNextLevel(100)

      expect(progress.currentLevel).toBe(2)
      expect(progress.progressXP).toBe(0)
      expect(progress.progressPercent).toBe(0)
    })

    it('should calculate progress for level 1', () => {
      const progress = getProgressToNextLevel(50)

      expect(progress.currentLevel).toBe(1)
      expect(progress.currentLevelXP).toBe(0)
      expect(progress.nextLevelXP).toBe(100)
      expect(progress.progressXP).toBe(50)
      expect(progress.progressPercent).toBe(50)
    })
  })

  describe('checkAchievements', () => {
    it('should award FIRST_CHAPTER badge for first completion', () => {
      const badges = checkAchievements(1, 0, 0, 0, [])
      expect(badges).toContain('FIRST_CHAPTER')
    })

    it('should not award FIRST_CHAPTER if already earned', () => {
      const badges = checkAchievements(1, 0, 0, 0, ['first-chapter'])
      expect(badges).not.toContain('FIRST_CHAPTER')
    })

    it('should award FIVE_CHAPTERS badge at 5 completions', () => {
      const badges = checkAchievements(5, 0, 0, 0, ['first-chapter'])
      expect(badges).toContain('FIVE_CHAPTERS')
    })

    it('should award TEN_CHAPTERS badge at 10 completions', () => {
      const badges = checkAchievements(10, 0, 0, 0, ['first-chapter', 'five-chapters'])
      expect(badges).toContain('TEN_CHAPTERS')
    })

    it('should award WEEK_STREAK badge for 7 day streak', () => {
      const badges = checkAchievements(0, 7, 0, 0, [])
      expect(badges).toContain('WEEK_STREAK')
    })

    it('should award MONTH_STREAK badge for 30 day streak', () => {
      const badges = checkAchievements(0, 30, 0, 0, ['week-streak'])
      expect(badges).toContain('MONTH_STREAK')
    })

    it('should award FIRST_CHALLENGE badge for first challenge', () => {
      const badges = checkAchievements(0, 0, 1, 0, [])
      expect(badges).toContain('FIRST_CHALLENGE')
    })

    it('should award PERFECT_SCORE badge for perfect quiz score', () => {
      const badges = checkAchievements(0, 0, 0, 1, [])
      expect(badges).toContain('PERFECT_SCORE')
    })

    it('should award multiple badges at once', () => {
      const badges = checkAchievements(5, 7, 1, 1, [])
      expect(badges).toContain('FIRST_CHAPTER')
      expect(badges).toContain('FIVE_CHAPTERS')
      expect(badges).toContain('WEEK_STREAK')
      expect(badges).toContain('FIRST_CHALLENGE')
      expect(badges).toContain('PERFECT_SCORE')
    })
  })

  describe('calculateTotalXP', () => {
    it('should calculate XP from chapters only', () => {
      const xp = calculateTotalXP({
        completedChapters: 5,
        completedQuizzes: 0,
        completedChallenges: 0,
        streakBonus: 0,
        badges: [],
      })
      expect(xp).toBe(500) // 5 * 100
    })

    it('should calculate XP from quizzes only', () => {
      const xp = calculateTotalXP({
        completedChapters: 0,
        completedQuizzes: 3,
        completedChallenges: 0,
        streakBonus: 0,
        badges: [],
      })
      expect(xp).toBe(150) // 3 * 50
    })

    it('should calculate XP from challenges only', () => {
      const xp = calculateTotalXP({
        completedChapters: 0,
        completedQuizzes: 0,
        completedChallenges: 2,
        streakBonus: 0,
        badges: [],
      })
      expect(xp).toBe(300) // 2 * 150
    })

    it('should calculate XP from streak bonus', () => {
      const xp = calculateTotalXP({
        completedChapters: 0,
        completedQuizzes: 0,
        completedChallenges: 0,
        streakBonus: 4,
        badges: [],
      })
      expect(xp).toBe(100) // 4 * 25
    })

    it('should calculate XP from badges', () => {
      const xp = calculateTotalXP({
        completedChapters: 0,
        completedQuizzes: 0,
        completedChallenges: 0,
        streakBonus: 0,
        badges: ['first-chapter', 'week-streak'],
      })
      expect(xp).toBe(200) // 50 + 150
    })

    it('should calculate total XP from all sources', () => {
      const xp = calculateTotalXP({
        completedChapters: 5,
        completedQuizzes: 3,
        completedChallenges: 2,
        streakBonus: 4,
        badges: ['first-chapter', 'five-chapters'],
      })
      // chapters: 5 * 100 = 500
      // quizzes: 3 * 50 = 150
      // challenges: 2 * 150 = 300
      // streak: 4 * 25 = 100
      // badges: first-chapter (50) + five-chapters (100) = 150
      // Total: 500 + 150 + 300 + 100 + 150 = 1200
      expect(xp).toBe(1200)
    })
  })

  describe('shouldUpdateStreak', () => {
    it('should increment streak if last activity was yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const result = shouldUpdateStreak(yesterday)
      expect(result.shouldIncrement).toBe(true)
      expect(result.shouldReset).toBe(false)
    })

    it('should not change streak if activity is today', () => {
      const today = new Date()

      const result = shouldUpdateStreak(today)
      expect(result.shouldIncrement).toBe(false)
      expect(result.shouldReset).toBe(false)
    })

    it('should reset streak if no activity for 2+ days', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const result = shouldUpdateStreak(twoDaysAgo)
      expect(result.shouldIncrement).toBe(false)
      expect(result.shouldReset).toBe(true)
    })

    it('should increment streak if no previous activity', () => {
      const result = shouldUpdateStreak(null)
      expect(result.shouldIncrement).toBe(true)
      expect(result.shouldReset).toBe(false)
    })

    it('should handle dates with different times correctly', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(23, 59, 59) // Different time

      const result = shouldUpdateStreak(yesterday)
      expect(result.shouldIncrement).toBe(true)
      expect(result.shouldReset).toBe(false)
    })
  })

  describe('Constants', () => {
    it('should have correct XP constants', () => {
      expect(XP_PER_CHAPTER).toBe(100)
      expect(XP_PER_QUIZ).toBe(50)
      expect(XP_PER_CHALLENGE).toBe(150)
      expect(XP_STREAK_BONUS).toBe(25)
    })

    it('should have all expected badges', () => {
      expect(BADGES.FIRST_CHAPTER).toBeDefined()
      expect(BADGES.FIVE_CHAPTERS).toBeDefined()
      expect(BADGES.TEN_CHAPTERS).toBeDefined()
      expect(BADGES.ALL_CHAPTERS).toBeDefined()
      expect(BADGES.WEEK_STREAK).toBeDefined()
      expect(BADGES.MONTH_STREAK).toBeDefined()
      expect(BADGES.FIRST_CHALLENGE).toBeDefined()
      expect(BADGES.CHALLENGE_MASTER).toBeDefined()
      expect(BADGES.HACKATHON_WINNER).toBeDefined()
      expect(BADGES.GRADUATE).toBeDefined()
      expect(BADGES.SPEED_LEARNER).toBeDefined()
      expect(BADGES.PERFECT_SCORE).toBeDefined()
    })

    it('should have correct badge properties', () => {
      expect(BADGES.FIRST_CHAPTER.id).toBe('first-chapter')
      expect(BADGES.FIRST_CHAPTER.xpReward).toBe(50)
      expect(BADGES.FIRST_CHAPTER.rarity).toBe('common')

      expect(BADGES.ALL_CHAPTERS.rarity).toBe('legendary')
      expect(BADGES.ALL_CHAPTERS.xpReward).toBe(500)
    })
  })
})
