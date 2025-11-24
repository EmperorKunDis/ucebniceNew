import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/chapters/[id]
 * Get a single chapter with full details
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: params.id },
      include: {
        completedBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        },
        progress: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({ chapter })
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/chapters/[id]
 * Update chapter details
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { chapterId, title, description, xpReward, difficulty, order } = body

    const chapter = await prisma.chapter.update({
      where: { id: params.id },
      data: {
        ...(chapterId !== undefined && { chapterId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(xpReward !== undefined && { xpReward }),
        ...(difficulty !== undefined && { difficulty }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ chapter })
  } catch (error) {
    console.error('Error updating chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/chapters/[id]
 * Delete a chapter
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    await prisma.chapter.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chapter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
