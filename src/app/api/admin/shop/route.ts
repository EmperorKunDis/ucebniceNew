import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const items = await prisma.shopItem.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching shop items:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
