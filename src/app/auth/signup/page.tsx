import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrace | Učebnice AI',
  description: 'Zaregistrujte se a začněte se učit programování s AI asistentem',
}

export default function SignUpPage() {
  // Server-side redirect to onboarding
  // Registration is now part of the onboarding flow
  redirect('/onboarding')
}
