import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, username, password } = body

    // Validace
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Vyplňte všechna povinná pole' },
        { status: 400 }
      )
    }

    // Kontrola, zda uživatel již existuje
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Uživatelské jméno'
      return NextResponse.json(
        { error: `${field} je již používáno` },
        { status: 400 }
      )
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
      }
    })

    return NextResponse.json(
      { 
        message: 'Uživatel byl úspěšně vytvořen',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Při registraci došlo k chybě' },
      { status: 500 }
    )
  }
}