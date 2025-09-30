import { Lesson, Module } from '@/types/lesson'

// Mock data - should be fetched from API in production
const mockModules: Module[] = [
  {
    id: 'module-1',
    number: 1,
    title: 'Úvod do AI',
    description: 'Základní koncepty umělé inteligence a její historie',
    lessons: [
      {
        id: 'lesson-1',
        moduleId: 'module-1',
        number: 1,
        title: 'Co je AI?',
        description: 'Úvod do umělé inteligence a její definice',
        duration: 30,
        difficulty: 'beginner',
        xpReward: 100,
        tags: ['AI', 'úvod', 'teorie'],
        notebookPath: 'lessons/module-1/AI_Zaklady_Hodina_01.ipynb',
        content: {
          theory: `
# Co je umělá inteligence?

Umělá inteligence (AI) je obor informatiky, který se zabývá vytvářením inteligentních strojů schopných vykonávat úkoly, které běžně vyžadují lidskou inteligenci.

## Klíčové koncepty

1. **Strojové učení** - Schopnost systémů učit se z dat
2. **Neuronové sítě** - Inspirované lidským mozkem
3. **Zpracování přirozeného jazyka** - Porozumění lidské řeči

## Příklady použití

- Rozpoznávání obrazu
- Překládání jazyků
- Autonomní vozidla
- Osobní asistenti (Siri, Alexa)
          `,
          examples: [
            '# Jednoduchý příklad klasifikace\nimport numpy as np\n\n# Data\nX = np.array([[1, 2], [2, 3], [3, 4]])\ny = np.array([0, 0, 1])',
          ],
          exercises: [
            {
              id: 'ex-1',
              question: 'Napište funkci, která vrátí True pokud je číslo sudé, jinak False',
              hint: 'Použijte operátor % (modulo)',
              solution: 'def je_sude(cislo):\n    return cislo % 2 == 0',
            }
          ]
        }
      },
      {
        id: 'lesson-2',
        moduleId: 'module-1',
        number: 2,
        title: 'Historie AI',
        description: 'Vývoj umělé inteligence od počátků po současnost',
        duration: 45,
        difficulty: 'beginner',
        xpReward: 100,
        tags: ['AI', 'historie'],
        prerequisites: ['lesson-1'],
        notebookPath: 'lessons/module-1/AI_Zaklady_Hodina_02.ipynb',
        content: {
          theory: '# Historie AI\n\nHistorie umělé inteligence sahá až do 50. let 20. století...',
        }
      }
    ],
    capstoneProject: {
      id: 'capstone-1',
      title: 'Vytvoř svého prvního chatbota',
      description: 'Implementujte jednoduchého chatbota pomocí pravidel',
      requirements: [
        'Bot musí odpovídat na alespoň 10 různých otázek',
        'Použití podmínek a cyklů',
        'Implementace jednoduché paměti konverzace'
      ],
      xpReward: 500
    }
  },
  {
    id: 'module-2',
    number: 2,
    title: 'Algoritmy a hledání',
    description: 'Základní algoritmy pro řešení problémů a hledání',
    lessons: []
  }
]

export const lessonService = {
  async getAllModules(): Promise<Module[]> {
    // In production, this would fetch from API
    return mockModules
  },

  async getModule(moduleId: string): Promise<Module | null> {
    const module = mockModules.find(m => m.id === moduleId)
    return module || null
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    for (const module of mockModules) {
      const lesson = module.lessons.find(l => l.id === lessonId)
      if (lesson) return lesson
    }
    return null
  },

  async getNextLesson(currentLessonId: string): Promise<Lesson | null> {
    let foundCurrent = false
    
    for (const module of mockModules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) return lesson
        if (lesson.id === currentLessonId) foundCurrent = true
      }
    }
    
    return null
  },

  async getPreviousLesson(currentLessonId: string): Promise<Lesson | null> {
    let previousLesson: Lesson | null = null
    
    for (const module of mockModules) {
      for (const lesson of module.lessons) {
        if (lesson.id === currentLessonId) return previousLesson
        previousLesson = lesson
      }
    }
    
    return null
  }
}