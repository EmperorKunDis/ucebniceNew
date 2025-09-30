import { SkillNode, SkillLink } from '@/types/skills'

export const skillNodes: SkillNode[] = [
  // Fundamentals
  {
    id: 'variables',
    name: 'Proměnné',
    category: 'fundamentals',
    level: 0,
    dependencies: [],
    lessons: ['lesson-1'],
    description: 'Základy ukládání dat do proměnných',
    icon: '📦'
  },
  {
    id: 'data-types',
    name: 'Datové typy',
    category: 'fundamentals',
    level: 0,
    dependencies: ['variables'],
    lessons: ['lesson-2'],
    description: 'String, number, boolean a další',
    icon: '🔤'
  },
  {
    id: 'operators',
    name: 'Operátory',
    category: 'fundamentals',
    level: 0,
    dependencies: ['variables'],
    lessons: ['lesson-3'],
    description: 'Aritmetické, logické a porovnávací operátory',
    icon: '➕'
  },
  {
    id: 'conditions',
    name: 'Podmínky',
    category: 'fundamentals',
    level: 0,
    dependencies: ['data-types', 'operators'],
    lessons: ['lesson-4'],
    description: 'If, else, elif podmínky',
    icon: '🔀'
  },
  {
    id: 'loops',
    name: 'Cykly',
    category: 'fundamentals',
    level: 0,
    dependencies: ['conditions'],
    lessons: ['lesson-5'],
    description: 'For a while cykly',
    icon: '🔁'
  },
  {
    id: 'functions',
    name: 'Funkce',
    category: 'fundamentals',
    level: 0,
    dependencies: ['loops'],
    lessons: ['lesson-6'],
    description: 'Definice a volání funkcí',
    icon: '🎯'
  },
  
  // Data Structures
  {
    id: 'lists',
    name: 'Seznamy',
    category: 'data-structures',
    level: 0,
    dependencies: ['loops'],
    lessons: ['lesson-7'],
    description: 'Práce se seznamy a poli',
    icon: '📋'
  },
  {
    id: 'dictionaries',
    name: 'Slovníky',
    category: 'data-structures',
    level: 0,
    dependencies: ['lists'],
    lessons: ['lesson-8'],
    description: 'Klíč-hodnota datové struktury',
    icon: '📖'
  },
  {
    id: 'tuples-sets',
    name: 'N-tice a množiny',
    category: 'data-structures',
    level: 0,
    dependencies: ['lists'],
    lessons: ['lesson-9'],
    description: 'Immutable a unique kolekce',
    icon: '🎲'
  },
  
  // Algorithms
  {
    id: 'searching',
    name: 'Vyhledávání',
    category: 'algorithms',
    level: 0,
    dependencies: ['lists', 'functions'],
    lessons: ['lesson-11'],
    description: 'Lineární a binární vyhledávání',
    icon: '🔍'
  },
  {
    id: 'sorting',
    name: 'Řazení',
    category: 'algorithms',
    level: 0,
    dependencies: ['searching'],
    lessons: ['lesson-12'],
    description: 'Bubble sort, quicksort a další',
    icon: '📊'
  },
  {
    id: 'recursion',
    name: 'Rekurze',
    category: 'algorithms',
    level: 0,
    dependencies: ['functions'],
    lessons: ['lesson-13'],
    description: 'Funkce volající samy sebe',
    icon: '🌀'
  },
  {
    id: 'graph-algorithms',
    name: 'Grafové algoritmy',
    category: 'algorithms',
    level: 0,
    dependencies: ['dictionaries', 'recursion'],
    lessons: ['lesson-14'],
    description: 'BFS, DFS, shortest path',
    icon: '🕸️'
  },
  
  // Web
  {
    id: 'http-basics',
    name: 'HTTP základy',
    category: 'web',
    level: 0,
    dependencies: ['dictionaries', 'functions'],
    lessons: ['lesson-20'],
    description: 'Request, response, metody',
    icon: '🌐'
  },
  {
    id: 'api-requests',
    name: 'API požadavky',
    category: 'web',
    level: 0,
    dependencies: ['http-basics'],
    lessons: ['lesson-21'],
    description: 'REST API a práce s JSON',
    icon: '📡'
  },
  {
    id: 'web-frameworks',
    name: 'Webové frameworky',
    category: 'web',
    level: 0,
    dependencies: ['api-requests'],
    lessons: ['lesson-22'],
    description: 'Flask, FastAPI základy',
    icon: '🏗️'
  },
  
  // AI & ML
  {
    id: 'numpy-basics',
    name: 'NumPy',
    category: 'ai-ml',
    level: 0,
    dependencies: ['lists'],
    lessons: ['lesson-25'],
    description: 'Numerické výpočty s NumPy',
    icon: '🔢'
  },
  {
    id: 'pandas-basics',
    name: 'Pandas',
    category: 'ai-ml',
    level: 0,
    dependencies: ['numpy-basics', 'dictionaries'],
    lessons: ['lesson-26'],
    description: 'Práce s daty pomocí Pandas',
    icon: '🐼'
  },
  {
    id: 'ml-basics',
    name: 'ML základy',
    category: 'ai-ml',
    level: 0,
    dependencies: ['pandas-basics'],
    lessons: ['lesson-27'],
    description: 'Supervised a unsupervised učení',
    icon: '🤖'
  },
  {
    id: 'neural-networks',
    name: 'Neuronové sítě',
    category: 'ai-ml',
    level: 0,
    dependencies: ['ml-basics'],
    lessons: ['lesson-28'],
    description: 'Základy deep learning',
    icon: '🧠'
  },
  
  // Databases
  {
    id: 'sql-basics',
    name: 'SQL základy',
    category: 'databases',
    level: 0,
    dependencies: ['dictionaries'],
    lessons: ['lesson-30'],
    description: 'SELECT, INSERT, UPDATE, DELETE',
    icon: '🗄️'
  },
  {
    id: 'database-design',
    name: 'Návrh databází',
    category: 'databases',
    level: 0,
    dependencies: ['sql-basics'],
    lessons: ['lesson-31'],
    description: 'Normalizace, relace, indexy',
    icon: '📐'
  }
]

export const skillLinks: SkillLink[] = skillNodes.reduce((links, node) => {
  const nodeLinks = node.dependencies.map(dep => ({
    source: dep,
    target: node.id,
    strength: 0.8
  }))
  return [...links, ...nodeLinks]
}, [] as SkillLink[])