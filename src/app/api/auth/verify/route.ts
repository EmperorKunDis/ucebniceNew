import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken, sendVerificationEmail } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/verify?token=xxx
 * Verify email with token
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const result = await verifyEmailToken(token)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: 'Email byl úspěšně ověřen!',
    email: result.email,
  })
}

/**
 * POST /api/auth/verify
 * Resend verification email
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already verified
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true, name: true },
    })

    if (user?.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email je již ověřen',
          alreadyVerified: true,
        },
        { status: 400 }
      )
    }

    // Send verification email
    const sent = await sendVerificationEmail(session.user.email, user?.name || undefined)

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Ověřovací email byl odeslán',
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
