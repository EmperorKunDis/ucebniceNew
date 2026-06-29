import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, submitHackathonProjectSchema } from '@/lib/validation-schemas'

/**
 * POST /api/teams/[id]/project
 * Submit project for hackathon
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            hackathon: true,
            project: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nejsi členem tohoto týmu' }, { status: 403 })
    }

    // Check hackathon status
    if (membership.team.hackathon.status === 'completed') {
      return NextResponse.json({ error: 'Hackathon již skončil' }, { status: 400 })
    }

    if (membership.team.hackathon.status === 'upcoming') {
      return NextResponse.json({ error: 'Hackathon ještě nezačal' }, { status: 400 })
    }

    // Check if project already exists
    if (membership.team.project) {
      return NextResponse.json(
        { error: 'Projekt již byl odevzdán. Použij PUT pro aktualizaci.' },
        { status: 400 }
      )
    }

    const validation = await validateAPIRequest(request, submitHackathonProjectSchema)
    if (!validation.success) return validation.response

    const data = validation.data

    const project = await prisma.hackathonProject.create({
      data: {
        teamId: id,
        hackathonId: membership.team.hackathonId,
        title: data.title,
        description: data.description,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        videoUrl: data.videoUrl,
        screenshots: data.screenshots,
        technologies: data.technologies,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Error submitting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/teams/[id]/project
 * Update submitted project
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            hackathon: true,
            project: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Nejsi členem tohoto týmu' }, { status: 403 })
    }

    // Check hackathon status
    if (membership.team.hackathon.status === 'completed') {
      return NextResponse.json(
        { error: 'Hackathon již skončil, projekt nelze upravit' },
        { status: 400 }
      )
    }

    // Check if project exists
    if (!membership.team.project) {
      return NextResponse.json(
        { error: 'Projekt nebyl odevzdán. Použij POST pro vytvoření.' },
        { status: 400 }
      )
    }

    const validation = await validateAPIRequest(request, submitHackathonProjectSchema)
    if (!validation.success) return validation.response

    const data = validation.data

    const project = await prisma.hackathonProject.update({
      where: { id: membership.team.project.id },
      data: {
        title: data.title,
        description: data.description,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        videoUrl: data.videoUrl,
        screenshots: data.screenshots,
        technologies: data.technologies,
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
