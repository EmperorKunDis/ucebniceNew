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

    const existingItem = await prisma.shopItem.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Shop item not found' }, { status: 404 })
    }

    const item = await prisma.shopItem.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating shop item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
