import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/graduates
 * Get public list of graduates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const lookingForWork = searchParams.get('lookingForWork')
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (lookingForWork === 'true') {
      where.lookingForWork = true
    }

    const graduates = await prisma.graduateProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { graduatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            xp: true,
          },
        },
      },
    })

    // Get team member info to map wins to users
    const graduateIds = graduates.map(g => g.userId)
    const teamsWithWins = await prisma.teamMember.findMany({
      where: {
        userId: { in: graduateIds },
        team: {
          project: {
            placement: { lte: 3 },
          },
        },
      },
      select: {
        userId: true,
        teamId: true,
      },
    })

    const winsMap = new Map<string, number>()
    teamsWithWins.forEach(tm => {
      winsMap.set(tm.userId, (winsMap.get(tm.userId) || 0) + 1)
    })

    // Filter by skills if provided
    let filteredGraduates = graduates
    if (skills.length > 0) {
      filteredGraduates = graduates.filter(g => {
        const gradSkills = g.skills as string[]
        return skills.some(skill =>
          gradSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      })
    }

    const total = await prisma.graduateProfile.count({ where })

    return NextResponse.json({
      graduates: filteredGraduates.map(graduate => ({
        id: graduate.id,
        userId: graduate.userId,
        user: {
          id: graduate.user.id,
          name: graduate.user.name,
          username: graduate.user.username,
          image: graduate.user.image,
          level: graduate.user.level,
          xp: graduate.user.xp,
        },
        bio: graduate.bio,
        graduatedAt: graduate.graduatedAt,
        certificateId: graduate.certificateId,
        skills: graduate.skills,
        portfolio: graduate.portfolio,
        linkedIn: graduate.linkedIn,
        github: graduate.github,
        website: graduate.website,
        lookingForWork: graduate.lookingForWork,
        preferredRoles: graduate.preferredRoles,
        hackathonWins: winsMap.get(graduate.userId) || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching graduates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
