import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { claimQuestReward } from '@/lib/quest-tracker'

/**
 * POST /api/quests/claim
 * Claim rewards for a completed quest
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { questId } = body

    if (!questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 })
    }

    const rewards = await claimQuestReward(session.user.id, questId)

    if (!rewards) {
      return NextResponse.json(
        { error: 'Quest nelze claimnout (nedokončen nebo již claimnut)' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      rewards,
    })
  } catch (error) {
    console.error('Error claiming quest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
