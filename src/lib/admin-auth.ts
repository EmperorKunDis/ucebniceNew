import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Middleware to require admin authentication
 * Returns null if user is admin, or an error response if not
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return null
}

/**
 * Check if current user is admin (without throwing error)
 * Returns boolean indicating admin status
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    return user?.isAdmin || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
