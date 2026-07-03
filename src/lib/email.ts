/**
 * Email Service for Verification
 *
 * Uses Postmark for sending emails (praut.cz is a verified sender domain)
 * Fallback: console.log for development (when token is missing)
 */

import { prisma } from './prisma'
import { randomBytes } from 'crypto'

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN
const FROM_EMAIL = process.env.EMAIL_FROM || 'Učebnice AI <ucebnice@praut.cz>'

function getAppUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000'

  return configuredUrl.replace(/\/$/, '')
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send email using Postmark API
 */
async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!POSTMARK_SERVER_TOKEN) {
    console.log('📧 [DEV MODE] Email would be sent:')
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body: ${html.substring(0, 200)}...`)
    return true
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: to,
        Subject: subject,
        HtmlBody: html,
        MessageStream: 'outbound',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Postmark API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create and store verification token
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  })

  // Create new token
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, name?: string): Promise<boolean> {
  const token = await createVerificationToken(email)
  const verificationUrl = `${getAppUrl()}/verify-email?token=${token}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ověř svůj email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1a2e; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #a855f7; margin: 0; font-size: 28px;">🎓 Učebnice AI</h1>
    </div>
    
    <h2 style="color: #ffffff; margin-bottom: 20px;">Ahoj${name ? ` ${name}` : ''}!</h2>
    
    <p style="color: #a0a0a0; line-height: 1.6; margin-bottom: 25px;">
      Děkujeme za registraci do Učebnice programování AI! 
      Pro aktivaci tvého účtu a přístup ke všem kapitolám prosím ověř svůj email.
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verificationUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #a855f7, #6366f1); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        ✅ Ověřit email
      </a>
    </div>
    
    <p style="color: #666666; font-size: 14px; line-height: 1.5;">
      Nebo zkopíruj tento odkaz do prohlížeče:<br>
      <a href="${verificationUrl}" style="color: #a855f7; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #2a2a4a; margin: 30px 0;">
    
    <p style="color: #666666; font-size: 12px; text-align: center;">
      Tento odkaz vyprší za 24 hodin.<br>
      Pokud jsi se neregistroval/a, tento email ignoruj.
    </p>
  </div>
</body>
</html>
  `.trim()

  return sendEmail({
    to: email,
    subject: '✅ Ověř svůj email - Učebnice AI',
    html,
  })
}

/**
 * Verify email token
 */
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { success: false, error: 'Neplatný ověřovací odkaz' }
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } })
    return { success: false, error: 'Ověřovací odkaz vypršel' }
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() },
  })

  // Delete used token
  await prisma.emailVerificationToken.delete({ where: { token } })

  return { success: true, email: verificationToken.email }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  })

  return !!user?.emailVerified
}

/**
 * Get chapter access limit for unverified users
 */
export const UNVERIFIED_CHAPTER_LIMIT = 3
