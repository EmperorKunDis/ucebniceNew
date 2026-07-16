import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** @deprecated Exercise completion is derived from canonical ExerciseProgress. */
export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    {
      error: 'Legacy question completion is read-only',
      canonicalEndpoint: '/api/exercises/:exerciseId/answer',
    },
    { status: 410 }
  )
}
