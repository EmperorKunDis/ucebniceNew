import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/api-middleware'
import { authLimiter } from '@/lib/rate-limit'

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email, username, and password. Rate limited to 10 attempts per 15 minutes per IP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's display name (optional)
 *                 example: Jan Novák
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: jan.novak@example.com
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: jannovak
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed)
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Uživatel byl úspěšně vytvořen
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *             description: Request limit per window
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *             description: Requests remaining
 *           X-RateLimit-Reset:
 *             schema:
 *               type: integer
 *             description: Time when limit resets (Unix timestamp)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (10 attempts per 15 minutes per IP)
    const rateLimitResponse = await applyRateLimit(req, authLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await req.json()
    const { name, email, username, password } = body

    // Validace
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Vyplňte všechna povinná pole' }, { status: 400 })
    }

    // Kontrola, zda uživatel již existuje
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Uživatelské jméno'
      return NextResponse.json({ error: `${field} je již používáno` }, { status: 400 })
    }

    // Hashování hesla
    const hashedPassword = await bcrypt.hash(password, 12)

    // Vytvoření uživatele
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Uživatel byl úspěšně vytvořen',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Při registraci došlo k chybě' }, { status: 500 })
  }
}
