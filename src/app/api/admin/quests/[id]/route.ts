import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()

    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
    }

    const existingQuest = await prisma.quest.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!existingQuest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    const quest = await prisma.quest.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    })

    return NextResponse.json({ quest })
  } catch (error) {
    console.error('Error updating quest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
