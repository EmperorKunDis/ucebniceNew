// GitHub konfigurace pro odkazy na repozitář
export const GITHUB_CONFIG = {
  user: 'EmperorKunDis',
  repo: 'JupyterNotebooks',
  branch: 'main',
  baseUrl: 'https://github.com',
}

// XP odměny za různé akce
export const XP_REWARDS = {
  LESSON_COMPLETE: 100,
  EXERCISE_COMPLETE: 25,
  GLITCH_CHALLENGE: 50,
  STREAK_BONUS: 20,
  PERFECT_QUIZ: 150,
  FIRST_TRY_BONUS: 30,
}

// Definice odznaků a achievementů
export const BADGES = {
  // Začátečnické odznaky
  FIRST_STEP: {
    id: 'first-step',
    name: 'První krok',
    description: 'Dokončil/a jsi svou první lekci',
    icon: '👣',
    xpReward: 50,
    rarity: 'common',
  },
  WEEK_WARRIOR: {
    id: 'week-warrior',
    name: 'Týdenní válečník',
    description: 'Udržel/a jsi 7denní streak',
    icon: '🔥',
    xpReward: 100,
    rarity: 'uncommon',
  },

  // Cognitive Glitch odznaky
  GLITCH_HUNTER: {
    id: 'glitch-hunter',
    name: 'Lovec glitchů',
    description: 'Vyřešil/a jsi Cognitive Glitch výzvu',
    icon: '🎯',
    xpReward: 75,
    rarity: 'uncommon',
  },
  GLITCH_MASTER: {
    id: 'glitch-master',
    name: 'Mistr glitchů',
    description: 'Vyřešil/a jsi 10 Cognitive Glitch výzev',
    icon: '🧠',
    xpReward: 200,
    rarity: 'rare',
  },

  // Progress odznaky
  HALFWAY_THERE: {
    id: 'halfway-there',
    name: 'Půlka cesty',
    description: 'Dokončil/a jsi 50% kurzu',
    icon: '🌓',
    xpReward: 150,
    rarity: 'uncommon',
  },
  COURSE_COMPLETE: {
    id: 'course-complete',
    name: 'Absolvent',
    description: 'Dokončil/a jsi celý kurz',
    icon: '🎓',
    xpReward: 500,
    rarity: 'legendary',
  },

  // Speciální odznaky
  PERFECT_SCORE: {
    id: 'perfect-score',
    name: 'Perfekcionista',
    description: '100% úspěšnost ve všech kvízech modulu',
    icon: '💯',
    xpReward: 120,
    rarity: 'rare',
  },
  SPEED_DEMON: {
    id: 'speed-demon',
    name: 'Rychlík',
    description: 'Dokončil/a jsi lekci pod 10 minut',
    icon: '⚡',
    xpReward: 80,
    rarity: 'uncommon',
  },
  NIGHT_OWL: {
    id: 'night-owl',
    name: 'Noční sova',
    description: 'Studoval/a jsi po půlnoci',
    icon: '🦉',
    xpReward: 60,
    rarity: 'common',
  },
  EARLY_BIRD: {
    id: 'early-bird',
    name: 'Ranní ptáče',
    description: 'Začal/a jsi lekci před 6:00',
    icon: '🐦',
    xpReward: 60,
    rarity: 'common',
  },
}

// Konfigurace Cognitive Glitch systému
export const GLITCH_CONFIG = {
  TRIGGER_PROBABILITY: 0.1, // 10% šance na spuštění
  XP_MULTIPLIER: 2, // Dvojnásobek XP za správnou odpověď
  TIME_LIMIT: 120, // 2 minuty na odpověď
  MIN_LESSONS_BEFORE_GLITCH: 3, // Minimální počet lekcí před prvním glitchem
  COOLDOWN_MINUTES: 30, // Čas mezi glitchi
  DIFFICULTY_SCALING: {
    beginner: { min: 1, max: 3 },
    intermediate: { min: 3, max: 6 },
    advanced: { min: 5, max: 10 },
  },
}

// Level systém
export const LEVEL_CONFIG = {
  XP_PER_LEVEL: 1000,
  LEVEL_MULTIPLIER: 1.2, // Každý level vyžaduje o 20% více XP
  MAX_LEVEL: 100,
  LEVEL_NAMES: {
    0: 'Začátečník',
    5: 'Učedník',
    10: 'Student',
    20: 'Pokročilý',
    30: 'Expert',
    40: 'Mistr',
    50: 'Guru',
    60: 'Sensei',
    70: 'Legenda',
    80: 'Mýtus',
    90: 'Transcendent',
    100: 'AI Architekt',
  },
}

// Barvy pro různé prvky UI
export const COLORS = {
  rarity: {
    common: '#94a3b8', // gray-400
    uncommon: '#22c55e', // green-500
    rare: '#3b82f6', // blue-500
    epic: '#a855f7', // purple-500
    legendary: '#f59e0b', // amber-500
  },
  difficulty: {
    beginner: '#22c55e', // green-500
    intermediate: '#f59e0b', // amber-500
    advanced: '#ef4444', // red-500
  },
  progress: {
    incomplete: '#475569', // gray-600
    inProgress: '#3b82f6', // blue-500
    complete: '#22c55e', // green-500
  },
}

// ========================================
// PAGINATION & API LIMITS
// ========================================

export const PAGINATION = {
  /** Default number of items per page */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum items per page */
  MAX_PAGE_SIZE: 100,
  /** Default limit for achievements in stats API */
  ACHIEVEMENTS_LIMIT: 10,
  /** Default limit for progress items in stats API */
  PROGRESS_LIMIT: 20,
  /** Default limit for recent completions */
  RECENT_COMPLETIONS_LIMIT: 5,
  /** Maximum recent completions to fetch */
  MAX_RECENT_COMPLETIONS: 20,
  /** Leaderboard items per page */
  LEADERBOARD_SIZE: 100,
} as const

// ========================================
// RATE LIMITING
// ========================================

export const RATE_LIMITS = {
  /** API requests per hour per user */
  API_REQUESTS_PER_HOUR: 100,
  /** Authentication attempts per hour per IP */
  AUTH_ATTEMPTS_PER_HOUR: 10,
  /** Password reset requests per hour per email */
  PASSWORD_RESET_PER_HOUR: 3,
} as const

// ========================================
// VALIDATION RULES
// ========================================

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
    REQUIRE_UPPERCASE: false,
    REQUIRE_NUMBER: false,
    REQUIRE_SPECIAL_CHAR: false,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-z0-9]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+$/,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
} as const

// ========================================
// TIME & DATES
// ========================================

export const TIME = {
  /** Milliseconds in one day */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  /** Milliseconds in one hour */
  ONE_HOUR_MS: 60 * 60 * 1000,
  /** Milliseconds in one week */
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  /** Milliseconds in 30 days (approximate month) */
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
  /** Toast notification duration in ms */
  TOAST_DURATION: 4000,
  /** Redirect delay after success in ms */
  REDIRECT_DELAY: 1000,
} as const

// ========================================
// LEADERBOARD
// ========================================

export const LEADERBOARD = {
  PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ALL_TIME: 'all-time',
  },
  /** Number of top users to display */
  TOP_USERS_COUNT: 100,
} as const

// ========================================
// XP & ACHIEVEMENTS (Extended)
// ========================================

export const XP = {
  /** XP awarded for completing onboarding */
  ONBOARDING_COMPLETE: 50,
  /** XP awarded per chapter completion */
  PER_CHAPTER: 100,
  /** XP divisor for level calculation (level = sqrt(xp / XP_PER_LEVEL) + 1) */
  PER_LEVEL: 100,
} as const

export const BADGE_IDS = {
  ONBOARDING_COMPLETE: 'onboarding-complete',
  FIRST_CHAPTER: 'first-chapter',
  STREAK_7: 'streak-7',
  STREAK_30: 'streak-30',
  CHAPTERS_10: 'chapters-10',
} as const

// ========================================
// ERROR & SUCCESS MESSAGES (Czech)
// ========================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Nejste přihlášeni',
  FORBIDDEN: 'Nemáte oprávnění k této akci',
  NOT_FOUND: 'Požadovaný zdroj nebyl nalezen',
  INTERNAL_ERROR: 'Něco se pokazilo. Zkuste to znovu.',
  VALIDATION_ERROR: 'Opravte prosím chyby ve formuláři',
  RATE_LIMIT: 'Příliš mnoho požadavků. Zkuste to později.',
  NETWORK_ERROR: 'Chyba připojení. Zkontrolujte internetové připojení.',
} as const

export const SUCCESS_MESSAGES = {
  CHAPTER_COMPLETE: 'Kapitola dokončena! 🎉',
  ONBOARDING_COMPLETE: 'Gratulujeme! Onboarding dokončen!',
  PROFILE_UPDATED: 'Profil byl úspěšně aktualizován',
  LOGIN_SUCCESS: 'Přihlášení úspěšné!',
  LOGOUT_SUCCESS: 'Byli jste úspěšně odhlášeni',
  ACHIEVEMENT_UNLOCKED: 'Nový odznak odemčen!',
} as const

// ========================================
// ROUTES
// ========================================

export const ROUTES = {
  HOME: '/',
  CHAPTERS: '/chapters',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
  ACHIEVEMENTS: '/achievements',
  ARENA: '/arena',
  CERTIFICATE: '/certificate',
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
  },
  ONBOARDING: '/onboarding',
  API: {
    ONBOARDING_COMPLETE: '/api/onboarding/complete',
    COMPLETE_CHAPTER: '/api/progress/complete-chapter',
    USER_STATS: '/api/user/stats',
    LEADERBOARD: '/api/leaderboard',
  },
} as const

// ========================================
// TYPE EXPORTS
// ========================================

export type LeaderboardPeriod = keyof typeof LEADERBOARD.PERIODS
export type BadgeId = (typeof BADGE_IDS)[keyof typeof BADGE_IDS]
