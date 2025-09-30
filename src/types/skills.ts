export interface SkillNode {
  id: string
  name: string
  category: 'fundamentals' | 'data-structures' | 'algorithms' | 'web' | 'ai-ml' | 'databases'
  level: number // 0-5 (0 = not learned, 5 = mastered)
  x?: number // Position for visualization
  y?: number
  dependencies: string[] // IDs of prerequisite skills
  lessons: string[] // Associated lesson IDs
  description: string
  icon?: string
}

export interface SkillLink {
  source: string
  target: string
  strength: number // 0-1, how strong is the dependency
}

export interface SkillCategory {
  id: string
  name: string
  color: string
  description: string
}

// Skill categories with colors
export const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  fundamentals: {
    id: 'fundamentals',
    name: 'Základy',
    color: '#3B82F6', // blue
    description: 'Základní koncepty programování'
  },
  'data-structures': {
    id: 'data-structures',
    name: 'Datové struktury',
    color: '#10B981', // green
    description: 'Seznamy, slovníky, množiny a další'
  },
  algorithms: {
    id: 'algorithms',
    name: 'Algoritmy',
    color: '#F59E0B', // yellow
    description: 'Řazení, vyhledávání, optimalizace'
  },
  web: {
    id: 'web',
    name: 'Web',
    color: '#EF4444', // red
    description: 'HTTP, API, webové frameworky'
  },
  'ai-ml': {
    id: 'ai-ml',
    name: 'AI & ML',
    color: '#8B5CF6', // purple
    description: 'Strojové učení a umělá inteligence'
  },
  databases: {
    id: 'databases',
    name: 'Databáze',
    color: '#EC4899', // pink
    description: 'SQL, NoSQL, datové modelování'
  }
}