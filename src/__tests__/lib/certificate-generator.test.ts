jest.mock('@/lib/prisma', () => ({
  prisma: {
    certificate: { create: jest.fn() },
  },
}))

jest.mock('fs/promises', () => ({
  __esModule: true,
  default: { readFile: jest.fn().mockResolvedValue(Buffer.from('background')) },
}))

jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,AA==') },
}))

jest.mock('pdf-lib', () => {
  const page = {
    drawImage: jest.fn(),
    drawText: jest.fn(),
  }
  const font = { widthOfTextAtSize: jest.fn((text: string) => text.length) }
  const document = {
    addPage: jest.fn(() => page),
    embedPng: jest.fn().mockResolvedValue({}),
    embedFont: jest.fn().mockResolvedValue(font),
    save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  }

  return {
    PDFDocument: { create: jest.fn().mockResolvedValue(document) },
    rgb: jest.fn(() => ({})),
    StandardFonts: {
      Helvetica: 'Helvetica',
      TimesRoman: 'TimesRoman',
      TimesRomanBold: 'TimesRomanBold',
    },
    __mockPage: page,
  }
})

import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import * as PdfLib from 'pdf-lib'
import { createCertificate } from '@/lib/certificate-generator'

const mockCertificateCreate = prisma.certificate.create as jest.Mock
const mockQrToDataUrl = QRCode.toDataURL as jest.Mock
const mockDrawText = (PdfLib as unknown as { __mockPage: { drawText: jest.Mock } }).__mockPage
  .drawText

describe('certificate generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCertificateCreate.mockImplementation(async ({ data }) => ({ id: 'certificate-1', ...data }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses the database certificate code in the printed number and verification QR', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789)

    const { certificate } = await createCertificate({
      userId: 'user-1',
      userName: 'Test Student',
      courseTitle: 'Učebnice programování AI',
      courseLevel: 'foundation',
      completedAt: new Date('2026-01-01T00:00:00.000Z'),
      totalXP: 123,
      totalChapters: 40,
    })

    const databaseInput = mockCertificateCreate.mock.calls[0]?.[0].data
    expect(certificate.uniqueCode).toBe(databaseInput.uniqueCode)
    expect(mockDrawText).toHaveBeenCalledWith(
      `Číslo: ${databaseInput.uniqueCode}`,
      expect.any(Object)
    )
    expect(mockQrToDataUrl).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`/verify-certificate/${databaseInput.uniqueCode}$`)),
      expect.any(Object)
    )
  })
})
