import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, joinTeamSchema } from '@/lib/validation-schemas'

/**
 * POST /api/teams/[id]/join
 * Join an existing team
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const validation = await validateAPIRequest(request, joinTeamSchema)
    if (!validation.success) return validation.response

    const { skills } = validation.data

    // Get team with hackathon info
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        hackathon: true,
        members: true,
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Tým nenalezen' }, { status: 404 })
    }

    // Check hackathon is open for registration
    if (team.hackathon.status === 'completed') {
      return NextResponse.json({ error: 'Hackathon již skončil' }, { status: 400 })
    }

    if (new Date() > team.hackathon.registrationDeadline) {
      return NextResponse.json({ error: 'Registrace již byla uzavřena' }, { status: 400 })
    }

    // Check team is not full
    if (team.members.length >= team.hackathon.maxTeamSize) {
      return NextResponse.json({ error: 'Tým je plný' }, { status: 400 })
    }

    // Check user is not already in a team for this hackathon
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        team: {
          hackathonId: team.hackathonId,
        },
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Již jsi členem týmu v tomto hackathonu' }, { status: 400 })
    }

    // Add user to team
    const membership = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: session.user.id,
        role: 'member',
        skills,
      },
      include: {
        team: {
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
        },
      },
    })

    return NextResponse.json({ team: membership.team }, { status: 201 })
  } catch (error) {
    console.error('Error joining team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
