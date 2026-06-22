'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import for better code splitting
const ReviewSession = dynamic(
  () => import('@/components/learning/review').then(mod => mod.ReviewSession),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    ),
  }
)

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8">
      <ReviewSession />
    </div>
  )
}
