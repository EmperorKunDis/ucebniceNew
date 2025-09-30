import { GLITCH_CONFIG } from './constants';

export interface GlitchChallenge {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hint?: string;
  explanation?: string;
  timeLimit?: number;
}

// Databáze výzev podle kategorií
const challenges: Record<string, GlitchChallenge[]> = {
  ai_basics: [
    {
      id: 'ai_001',
      question: 'Co znamená zkratka AI?',
      options: [
        'Artificial Intelligence',
        'Automated Interface',
        'Advanced Integration',
        'Analytical Insight'
      ],
      correct: 0,
      difficulty: 'easy',
      category: 'ai_basics',
      explanation: 'AI je zkratka pro Artificial Intelligence, česky umělá inteligence.'
    },
    {
      id: 'ai_002',
      question: 'Který z těchto pojmů NENÍ přímo spojen s machine learningem?',
      options: [
        'Supervised learning',
        'Neural networks',
        'Quantum entanglement',
        'Deep learning'
      ],
      correct: 2,
      difficulty: 'medium',
      category: 'ai_basics',
      hint: 'Jeden z pojmů patří do kvantové fyziky.',
      explanation: 'Quantum entanglement je pojem z kvantové fyziky, ne z machine learningu.'
    },
    {
      id: 'ai_003',
      question: 'Jaký je hlavní rozdíl mezi silnou a slabou AI?',
      options: [
        'Silná AI má vědomí, slabá ne',
        'Silná AI je rychlejší',
        'Slabá AI spotřebuje méně energie',
        'Není mezi nimi rozdíl'
      ],
      correct: 0,
      difficulty: 'hard',
      category: 'ai_basics',
      explanation: 'Silná AI (AGI) by měla mít obecnou inteligenci a potenciálně vědomí, zatímco slabá AI řeší specifické úlohy.'
    }
  ],
  algorithms: [
    {
      id: 'algo_001',
      question: 'Jaká je časová složitost algoritmu BFS?',
      options: [
        'O(n)',
        'O(V + E)',
        'O(n log n)',
        'O(n²)'
      ],
      correct: 1,
      difficulty: 'medium',
      category: 'algorithms',
      hint: 'V = počet vrcholů, E = počet hran',
      explanation: 'BFS má časovou složitost O(V + E), kde V je počet vrcholů a E počet hran v grafu.'
    },
    {
      id: 'algo_002',
      question: 'Co je heuristika v kontextu A* algoritmu?',
      options: [
        'Náhodný odhad',
        'Přesná cesta k cíli',
        'Odhad vzdálenosti k cíli',
        'Počet navštívených uzlů'
      ],
      correct: 2,
      difficulty: 'medium',
      category: 'algorithms',
      explanation: 'Heuristika v A* je funkce, která odhaduje vzdálenost od aktuálního uzlu k cíli.'
    }
  ],
  machine_learning: [
    {
      id: 'ml_001',
      question: 'Co je overfitting?',
      options: [
        'Model je příliš jednoduchý',
        'Model se příliš přizpůsobí trénovacím datům',
        'Model je příliš rychlý',
        'Model používá příliš málo dat'
      ],
      correct: 1,
      difficulty: 'medium',
      category: 'machine_learning',
      explanation: 'Overfitting nastává, když se model příliš přizpůsobí trénovacím datům a ztrácí schopnost generalizace.'
    },
    {
      id: 'ml_002',
      question: 'Který algoritmus NENÍ supervizované učení?',
      options: [
        'Lineární regrese',
        'K-means clustering',
        'Random Forest',
        'SVM'
      ],
      correct: 1,
      difficulty: 'hard',
      category: 'machine_learning',
      hint: 'Hledej algoritmus, který nepotřebuje značená data.',
      explanation: 'K-means clustering je algoritmus nesupervizovaného učení, nepotřebuje značená data.'
    }
  ],
  neural_networks: [
    {
      id: 'nn_001',
      question: 'Co dělá aktivační funkce ReLU?',
      options: [
        'max(0, x)',
        'sigmoid(x)',
        'tanh(x)',
        'x²'
      ],
      correct: 0,
      difficulty: 'easy',
      category: 'neural_networks',
      explanation: 'ReLU (Rectified Linear Unit) vrací maximum z 0 a vstupní hodnoty: max(0, x).'
    },
    {
      id: 'nn_002',
      question: 'Co je dropout v neuronových sítích?',
      options: [
        'Chyba v síti',
        'Typ aktivační funkce',
        'Technika regularizace',
        'Způsob inicializace vah'
      ],
      correct: 2,
      difficulty: 'medium',
      category: 'neural_networks',
      hint: 'Pomáhá předcházet overfittingu.',
      explanation: 'Dropout je regularizační technika, která náhodně "vypíná" neurony během trénování.'
    }
  ],
  programming: [
    {
      id: 'prog_001',
      question: 'Jaký je výstup: print(type([]))',
      options: [
        "<class 'list'>",
        "<class 'array'>",
        "<class 'dict'>",
        "list"
      ],
      correct: 0,
      difficulty: 'easy',
      category: 'programming',
      explanation: 'V Pythonu prázdné hranaté závorky [] vytvářejí list objekt.'
    },
    {
      id: 'prog_002',
      question: 'Co je časová složitost přístupu k prvku v Python dictionary?',
      options: [
        'O(1)',
        'O(n)',
        'O(log n)',
        'O(n log n)'
      ],
      correct: 0,
      difficulty: 'medium',
      category: 'programming',
      hint: 'Dictionary používá hash tabulku.',
      explanation: 'Python dictionary má průměrnou časovou složitost O(1) pro přístup k prvkům díky hash tabulce.'
    }
  ]
};

// Získat náhodnou výzvu podle úrovně a kategorie
export function getRandomChallenge(level: number, category?: string): GlitchChallenge {
  // Určit obtížnost podle levelu
  let difficulty: 'easy' | 'medium' | 'hard';
  if (level < 10) {
    difficulty = 'easy';
  } else if (level < 30) {
    difficulty = Math.random() > 0.5 ? 'easy' : 'medium';
  } else {
    difficulty = Math.random() > 0.5 ? 'medium' : 'hard';
  }

  // Získat všechny výzvy odpovídající kritériím
  let availableChallenges: GlitchChallenge[] = [];
  
  if (category) {
    availableChallenges = challenges[category]?.filter(ch => ch.difficulty === difficulty) || [];
  } else {
    // Pokud není specifikována kategorie, vybrat ze všech
    Object.values(challenges).forEach(categoryChalls => {
      availableChallenges.push(...categoryChalls.filter(ch => ch.difficulty === difficulty));
    });
  }

  // Fallback na jakoukoliv výzvu, pokud nejsou žádné s požadovanou obtížností
  if (availableChallenges.length === 0) {
    const allChallenges = Object.values(challenges).flat();
    availableChallenges = allChallenges.filter(ch => category ? ch.category === category : true);
  }

  // Vrátit náhodnou výzvu
  const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
  if (!randomChallenge) {
    // Fallback na první dostupnou výzvu
    return Object.values(challenges).flat()[0] as GlitchChallenge;
  }
  return randomChallenge;
}

// Vypočítat odměnu za glitch
export function calculateGlitchReward(
  challenge: GlitchChallenge,
  baseReward: number,
  streak: number,
  hintUsed: boolean,
  timeElapsed: number
): number {
  let reward = baseReward;

  // Bonus za obtížnost
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  reward *= difficultyMultiplier[challenge.difficulty];

  // Bonus za streak
  reward += streak * 5;

  // Penalizace za použití nápovědy
  if (hintUsed) {
    reward *= 0.7; // -30%
  }

  // Bonus za rychlost (pokud odpověděl do poloviny časového limitu)
  const timeLimit = challenge.timeLimit || GLITCH_CONFIG.TIME_LIMIT;
  if (timeElapsed < timeLimit / 2) {
    reward *= 1.2; // +20%
  }

  // Aplikovat multiplikátor z konfigurace
  reward *= GLITCH_CONFIG.XP_MULTIPLIER;

  return Math.round(reward);
}

// Zkontrolovat, zda může být spuštěn glitch
export function shouldTriggerGlitch(
  completedLessons: number,
  lastGlitchTime?: Date,
  forceChance?: number
): boolean {
  // Kontrola minimálního počtu lekcí
  if (completedLessons < GLITCH_CONFIG.MIN_LESSONS_BEFORE_GLITCH) {
    return false;
  }

  // Kontrola cooldownu
  if (lastGlitchTime) {
    const minutesSinceLastGlitch = (Date.now() - lastGlitchTime.getTime()) / (1000 * 60);
    if (minutesSinceLastGlitch < GLITCH_CONFIG.COOLDOWN_MINUTES) {
      return false;
    }
  }

  // Pravděpodobnostní kontrola
  const chance = forceChance ?? GLITCH_CONFIG.TRIGGER_PROBABILITY;
  return Math.random() < chance;
}

// Získat kategorii podle aktuální lekce
export function getCategoryForLesson(lessonId: string): string {
  // Mapování lekcí na kategorie (můžete rozšířit podle potřeby)
  const lessonNumber = parseInt(lessonId);
  
  if (lessonNumber <= 10) return 'ai_basics';
  if (lessonNumber <= 20) return 'algorithms';
  if (lessonNumber <= 30) return 'machine_learning';
  if (lessonNumber <= 40) return 'neural_networks';
  
  return 'programming'; // default
}

// Export všech výzev pro debugging/admin
export function getAllChallenges(): Record<string, GlitchChallenge[]> {
  return challenges;
}