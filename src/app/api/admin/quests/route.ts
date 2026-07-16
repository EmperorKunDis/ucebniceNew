import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const quests = await prisma.quest.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { userQuests: true },
        },
      },
    })

    return NextResponse.json({ quests })
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
