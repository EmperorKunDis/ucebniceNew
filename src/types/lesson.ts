export interface Lesson {
  id: string
  moduleId: string
  number: number
  title: string
  description: string
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xpReward: number
  tags: string[]
  prerequisites?: string[] // lesson IDs
  notebookPath: string // path to .ipynb file in GitHub
  content: {
    theory: string // markdown content
    examples?: string[]
    exercises?: Exercise[]
  }
}

export interface Module {
  id: string
  number: number
  title: string
  description: string
  lessons: Lesson[]
  capstoneProject?: CapstoneProject
}

export interface Exercise {
  id: string
  question: string
  hint?: string
  solution?: string
  testCases?: TestCase[]
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface CapstoneProject {
  id: string
  title: string
  description: string
  requirements: string[]
  xpReward: number
}

export interface LessonProgress {
  lessonId: string
  status: 'not-started' | 'in-progress' | 'completed'
  completedAt?: Date
  xpEarned: number
  timeSpent: number // in seconds
  exercisesCompleted: string[] // exercise IDs
}