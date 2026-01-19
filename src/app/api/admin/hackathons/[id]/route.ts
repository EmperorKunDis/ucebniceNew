import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, updateHackathonSchema } from '@/lib/validation-schemas'

/**
 * GET /api/admin/hackathons/[id]
 * Get a single hackathon with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

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
                    email: true,
                    image: true,
                  },
                },
              },
            },
            project: true,
          },
        },
        projects: {
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

    return NextResponse.json({ hackathon })
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/hackathons/[id]
 * Update a hackathon
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params

    // Check if hackathon exists
    const existing = await prisma.hackathon.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    const validation = await validateAPIRequest(request, updateHackathonSchema)
    if (!validation.success) return validation.response

    const data = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.theme !== undefined) updateData.theme = data.theme
    if (data.maxTeamSize !== undefined) updateData.maxTeamSize = data.maxTeamSize
    if (data.status !== undefined) updateData.status = data.status
    if (data.prizes !== undefined) updateData.prizes = data.prizes
    if (data.judges !== undefined) updateData.judges = data.judges
    if (data.sponsors !== undefined) updateData.sponsors = data.sponsors
    if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage

    // Handle dates
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
    if (data.registrationDeadline !== undefined)
      updateData.registrationDeadline = new Date(data.registrationDeadline)

    // Validate date logic if dates are provided
    const startDate = (updateData.startDate as Date) || existing.startDate
    const endDate = (updateData.endDate as Date) || existing.endDate
    const registrationDeadline =
      (updateData.registrationDeadline as Date) || existing.registrationDeadline

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Datum konce musí být po datu začátku' },
        { status: 400 }
      )
    }

    if (registrationDeadline >= startDate) {
      return NextResponse.json(
        { error: 'Deadline registrace musí být před datem začátku' },
        { status: 400 }
      )
    }

    const hackathon = await prisma.hackathon.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ hackathon })
  } catch (error) {
    console.error('Error updating hackathon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/hackathons/[id]
 * Delete a hackathon
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params

    // Check if hackathon exists
    const existing = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { teams: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Warn if there are teams (cascade delete will remove them)
    if (existing._count.teams > 0) {
      console.log(`Deleting hackathon ${id} with ${existing._count.teams} teams`)
    }

    await prisma.hackathon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hackathon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
