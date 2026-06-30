import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/hackathons
 * Get public list of hackathons
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status && ['upcoming', 'active', 'completed'].includes(status)) {
      where.status = status
    }

    const hackathons = await prisma.hackathon.findMany({
      where,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: {
            teams: true,
          },
        },
      },
    })

    return NextResponse.json({
      hackathons: hackathons.map(hackathon => ({
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        theme: hackathon.theme,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        status: hackathon.status,
        maxTeamSize: hackathon.maxTeamSize,
        registrationDeadline: hackathon.registrationDeadline,
        bannerImage: hackathon.bannerImage,
        prizes: hackathon.prizes,
        judges: hackathon.judges,
        sponsors: hackathon.sponsors,
        teamCount: hackathon._count.teams,
      })),
    })
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
