import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { notFound, serverError } from '@/lib/api-responses'
import { activeStatusSchema, validateAPIRequest } from '@/lib/validation-schemas'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const validation = await validateAPIRequest(request, activeStatusSchema)
    if (!validation.success) return validation.response

    const existingItem = await prisma.shopItem.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingItem) {
      return notFound('Shop item not found')
    }

    const item = await prisma.shopItem.update({
      where: { id },
      data: { isActive: validation.data.isActive },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating shop item:', error)
    return serverError()
  }
}
