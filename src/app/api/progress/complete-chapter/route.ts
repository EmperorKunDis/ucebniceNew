import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** @deprecated Use /api/micro-lessons/lesson/:id/complete. */
export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    {
      error: 'Legacy chapter completion is read-only',
      canonicalEndpoint: '/api/micro-lessons/lesson/:lessonId/complete',
    },
    { status: 410 }
  )
}
