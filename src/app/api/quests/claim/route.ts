import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { claimQuestReward } from '@/lib/quest-tracker'
import { badRequest, serverError, unauthorized } from '@/lib/api-responses'
import { claimQuestSchema, validateAPIRequest } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

/**
 * POST /api/quests/claim
 * Claim rewards for a completed quest
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return unauthorized()
    }

    const validation = await validateAPIRequest(request, claimQuestSchema)
    if (!validation.success) return validation.response

    const rewards = await claimQuestReward(session.user.id, validation.data.questId)

    if (!rewards) {
      return badRequest('Quest nelze claimnout (nedokončen nebo již claimnut)')
    }

    return NextResponse.json({
      success: true,
      rewards,
    })
  } catch (error) {
    console.error('Error claiming quest:', error)
    return serverError()
  }
}
