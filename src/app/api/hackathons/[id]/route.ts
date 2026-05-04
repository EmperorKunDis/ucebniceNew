import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/hackathons/[id]
 * Get public hackathon detail with teams
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
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
                description: true,
                technologies: true,
                placement: true,
              },
            },
          },
        },
        projects: {
          where: {
            placement: { not: null },
          },
          orderBy: { placement: 'asc' },
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    return NextResponse.json({
      hackathon: {
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
        teams: hackathon.teams.map(team => ({
          id: team.id,
          name: team.name,
          memberCount: team.members.length,
          members: team.members.map(member => ({
            id: member.id,
            role: member.role,
            skills: member.skills,
            user: {
              id: member.user.id,
              name: member.user.name,
              username: member.user.username,
              image: member.user.image,
            },
          })),
          hasProject: !!team.project,
          project: team.project
            ? {
                id: team.project.id,
                title: team.project.title,
                description: team.project.description,
                technologies: team.project.technologies,
                placement: team.project.placement,
              }
            : null,
        })),
        winners: hackathon.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          placement: project.placement,
          teamName: project.team.name,
          teamId: project.team.id,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
