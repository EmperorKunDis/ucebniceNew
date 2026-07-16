/**
 * Certificate Generator
 *
 * Generates PDF certificates for course completion
 * Based on CertifikatFRnDA.png template (1413x2000 portrait)
 */

import { prisma } from './prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs/promises'
import { canonicalChapterIdsThrough } from './canonical-content-keys'

const APP_URL = process.env.NEXTAUTH_URL || 'https://ucebnice.ai'

// Certificate dimensions from layout.json
const CERT_WIDTH = 1413
const CERT_HEIGHT = 2000

// Writable zones
const MAIN_TEXT_ZONE = { x1: 100, y1: 140, x2: 1313, y2: 1470 }
const LEFT_OF_SEAL_ZONE = { x1: 80, y1: 1500, x2: 500, y2: 1880 }

interface CertificateData {
  userId: string
  userName: string
  courseTitle: string
  courseLevel: 'foundation' | 'advanced'
  completedAt: Date
  totalXP: number
  totalChapters: number
  averageScore?: number
}

/**
 * Generate unique certificate code
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${year}-${random}`
}

/**
 * Load background image
 */
async function loadBackgroundImage(): Promise<Buffer | null> {
  const imagePath = path.join(process.cwd(), 'src/assets/certificate/CertifikatFRnDA.png')

  try {
    return await fs.readFile(imagePath)
  } catch (err) {
    console.error('Failed to load certificate background:', err)
    return null
  }
}

/**
 * Generate certificate PDF
 */
export async function generateCertificatePDF(
  data: CertificateData,
  certificateCode: string
): Promise<Buffer> {
  const backgroundImage = await loadBackgroundImage()

  // Create PDF document
  const pdfDoc = await PDFDocument.create()

  // Calculate page size maintaining aspect ratio
  // PDF uses points (72 per inch), we'll scale to fit A4-ish
  const scale = 0.5 // Scale down for reasonable PDF size
  const pageWidth = CERT_WIDTH * scale
  const pageHeight = CERT_HEIGHT * scale

  const page = pdfDoc.addPage([pageWidth, pageHeight])

  // Embed background image if exists
  if (backgroundImage) {
    const bgImage = await pdfDoc.embedPng(backgroundImage)
    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    })
  }

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Scale factor for positioning
  const scaleX = pageWidth / CERT_WIDTH
  const scaleY = pageHeight / CERT_HEIGHT

  // Helper function to convert y coordinate (layout uses top-left origin, PDF uses bottom-left)
  const toY = (layoutY: number) => pageHeight - layoutY * scaleY

  // Colors
  const goldColor = rgb(0.72, 0.53, 0.04) // #B8860B
  const darkColor = rgb(0.1, 0.1, 0.15)
  const grayColor = rgb(0.4, 0.4, 0.4)

  // ========== MAIN TEXT AREA ==========
  const centerX = ((MAIN_TEXT_ZONE.x1 + MAIN_TEXT_ZONE.x2) / 2) * scaleX
  let currentY = 200 // Starting Y position in layout coords

  // Title: "CERTIFIKÁT"
  const titleSize = 48 * scale
  const titleText = 'CERTIFIKÁT'
  const titleWidth = timesRomanBold.widthOfTextAtSize(titleText, titleSize)
  page.drawText(titleText, {
    x: centerX - titleWidth / 2,
    y: toY(currentY),
    size: titleSize,
    font: timesRomanBold,
    color: goldColor,
  })
  currentY += 80

  // Subtitle: "o absolvování kurzu"
  const subtitleSize = 20 * scale
  const subtitleText = 'o absolvování kurzu'
  const subtitleWidth = timesRoman.widthOfTextAtSize(subtitleText, subtitleSize)
  page.drawText(subtitleText, {
    x: centerX - subtitleWidth / 2,
    y: toY(currentY),
    size: subtitleSize,
    font: timesRoman,
    color: grayColor,
  })
  currentY += 100

  // Course title
  const courseTitleSize = 32 * scale
  const courseText = data.courseTitle
  const courseWidth = timesRomanBold.widthOfTextAtSize(courseText, courseTitleSize)
  page.drawText(courseText, {
    x: centerX - courseWidth / 2,
    y: toY(currentY),
    size: courseTitleSize,
    font: timesRomanBold,
    color: darkColor,
  })
  currentY += 120

  // "uděluje se"
  const awardedSize = 18 * scale
  const awardedText = 'uděluje se'
  const awardedWidth = timesRoman.widthOfTextAtSize(awardedText, awardedSize)
  page.drawText(awardedText, {
    x: centerX - awardedWidth / 2,
    y: toY(currentY),
    size: awardedSize,
    font: timesRoman,
    color: grayColor,
  })
  currentY += 80

  // User name (big, prominent)
  const nameSize = 42 * scale
  const nameText = data.userName
  const nameWidth = timesRomanBold.widthOfTextAtSize(nameText, nameSize)
  page.drawText(nameText, {
    x: centerX - nameWidth / 2,
    y: toY(currentY),
    size: nameSize,
    font: timesRomanBold,
    color: goldColor,
  })
  currentY += 120

  // Achievement description
  const descSize = 16 * scale
  const descLines = [
    'za úspěšné dokončení všech kapitol',
    `a získání ${data.totalXP.toLocaleString('cs-CZ')} XP bodů`,
    `s průměrným skóre ${data.averageScore ? Math.round(data.averageScore) + '%' : 'výborný'}`,
  ]

  for (const line of descLines) {
    const lineWidth = timesRoman.widthOfTextAtSize(line, descSize)
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y: toY(currentY),
      size: descSize,
      font: timesRoman,
      color: darkColor,
    })
    currentY += 35
  }

  currentY += 60

  // Course level badge
  const levelText =
    data.courseLevel === 'foundation'
      ? '📚 Základní kurz (40 kapitol)'
      : '🎓 Pokročilý kurz (50 kapitol)'
  const levelSize = 14 * scale
  const levelWidth = helvetica.widthOfTextAtSize(levelText.replace(/[📚🎓]/g, ''), levelSize)
  page.drawText(levelText.replace(/[📚🎓]/g, ''), {
    x: centerX - levelWidth / 2,
    y: toY(currentY),
    size: levelSize,
    font: helvetica,
    color: grayColor,
  })

  // ========== LEFT OF SEAL AREA ==========
  // Date
  const dateY = 1550
  const dateSize = 14 * scale
  const dateText = `Vydáno dne: ${data.completedAt.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`
  page.drawText(dateText, {
    x: LEFT_OF_SEAL_ZONE.x1 * scaleX,
    y: toY(dateY),
    size: dateSize,
    font: helvetica,
    color: darkColor,
  })

  // Certificate ID
  const idY = 1600
  const idSize = 12 * scale
  const idText = `Číslo: ${certificateCode}`
  page.drawText(idText, {
    x: LEFT_OF_SEAL_ZONE.x1 * scaleX,
    y: toY(idY),
    size: idSize,
    font: helvetica,
    color: grayColor,
  })

  // QR Code for verification (small, bottom left corner)
  try {
    const verificationUrl = `${APP_URL}/verify-certificate/${certificateCode}`
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 80,
      margin: 1,
      color: { dark: '#333333', light: '#ffffff' },
    })

    const qrImageData = qrDataUrl.replace(/^data:image\/png;base64,/, '')
    const qrImage = await pdfDoc.embedPng(Buffer.from(qrImageData, 'base64'))

    const qrSize = 60 * scale
    page.drawImage(qrImage, {
      x: LEFT_OF_SEAL_ZONE.x1 * scaleX,
      y: toY(1750),
      width: qrSize,
      height: qrSize,
    })

    // QR label
    page.drawText('Ověření:', {
      x: LEFT_OF_SEAL_ZONE.x1 * scaleX,
      y: toY(1660),
      size: 10 * scale,
      font: helvetica,
      color: grayColor,
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  }

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save()

  return Buffer.from(pdfBytes)
}

/**
 * Create and save certificate to database
 */
export async function createCertificate(data: CertificateData): Promise<{
  certificate: {
    id: string
    uniqueCode: string
    pdfPath: string
  }
  pdfBuffer: Buffer
}> {
  // Generate one code and use it consistently in the database, printed
  // certificate number and verification QR.
  const uniqueCode = generateCertificateCode()
  const pdfBuffer = await generateCertificatePDF(data, uniqueCode)

  // Save certificate record
  const certificate = await prisma.certificate.create({
    data: {
      uniqueCode,
      userId: data.userId,
      userName: data.userName,
      courseTitle: data.courseTitle,
      courseLevel: data.courseLevel,
      totalXP: data.totalXP,
      totalChapters: data.totalChapters,
      averageScore: data.averageScore,
      verificationUrl: `${APP_URL}/verify-certificate/${uniqueCode}`,
    },
  })

  return {
    certificate: {
      id: certificate.id,
      uniqueCode: certificate.uniqueCode,
      pdfPath: `/api/certificate/${certificate.uniqueCode}`,
    },
    pdfBuffer,
  }
}

/**
 * Check if user is eligible for certificate
 */
export async function checkCertificateEligibility(userId: string): Promise<{
  eligible: boolean
  reason?: string
  completedChapters: number
  requiredChapters: number
}> {
  const completedChapters = await prisma.chapterProgress.count({
    where: {
      userId,
      contentCompleted: true,
      chapter: { chapterId: { in: canonicalChapterIdsThrough() } },
    },
  })

  const requiredChapters = 40

  if (completedChapters < requiredChapters) {
    return {
      eligible: false,
      reason: `Musíš dokončit všech ${requiredChapters} kapitol. Máš ${completedChapters}/${requiredChapters}.`,
      completedChapters,
      requiredChapters,
    }
  }

  // Check if final test passed
  const finalTest = await prisma.finalTest.findUnique({
    where: { userId },
  })

  if (!finalTest?.passed) {
    return {
      eligible: false,
      reason: 'Musíš úspěšně složit finální test.',
      completedChapters,
      requiredChapters,
    }
  }

  return {
    eligible: true,
    completedChapters,
    requiredChapters,
  }
}
