import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCertificate, checkCertificateEligibility } from '@/lib/certificate-generator'

/**
 * GET /api/certificate
 * Check eligibility and get existing certificate
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check eligibility
    const eligibility = await checkCertificateEligibility(userId)

    // Check for existing certificate
    const existingCertificate = await prisma.certificate.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    })

    return NextResponse.json({
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      completedChapters: eligibility.completedChapters,
      requiredChapters: eligibility.requiredChapters,
      certificate: existingCertificate
        ? {
            id: existingCertificate.id,
            uniqueCode: existingCertificate.uniqueCode,
            completedAt: existingCertificate.completedAt,
            downloadUrl: `/api/certificate/${existingCertificate.uniqueCode}`,
            verificationUrl: existingCertificate.verificationUrl,
          }
        : null,
    })
  } catch (error) {
    console.error('Error checking certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/certificate
 * Generate new certificate
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check eligibility
    const eligibility = await checkCertificateEligibility(userId)

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason || 'Not eligible for certificate',
          eligible: false,
        },
        { status: 400 }
      )
    }

    // Check if already has certificate
    const existingCertificate = await prisma.certificate.findFirst({
      where: { userId },
    })

    if (existingCertificate) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificate: {
          id: existingCertificate.id,
          uniqueCode: existingCertificate.uniqueCode,
          downloadUrl: `/api/certificate/${existingCertificate.uniqueCode}`,
        },
      })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, xp: true },
    })

    // Create certificate
    const userName = user?.name || session.user.email?.split('@')[0] || 'Student'
    const { certificate } = await createCertificate({
      userId,
      userName,
      courseTitle: 'Učebnice programování AI',
      courseLevel: 'foundation',
      completedAt: new Date(),
      totalXP: user?.xp || 0,
      totalChapters: eligibility.completedChapters,
    })

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully!',
      certificate: {
        id: certificate.id,
        uniqueCode: certificate.uniqueCode,
        downloadUrl: certificate.pdfPath,
      },
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
