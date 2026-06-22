'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import for skill tree
const SkillTreeContainer = dynamic(
  () => import('@/components/learning/skill-tree').then(mod => mod.SkillTreeContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <SkillTreeContainer />
    </div>
  )
}
