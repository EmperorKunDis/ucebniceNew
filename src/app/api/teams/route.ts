import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, createTeamSchema } from '@/lib/validation-schemas'

/**
 * GET /api/teams
 * Get current user's teams
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      teams: teams.map(team => {
        const userMembership = team.members.find(m => m.userId === session.user.id)
        return {
          id: team.id,
          name: team.name,
          hackathon: team.hackathon,
          memberCount: team.members.length,
          members: team.members.map(m => ({
            id: m.id,
            role: m.role,
            skills: m.skills,
            user: m.user,
          })),
          hasProject: !!team.project,
          project: team.project,
          myRole: userMembership?.role || 'member',
        }
      }),
    })
  } catch (error) {
    console.error('Error fetching user teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/teams
 * Create a new team for a hackathon
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = await validateAPIRequest(request, createTeamSchema)
    if (!validation.success) return validation.response

    const { name, hackathonId } = validation.data

    // Check hackathon exists and is open for registration
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon nenalezen' }, { status: 404 })
    }

    if (hackathon.status === 'completed') {
      return NextResponse.json({ error: 'Hackathon již skončil' }, { status: 400 })
    }

    if (new Date() > hackathon.registrationDeadline) {
      return NextResponse.json({ error: 'Registrace již byla uzavřena' }, { status: 400 })
    }

    // Check user is not already in a team for this hackathon
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        team: {
          hackathonId,
        },
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Již jsi členem týmu v tomto hackathonu' }, { status: 400 })
    }

    // Check team name is unique for this hackathon
    const existingTeam = await prisma.team.findFirst({
      where: {
        hackathonId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })

    if (existingTeam) {
      return NextResponse.json({ error: 'Tým s tímto názvem již existuje' }, { status: 400 })
    }

    // Create team with user as leader
    const team = await prisma.team.create({
      data: {
        name,
        hackathonId,
        members: {
          create: {
            userId: session.user.id,
            role: 'leader',
          },
        },
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
