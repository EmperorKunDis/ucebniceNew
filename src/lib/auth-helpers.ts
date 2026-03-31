import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'
import { prisma } from './prisma'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  isAdmin?: boolean
}

export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; response: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 }),
    }
  }

  return {
    success: true,
    user: session.user as AuthenticatedUser,
  }
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 }),
    }
  }

  return auth
}
