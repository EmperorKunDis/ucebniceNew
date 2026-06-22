import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnalyticsEventType } from '@prisma/client'

/**
 * POST /api/analytics/event
 * Track an analytics event
 */
export async function POST(request: NextRequest) {
  try {
    // Auth is optional for analytics - can track anonymous users
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    const body = await request.json()
    const { type, data, page, sessionId } = body

    // Validate event type
    const validTypes = Object.values(AnalyticsEventType)
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') ?? undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() ?? undefined

    // Create event
    await prisma.analyticsEvent.create({
      data: {
        userId,
        type: type as AnalyticsEventType,
        data: data ?? {},
        page: page ?? null,
        sessionId: sessionId ?? null,
        userAgent,
        ip,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking analytics event:', error)
    // Don't fail the request for analytics errors
    return NextResponse.json({ success: true })
  }
}
