import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { notFound, serverError } from '@/lib/api-responses'
import { activeStatusSchema, validateAPIRequest } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const validation = await validateAPIRequest(request, activeStatusSchema)
    if (!validation.success) return validation.response

    const existingQuest = await prisma.quest.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!existingQuest) {
      return notFound('Quest not found')
    }

    const quest = await prisma.quest.update({
      where: { id: params.id },
      data: { isActive: validation.data.isActive },
    })

    return NextResponse.json({ quest })
  } catch (error) {
    console.error('Error updating quest:', error)
    return serverError()
  }
}
