export interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'active' | 'completed'
  prizes: Prize[]
  judges: Judge[]
  sponsors: string[]
  maxTeamSize: number
  registrationDeadline: Date
  bannerImage?: string
}

export interface Prize {
  place: number
  title: string
  description: string
  value: string
}

export interface Judge {
  id: string
  name: string
  title: string
  company: string
  avatar?: string
  bio: string
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
  hackathonId: string
  projectId?: string
  createdAt: Date
}

export interface TeamMember {
  userId: string
  username: string
  role: 'leader' | 'member'
  skills: string[]
}

export interface Project {
  id: string
  teamId: string
  hackathonId: string
  title: string
  description: string
  githubUrl: string
  demoUrl?: string
  videoUrl?: string
  screenshots: string[]
  technologies: string[]
  submittedAt: Date
  score?: number
  feedback?: JudgeFeedback[]
  placement?: number
}

export interface JudgeFeedback {
  judgeId: string
  score: number
  comments: string
  categories: {
    innovation: number
    technical: number
    presentation: number
    impact: number
  }
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  url: string
  type: 'project' | 'article' | 'presentation' | 'certificate'
  thumbnail?: string
  technologies: string[]
}

export interface Graduate {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string
  bio: string
  graduatedAt: Date
  certificateId: string
  skills: string[]
  portfolio: PortfolioItem[]
  hackathonWins: number
  linkedIn?: string
  github?: string
  website?: string
  lookingForWork: boolean
  preferredRoles: string[]
}