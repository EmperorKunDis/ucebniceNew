import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST } from '@/app/api/progress/complete-questions/route'

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

const mockGetServerSession = getServerSession as jest.Mock

describe('/api/progress/complete-questions', () => {
  it('keeps the legacy write API read-only after the v2 cutover', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })

    const response = await POST({} as NextRequest)

    expect(response.status).toBe(410)
    await expect(response.json()).resolves.toMatchObject({
      canonicalEndpoint: '/api/exercises/:exerciseId/answer',
    })
  })
})
