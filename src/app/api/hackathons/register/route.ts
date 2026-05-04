import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAPIRequest, hackathonRegistrationSchema } from '@/lib/validation-schemas'

/**
 * POST /api/hackathons/register
 * Public endpoint - no auth required
 */
export async function POST(request: Request) {
  const validation = await validateAPIRequest(request, hackathonRegistrationSchema)
  if (!validation.success) return validation.response

  const data = validation.data

  try {
    // Check hackathon exists and is open for registration
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: data.hackathonId },
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon nenalezen' }, { status: 404 })
    }

    if (hackathon.status === 'completed') {
      return NextResponse.json({ error: 'Hackathon již skončil' }, { status: 400 })
    }

    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return NextResponse.json({ error: 'Registrace již byla uzavřena' }, { status: 400 })
    }

    // Create registration (upsert to handle duplicate emails gracefully)
    const registration = await prisma.hackathonRegistration.upsert({
      where: {
        hackathonId_email: { hackathonId: data.hackathonId, email: data.email },
      },
      update: {
        fullName: data.fullName,
        phone: data.phone || null,
        school: data.school || null,
        yearOfStudy: data.yearOfStudy || null,
        experience: data.experience,
        technologies: data.technologies || [],
        github: data.github || null,
        linkedIn: data.linkedIn || null,
        preferredRole: data.preferredRole || null,
        motivation: data.motivation || null,
        teamPreference: data.teamPreference || 'solo',
        teamName: data.teamName || null,
        tshirtSize: data.tshirtSize || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        specialNeeds: data.specialNeeds || null,
        howDidYouHear: data.howDidYouHear || null,
        previousHackathons: data.previousHackathons || null,
        gdprConsent: data.gdprConsent,
      },
      create: {
        hackathonId: data.hackathonId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        school: data.school || null,
        yearOfStudy: data.yearOfStudy || null,
        experience: data.experience,
        technologies: data.technologies || [],
        github: data.github || null,
        linkedIn: data.linkedIn || null,
        preferredRole: data.preferredRole || null,
        motivation: data.motivation || null,
        teamPreference: data.teamPreference || 'solo',
        teamName: data.teamName || null,
        tshirtSize: data.tshirtSize || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        specialNeeds: data.specialNeeds || null,
        howDidYouHear: data.howDidYouHear || null,
        previousHackathons: data.previousHackathons || null,
        gdprConsent: data.gdprConsent,
      },
    })

    return NextResponse.json(
      { message: 'Registrace proběhla úspěšně', id: registration.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Nastala chyba při registraci' }, { status: 500 })
  }
}
