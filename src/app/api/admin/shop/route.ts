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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
