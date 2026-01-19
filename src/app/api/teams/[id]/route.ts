import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, updateTeamSchema } from '@/lib/validation-schemas'

/**
 * GET /api/teams/[id]
 * Get team detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            maxTeamSize: true,
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
        project: true,
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/teams/[id]
 * Update team (leader only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check user is team leader
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: session.user.id,
      },
      include: {
        team: {
          include: {
            hackathon: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nejsi členem tohoto týmu' }, { status: 403 })
    }

    if (membership.role !== 'leader') {
      return NextResponse.json(
        { error: 'Pouze vedoucí týmu může upravovat tým' },
        { status: 403 }
      )
    }

    const validation = await validateAPIRequest(request, updateTeamSchema)
    if (!validation.success) return validation.response

    const { name } = validation.data

    // Check team name is unique if changed
    if (name) {
      const existingTeam = await prisma.team.findFirst({
        where: {
          hackathonId: membership.team.hackathonId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
      })

      if (existingTeam) {
        return NextResponse.json(
          { error: 'Tým s tímto názvem již existuje' },
          { status: 400 }
        )
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: name ? { name } : {},
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

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/teams/[id]
 * Leave team (or delete if leader and only member)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check user is team member
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: session.user.id,
      },
      include: {
        team: {
          include: {
            members: true,
            hackathon: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nejsi členem tohoto týmu' }, { status: 403 })
    }

    // If hackathon is completed, don't allow leaving
    if (membership.team.hackathon.status === 'completed') {
      return NextResponse.json(
        { error: 'Nelze opustit tým po ukončení hackathonu' },
        { status: 400 }
      )
    }

    // If user is leader and there are other members, transfer leadership
    if (membership.role === 'leader' && membership.team.members.length > 1) {
      const newLeader = membership.team.members.find(
        m => m.userId !== session.user.id
      )
      if (newLeader) {
        await prisma.teamMember.update({
          where: { id: newLeader.id },
          data: { role: 'leader' },
        })
      }
    }

    // Remove user from team
    await prisma.teamMember.delete({
      where: { id: membership.id },
    })

    // If team is now empty, delete it
    const remainingMembers = await prisma.teamMember.count({
      where: { teamId: id },
    })

    if (remainingMembers === 0) {
      await prisma.team.delete({
        where: { id },
      })
      return NextResponse.json({ success: true, teamDeleted: true })
    }

    return NextResponse.json({ success: true, teamDeleted: false })
  } catch (error) {
    console.error('Error leaving team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
