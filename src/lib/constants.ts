// GitHub konfigurace pro odkazy na repozitář
export const GITHUB_CONFIG = {
  user: 'martinsvanda',
  repo: 'ucebnice-programovani',
  branch: 'main',
  baseUrl: 'https://github.com'
}

// XP odměny za různé akce
export const XP_REWARDS = {
  LESSON_COMPLETE: 100,
  EXERCISE_COMPLETE: 25,
  GLITCH_CHALLENGE: 50,
  STREAK_BONUS: 20,
  PERFECT_QUIZ: 150,
  FIRST_TRY_BONUS: 30
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
    rarity: 'common'
  },
  WEEK_WARRIOR: {
    id: 'week-warrior',
    name: 'Týdenní válečník',
    description: 'Udržel/a jsi 7denní streak',
    icon: '🔥',
    xpReward: 100,
    rarity: 'uncommon'
  },
  
  // Cognitive Glitch odznaky
  GLITCH_HUNTER: {
    id: 'glitch-hunter',
    name: 'Lovec glitchů',
    description: 'Vyřešil/a jsi Cognitive Glitch výzvu',
    icon: '🎯',
    xpReward: 75,
    rarity: 'uncommon'
  },
  GLITCH_MASTER: {
    id: 'glitch-master',
    name: 'Mistr glitchů',
    description: 'Vyřešil/a jsi 10 Cognitive Glitch výzev',
    icon: '🧠',
    xpReward: 200,
    rarity: 'rare'
  },
  
  // Progress odznaky
  HALFWAY_THERE: {
    id: 'halfway-there',
    name: 'Půlka cesty',
    description: 'Dokončil/a jsi 50% kurzu',
    icon: '🌓',
    xpReward: 150,
    rarity: 'uncommon'
  },
  COURSE_COMPLETE: {
    id: 'course-complete',
    name: 'Absolvent',
    description: 'Dokončil/a jsi celý kurz',
    icon: '🎓',
    xpReward: 500,
    rarity: 'legendary'
  },
  
  // Speciální odznaky
  PERFECT_SCORE: {
    id: 'perfect-score',
    name: 'Perfekcionista',
    description: '100% úspěšnost ve všech kvízech modulu',
    icon: '💯',
    xpReward: 120,
    rarity: 'rare'
  },
  SPEED_DEMON: {
    id: 'speed-demon',
    name: 'Rychlík',
    description: 'Dokončil/a jsi lekci pod 10 minut',
    icon: '⚡',
    xpReward: 80,
    rarity: 'uncommon'
  },
  NIGHT_OWL: {
    id: 'night-owl',
    name: 'Noční sova',
    description: 'Studoval/a jsi po půlnoci',
    icon: '🦉',
    xpReward: 60,
    rarity: 'common'
  },
  EARLY_BIRD: {
    id: 'early-bird',
    name: 'Ranní ptáče',
    description: 'Začal/a jsi lekci před 6:00',
    icon: '🐦',
    xpReward: 60,
    rarity: 'common'
  }
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
    advanced: { min: 5, max: 10 }
  }
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
    100: 'AI Architekt'
  }
}

// Barvy pro různé prvky UI
export const COLORS = {
  rarity: {
    common: '#94a3b8', // gray-400
    uncommon: '#22c55e', // green-500
    rare: '#3b82f6', // blue-500
    epic: '#a855f7', // purple-500
    legendary: '#f59e0b' // amber-500
  },
  difficulty: {
    beginner: '#22c55e', // green-500
    intermediate: '#f59e0b', // amber-500
    advanced: '#ef4444' // red-500
  },
  progress: {
    incomplete: '#475569', // gray-600
    inProgress: '#3b82f6', // blue-500
    complete: '#22c55e' // green-500
  }
}