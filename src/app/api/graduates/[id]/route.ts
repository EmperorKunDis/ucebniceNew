import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/graduates/[id]
 * Get graduate profile detail
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const graduate = await prisma.graduateProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            xp: true,
            createdAt: true,
            _count: {
              select: {
                completedChapters: true,
                achievements: true,
              },
            },
          },
        },
      },
    })

    if (!graduate) {
      return NextResponse.json({ error: 'Graduate not found' }, { status: 404 })
    }

    // Get hackathon participation and wins
    const hackathonParticipation = await prisma.teamMember.findMany({
      where: {
        userId: graduate.userId,
      },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
              },
            },
            project: {
              select: {
                id: true,
                title: true,
                placement: true,
              },
            },
          },
        },
      },
    })

    const hackathonWins = hackathonParticipation.filter(
      p => p.team.project?.placement && p.team.project.placement <= 3
    ).length

    return NextResponse.json({
      graduate: {
        id: graduate.id,
        userId: graduate.userId,
        user: {
          id: graduate.user.id,
          name: graduate.user.name,
          username: graduate.user.username,
          image: graduate.user.image,
          level: graduate.user.level,
          xp: graduate.user.xp,
          joinedAt: graduate.user.createdAt,
          completedChapters: graduate.user._count.completedChapters,
          achievements: graduate.user._count.achievements,
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
        hackathonWins,
        hackathonHistory: hackathonParticipation.map(p => ({
          hackathonId: p.team.hackathon.id,
          hackathonTitle: p.team.hackathon.title,
          hackathonStatus: p.team.hackathon.status,
          hackathonDate: p.team.hackathon.startDate,
          teamName: p.team.name,
          projectTitle: p.team.project?.title,
          placement: p.team.project?.placement,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching graduate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
