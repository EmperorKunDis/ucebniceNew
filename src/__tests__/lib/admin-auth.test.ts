import { getServerSession } from 'next-auth'
import { requireAdmin as requireAdminResponse } from '@/lib/admin-auth'
import { requireAdmin as requireAdminResult } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.Mock
const mockFindUser = (prisma as unknown as { user: { findUnique: jest.Mock } }).user.findUnique

describe('admin authorization compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'admin@example.com' },
    })
  })

  it('accepts role ADMIN even when the legacy flag is false', async () => {
    mockFindUser.mockResolvedValue({ role: 'ADMIN', isAdmin: false })

    await expect(requireAdminResponse()).resolves.toBeNull()
    await expect(requireAdminResult()).resolves.toMatchObject({ success: true })
  })

  it('keeps isAdmin as a Release A fallback', async () => {
    mockFindUser.mockResolvedValue({ role: 'USER', isAdmin: true })

    await expect(requireAdminResponse()).resolves.toBeNull()
    await expect(requireAdminResult()).resolves.toMatchObject({ success: true })
  })

  it('rejects a non-admin user', async () => {
    mockFindUser.mockResolvedValue({ role: 'USER', isAdmin: false })

    const response = await requireAdminResponse()
    const result = await requireAdminResult()

    expect(response?.status).toBe(403)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.response.status).toBe(403)
  })
})
