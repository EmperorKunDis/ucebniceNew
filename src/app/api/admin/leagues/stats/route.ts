import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const [totalLeagues, totalMembers] = await Promise.all([
      prisma.league.count(),
      prisma.leagueMembership.count(),
    ])

    // Calculate current week boundaries
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    return NextResponse.json({
      totalLeagues,
      totalMembers,
      currentWeekStart: weekStart.toISOString(),
      currentWeekEnd: weekEnd.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching league stats:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
