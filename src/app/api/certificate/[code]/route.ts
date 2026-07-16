import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCertificatePDF } from '@/lib/certificate-generator'

interface RouteParams {
  params: Promise<{ code: string }>
}

/**
 * GET /api/certificate/[code]
 * Download certificate PDF by unique code
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params

    // Find certificate
    const certificate = await prisma.certificate.findUnique({
      where: { uniqueCode: code },
      include: {
        user: {
          select: { name: true, xp: true },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(
      {
        userId: certificate.userId,
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        courseLevel: certificate.courseLevel as 'foundation' | 'advanced',
        completedAt: certificate.completedAt,
        totalXP: certificate.totalXP,
        totalChapters: certificate.totalChapters,
        averageScore: certificate.averageScore || undefined,
      },
      certificate.uniqueCode
    )

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${code}.pdf"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error downloading certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
