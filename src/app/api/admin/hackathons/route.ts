import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, createHackathonSchema } from '@/lib/validation-schemas'

/**
 * GET /api/admin/hackathons
 * Get all hackathons with pagination and filtering
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { theme: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status && ['upcoming', 'active', 'completed'].includes(status)) {
      where.status = status
    }

    // Get total count for pagination
    const total = await prisma.hackathon.count({ where })

    // Get hackathons with team counts
    const hackathons = await prisma.hackathon.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            teams: true,
            projects: true,
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
        createdAt: hackathon.createdAt,
        updatedAt: hackathon.updatedAt,
        stats: {
          teams: hackathon._count.teams,
          projects: hackathon._count.projects,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/hackathons
 * Create a new hackathon
 */
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const validation = await validateAPIRequest(request, createHackathonSchema)
    if (!validation.success) return validation.response

    const data = validation.data

    // Validate date logic
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const registrationDeadline = new Date(data.registrationDeadline)

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

    const hackathon = await prisma.hackathon.create({
      data: {
        title: data.title,
        description: data.description,
        theme: data.theme,
        startDate,
        endDate,
        registrationDeadline,
        maxTeamSize: data.maxTeamSize,
        status: data.status,
        prizes: data.prizes,
        judges: data.judges,
        sponsors: data.sponsors,
        bannerImage: data.bannerImage,
      },
    })

    return NextResponse.json({ hackathon }, { status: 201 })
  } catch (error) {
    console.error('Error creating hackathon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
