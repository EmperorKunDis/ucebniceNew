import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
