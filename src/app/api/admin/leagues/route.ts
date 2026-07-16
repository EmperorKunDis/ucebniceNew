import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const leagues = await prisma.league.findMany({
      orderBy: { tier: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    })

    return NextResponse.json({ leagues })
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
