import { Role } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { NextResponse } from 'next/server'

/**
 * Role hierarchy and permissions
 */

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: Role[] = ['USER', 'JUDGE', 'TEAM_LEADER', 'ADMIN']

// Permission definitions
export type Permission =
  | 'read:chapters'
  | 'write:chapters'
  | 'read:users'
  | 'write:users'
  | 'read:hackathons'
  | 'write:hackathons'
  | 'judge:hackathons'
  | 'read:analytics'
  | 'write:analytics'
  | 'manage:shop'
  | 'manage:quests'
  | 'manage:leagues'
  | 'manage:system'

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: ['read:chapters'],
  JUDGE: ['read:chapters', 'read:hackathons', 'judge:hackathons'],
  TEAM_LEADER: ['read:chapters', 'read:hackathons', 'judge:hackathons', 'read:users'],
  ADMIN: [
    'read:chapters',
    'write:chapters',
    'read:users',
    'write:users',
    'read:hackathons',
    'write:hackathons',
    'judge:hackathons',
    'read:analytics',
    'write:analytics',
    'manage:shop',
    'manage:quests',
    'manage:leagues',
    'manage:system',
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if roleA has at least the same level as roleB
 */
export function isRoleAtLeast(roleA: Role, roleB: Role): boolean {
  const indexA = ROLE_HIERARCHY.indexOf(roleA)
  const indexB = ROLE_HIERARCHY.indexOf(roleB)
  return indexA >= indexB
}

/**
 * Get all permissions for a role (including inherited from lower roles)
 */
export function getAllPermissions(role: Role): Permission[] {
  const roleIndex = ROLE_HIERARCHY.indexOf(role)
  const permissions = new Set<Permission>()

  for (let i = 0; i <= roleIndex; i++) {
    const r = ROLE_HIERARCHY[i]
    if (r) {
      ROLE_PERMISSIONS[r]?.forEach(p => permissions.add(p))
    }
  }

  return Array.from(permissions)
}

/**
 * Middleware helper to check role/permission in API routes
 */
export async function requireRole(minRole: Role): Promise<{
  authorized: boolean
  user?: { id: string; role: Role; isAdmin: boolean }
  error?: NextResponse
}> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isAdmin: true },
  })

  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
    }
  }

  // isAdmin flag overrides role checks
  if (user.isAdmin) {
    return { authorized: true, user: { ...user, role: 'ADMIN' } }
  }

  if (!isRoleAtLeast(user.role, minRole)) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { authorized: true, user }
}

/**
 * Middleware helper to check specific permission
 */
export async function requirePermission(permission: Permission): Promise<{
  authorized: boolean
  user?: { id: string; role: Role; isAdmin: boolean }
  error?: NextResponse
}> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isAdmin: true },
  })

  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
    }
  }

  // isAdmin has all permissions
  if (user.isAdmin) {
    return { authorized: true, user: { ...user, role: 'ADMIN' } }
  }

  if (!hasPermission(user.role, permission)) {
    return {
      authorized: false,
      error: NextResponse.json({ error: `Missing permission: ${permission}` }, { status: 403 }),
    }
  }

  return { authorized: true, user }
}

/**
 * Client-side hook helper - check if current user has permission
 * (Use with caution - always verify on server)
 */
export function canUserAccess(
  userRole: Role | undefined,
  isAdmin: boolean | undefined,
  permission: Permission
): boolean {
  if (isAdmin) return true
  if (!userRole) return false
  return hasPermission(userRole, permission)
}
